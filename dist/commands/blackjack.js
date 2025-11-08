"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('blackjack')
    .setNameLocalizations({ ko: '블랙잭' })
    .setDescription('Play Blackjack with the bot')
    .setDescriptionLocalizations({ ko: '봇과 블랙잭을 합니다' });
async function execute(interaction) {
    const gameId = `${interaction.user.id}-${Date.now()}`;
    const deck = createDeck();
    const playerHand = [drawCard(deck), drawCard(deck)];
    const dealerHand = [drawCard(deck), drawCard(deck)];
    gameState_1.activeBlackjack.set(gameId, {
        userId: interaction.user.id,
        playerHand,
        dealerHand,
        deck,
        messageId: ''
    });
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`blackjack_hit_${gameId}`)
        .setLabel('🃏 히트 (카드 받기)')
        .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
        .setCustomId(`blackjack_stand_${gameId}`)
        .setLabel('✋ 스탠드 (멈추기)')
        .setStyle(discord_js_1.ButtonStyle.Danger));
    const playerTotal = calculateTotal(playerHand);
    const dealerVisible = dealerHand[0];
    let content = `🃏 블랙잭 게임!\n\n`;
    content += `당신의 패: ${formatHand(playerHand)} (총합: ${playerTotal})\n`;
    content += `딜러의 패: ${formatCard(dealerVisible)} [?]`;
    if (playerTotal === 21) {
        (0, stats_1.updateStat)(interaction.user.id, 'blackjack', { wins: 1 });
        await interaction.reply({
            content: `${content}\n\n🎉 블랙잭! 승리!`,
            components: []
        });
        gameState_1.activeBlackjack.delete(gameId);
        return;
    }
    const reply = await interaction.reply({
        content,
        components: [row],
        fetchReply: true
    });
    const game = gameState_1.activeBlackjack.get(gameId);
    if (game) {
        game.messageId = reply.id;
    }
    const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id && i.isButton(),
        time: 120000
    });
    collector.on('collect', async (i) => {
        const game = gameState_1.activeBlackjack.get(gameId);
        if (!game) {
            await i.update({ content: '게임을 찾을 수 없습니다.', components: [] });
            return;
        }
        const action = i.customId.split('_')[1];
        if (action === 'hit') {
            game.playerHand.push(drawCard(game.deck));
            const playerTotal = calculateTotal(game.playerHand);
            let content = `🃏 블랙잭 게임!\n\n`;
            content += `당신의 패: ${formatHand(game.playerHand)} (총합: ${playerTotal})\n`;
            content += `딜러의 패: ${formatCard(game.dealerHand[0])} [?]`;
            if (playerTotal > 21) {
                collector.stop();
                (0, stats_1.updateStat)(interaction.user.id, 'blackjack', { losses: 1 });
                content += `\n\n💥 버스트! 패배!`;
                await i.update({ content, components: [] });
                gameState_1.activeBlackjack.delete(gameId);
                return;
            }
            await i.update({ content, components: [row] });
        }
        else if (action === 'stand') {
            collector.stop();
            let dealerTotal = calculateTotal(game.dealerHand);
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
                (0, stats_1.updateStat)(interaction.user.id, 'blackjack', { wins: 1 });
            }
            else if (playerTotal > dealerTotal) {
                result = '🎉 승리!';
                (0, stats_1.updateStat)(interaction.user.id, 'blackjack', { wins: 1 });
            }
            else if (playerTotal < dealerTotal) {
                result = '😢 패배!';
                (0, stats_1.updateStat)(interaction.user.id, 'blackjack', { losses: 1 });
            }
            else {
                result = '🤝 무승부!';
            }
            content += result;
            await i.update({ content, components: [] });
            gameState_1.activeBlackjack.delete(gameId);
        }
    });
    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            gameState_1.activeBlackjack.delete(gameId);
            await interaction.editReply({
                content: '게임 시간이 초과되었습니다.',
                components: []
            });
        }
    });
}
function createDeck() {
    const deck = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 1; j <= 13; j++) {
            deck.push(j);
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
function drawCard(deck) {
    return deck.pop() || 1;
}
function calculateTotal(hand) {
    let total = 0;
    let aces = 0;
    for (const card of hand) {
        if (card === 1) {
            aces++;
            total += 11;
        }
        else if (card > 10) {
            total += 10;
        }
        else {
            total += card;
        }
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}
function formatCard(card) {
    const suits = ['♠', '♥', '♦', '♣'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    if (card === 1)
        return `A${suit}`;
    if (card === 11)
        return `J${suit}`;
    if (card === 12)
        return `Q${suit}`;
    if (card === 13)
        return `K${suit}`;
    return `${card}${suit}`;
}
function formatHand(hand) {
    return hand.map(card => formatCard(card)).join(' ');
}
