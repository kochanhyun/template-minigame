import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { activeBlackjack } from '../gameState';
import { updateStat } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('blackjack')
    .setNameLocalizations({ ko: '블랙잭' })
    .setDescription('Play Blackjack with the bot')
    .setDescriptionLocalizations({ ko: '봇과 블랙잭을 합니다' });

/**
 * blackjack 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const gameId = `${interaction.user.id}-${Date.now()}`;
    const deck = createDeck();
    
    const playerHand = [drawCard(deck), drawCard(deck)];
    const dealerHand = [drawCard(deck), drawCard(deck)];
    
    activeBlackjack.set(gameId, {
        userId: interaction.user.id,
        playerHand,
        dealerHand,
        deck,
        messageId: ''
    });
    
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`blackjack_hit_${gameId}`)
                .setLabel('🃏 히트 (카드 받기)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`blackjack_stand_${gameId}`)
                .setLabel('✋ 스탠드 (멈추기)')
                .setStyle(ButtonStyle.Danger)
        );
    
    const playerTotal = calculateTotal(playerHand);
    const dealerVisible = dealerHand[0];
    
    let content = `🃏 블랙잭 게임!\n\n`;
    content += `당신의 패: ${formatHand(playerHand)} (총합: ${playerTotal})\n`;
    content += `딜러의 패: ${formatCard(dealerVisible)} [?]`;
    
    if (playerTotal === 21) {
        // 블랙잭!
        updateStat(interaction.user.id, 'blackjack', { wins: 1 });
        await interaction.reply({
            content: `${content}\n\n🎉 블랙잭! 승리!`,
            components: []
        });
        activeBlackjack.delete(gameId);
        return;
    }
    
    const reply = await interaction.reply({
        content,
        components: [row],
        fetchReply: true
    });
    
    const game = activeBlackjack.get(gameId);
    if (game) {
        game.messageId = reply.id;
    }
    
    const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id && i.isButton(),
        time: 120000 // 2분
    });
    
    collector.on('collect', async (i: ButtonInteraction) => {
        const game = activeBlackjack.get(gameId);
        if (!game) {
            await i.update({ content: '게임을 찾을 수 없습니다.', components: [] });
            return;
        }
        
        const action = i.customId.split('_')[1];
        
        if (action === 'hit') {
            // 카드 받기
            game.playerHand.push(drawCard(game.deck));
            const playerTotal = calculateTotal(game.playerHand);
            
            let content = `🃏 블랙잭 게임!\n\n`;
            content += `당신의 패: ${formatHand(game.playerHand)} (총합: ${playerTotal})\n`;
            content += `딜러의 패: ${formatCard(game.dealerHand[0])} [?]`;
            
            if (playerTotal > 21) {
                // 버스트
                collector.stop();
                updateStat(interaction.user.id, 'blackjack', { losses: 1 });
                content += `\n\n💥 버스트! 패배!`;
                await i.update({ content, components: [] });
                activeBlackjack.delete(gameId);
                return;
            }
            
            await i.update({ content, components: [row] });
            
        } else if (action === 'stand') {
            // 딜러 차례
            collector.stop();
            
            let dealerTotal = calculateTotal(game.dealerHand);
            
            // 딜러는 17 이상이 될 때까지 카드를 받음
            while (dealerTotal < 17) {
                game.dealerHand.push(drawCard(game.deck));
                dealerTotal = calculateTotal(game.dealerHand);
            }
            
            const playerTotal = calculateTotal(game.playerHand);
            
            let content = `🃏 블랙잭 게임 종료!\n\n`;
            content += `당신의 패: ${formatHand(game.playerHand)} (총합: ${playerTotal})\n`;
            content += `딜러의 패: ${formatHand(game.dealerHand)} (총합: ${dealerTotal})\n\n`;
            
            let result = '';
            if (dealerTotal > 21) {
                result = '🎉 딜러 버스트! 승리!';
                updateStat(interaction.user.id, 'blackjack', { wins: 1 });
            } else if (playerTotal > dealerTotal) {
                result = '🎉 승리!';
                updateStat(interaction.user.id, 'blackjack', { wins: 1 });
            } else if (playerTotal < dealerTotal) {
                result = '😢 패배!';
                updateStat(interaction.user.id, 'blackjack', { losses: 1 });
            } else {
                result = '🤝 무승부!';
            }
            
            content += result;
            await i.update({ content, components: [] });
            activeBlackjack.delete(gameId);
        }
    });
    
    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            activeBlackjack.delete(gameId);
            await interaction.editReply({
                content: '게임 시간이 초과되었습니다.',
                components: []
            });
        }
    });
}

function createDeck(): number[] {
    const deck: number[] = [];
    // 1-13을 4번씩 (4벌)
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= 13; j++) {
            deck.push(j);
        }
    }
    // 셔플
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function drawCard(deck: number[]): number {
    return deck.pop() || 1;
}

function calculateTotal(hand: number[]): number {
    let total = 0;
    let aces = 0;
    
    for (const card of hand) {
        if (card === 1) {
            aces++;
            total += 11;
        } else if (card > 10) {
            total += 10;
        } else {
            total += card;
        }
    }
    
    // 에이스를 1로 계산해야 하는 경우
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    
    return total;
}

function formatCard(card: number): string {
    const suits = ['♠', '♥', '♦', '♣'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    
    if (card === 1) return `A${suit}`;
    if (card === 11) return `J${suit}`;
    if (card === 12) return `Q${suit}`;
    if (card === 13) return `K${suit}`;
    return `${card}${suit}`;
}

function formatHand(hand: number[]): string {
    return hand.map(card => formatCard(card)).join(' ');
}
