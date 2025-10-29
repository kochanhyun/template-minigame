import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, User } from 'discord.js';
import { activeTicTacToe } from '../gameState';
import { updateStat } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('tic-tac-toe')
    .setNameLocalizations({ ko: '틱택토' })
    .setDescription('Play Tic-Tac-Toe')
    .setDescriptionLocalizations({ ko: '틱택토 게임을 시작합니다' })
    .addUserOption(option =>
        option
            .setName('opponent')
            .setNameLocalizations({ ko: '상대' })
            .setDescription('Select an opponent (leave empty to play vs bot)')
            .setDescriptionLocalizations({ ko: '상대를 선택하세요 (비워두면 봇과 대결)' })
            .setRequired(false)
    );

/**
 * tic-tac-toe 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const opponent = interaction.options.getUser('opponent');
    
    if (opponent && opponent.bot) {
        await interaction.reply({ content: '봇과는 대결할 수 없습니다!', ephemeral: true });
        return;
    }
    
    if (opponent && opponent.id === interaction.user.id) {
        await interaction.reply({ content: '자기 자신과는 대결할 수 없습니다!', ephemeral: true });
        return;
    }
    
    const gameId = `${interaction.channelId}-${Date.now()}`;
    const player1 = interaction.user.id;
    const player2 = opponent?.id || 'bot';
    
    activeTicTacToe.set(gameId, {
        player1,
        player2,
        board: Array(9).fill(null),
        currentTurn: player1,
        messageId: ''
    });
    
    const components = createBoard(gameId);
    const opponentName = opponent ? `<@${opponent.id}>` : '봇';
    
    const reply = await interaction.reply({
        content: `⭕❌ 틱택토 게임!\n<@${player1}> (⭕) vs ${opponentName} (❌)\n\n현재 차례: <@${player1}>`,
        components,
        fetchReply: true
    });
    
    const game = activeTicTacToe.get(gameId);
    if (game) {
        game.messageId = reply.id;
    }
    
    const collector = reply.createMessageComponentCollector({
        filter: (i) => {
            if (!i.isButton()) return false;
            const currentGame = activeTicTacToe.get(gameId);
            if (!currentGame) return false;
            
            if (currentGame.player2 === 'bot') {
                return i.user.id === currentGame.player1;
            }
            return i.user.id === currentGame.currentTurn;
        },
        time: 300000 // 5분
    });
    
    collector.on('collect', async (i: ButtonInteraction) => {
        const position = parseInt(i.customId.split('_')[2]);
        const game = activeTicTacToe.get(gameId);
        
        if (!game) {
            await i.update({ content: '게임을 찾을 수 없습니다.', components: [] });
            return;
        }
        
        if (game.board[position] !== null) {
            await i.reply({ content: '이미 선택된 위치입니다!', ephemeral: true });
            return;
        }
        
        // 플레이어 움직임
        game.board[position] = game.currentTurn === game.player1 ? '⭕' : '❌';
        
        const winner = checkWinner(game.board);
        
        if (winner) {
            collector.stop();
            const winnerUser = winner === '⭕' ? game.player1 : game.player2;
            const loserUser = winner === '⭕' ? game.player2 : game.player1;
            
            // 통계 업데이트
            if (winnerUser !== 'bot') {
                updateStat(winnerUser, 'tictactoe', { wins: 1 });
            }
            if (loserUser !== 'bot') {
                updateStat(loserUser, 'tictactoe', { losses: 1 });
            }
            
            const winnerName = winnerUser === 'bot' ? '봇' : `<@${winnerUser}>`;
            await i.update({
                content: `⭕❌ 게임 종료!\n승자: ${winnerName} (${winner})`,
                components: createBoard(gameId, true)
            });
            activeTicTacToe.delete(gameId);
            return;
        }
        
        if (!game.board.includes(null)) {
            collector.stop();
            
            // 무승부 통계
            if (game.player1 !== 'bot') {
                updateStat(game.player1, 'tictactoe', { ties: 1 });
            }
            if (game.player2 !== 'bot') {
                updateStat(game.player2, 'tictactoe', { ties: 1 });
            }
            
            await i.update({
                content: '⭕❌ 게임 종료!\n결과: 무승부!',
                components: createBoard(gameId, true)
            });
            activeTicTacToe.delete(gameId);
            return;
        }
        
        // 턴 전환
        if (game.player2 === 'bot') {
            // 봇 차례
            const emptyPositions = game.board
                .map((val, idx) => val === null ? idx : -1)
                .filter(idx => idx !== -1);
            
            if (emptyPositions.length > 0) {
                const botMove = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                game.board[botMove] = '❌';
                
                const botWinner = checkWinner(game.board);
                
                if (botWinner) {
                    collector.stop();
                    const winnerName = botWinner === '⭕' ? `<@${game.player1}>` : '봇';
                    
                    if (botWinner === '❌') {
                        updateStat(game.player1, 'tictactoe', { losses: 1 });
                    } else {
                        updateStat(game.player1, 'tictactoe', { wins: 1 });
                    }
                    
                    await i.update({
                        content: `⭕❌ 게임 종료!\n승자: ${winnerName} (${botWinner})`,
                        components: createBoard(gameId, true)
                    });
                    activeTicTacToe.delete(gameId);
                    return;
                }
                
                if (!game.board.includes(null)) {
                    collector.stop();
                    updateStat(game.player1, 'tictactoe', { ties: 1 });
                    await i.update({
                        content: '⭕❌ 게임 종료!\n결과: 무승부!',
                        components: createBoard(gameId, true)
                    });
                    activeTicTacToe.delete(gameId);
                    return;
                }
            }
            
            await i.update({
                content: `⭕❌ 틱택토 게임!\n<@${game.player1}> (⭕) vs 봇 (❌)\n\n현재 차례: <@${game.player1}>`,
                components: createBoard(gameId)
            });
        } else {
            game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
            const opponentName = game.player2 === 'bot' ? '봇' : `<@${game.player2}>`;
            
            await i.update({
                content: `⭕❌ 틱택토 게임!\n<@${game.player1}> (⭕) vs ${opponentName} (❌)\n\n현재 차례: <@${game.currentTurn}>`,
                components: createBoard(gameId)
            });
        }
    });
    
    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            activeTicTacToe.delete(gameId);
            await interaction.editReply({
                content: '게임 시간이 초과되었습니다.',
                components: []
            });
        }
    });
}

function createBoard(gameId: string, disabled: boolean = false): ActionRowBuilder<ButtonBuilder>[] {
    const game = activeTicTacToe.get(gameId);
    const board = game?.board || Array(9).fill(null);
    
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    
    for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < 3; j++) {
            const position = i * 3 + j;
            const value = board[position];
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt_${gameId}_${position}`)
                    .setLabel(value || '　')
                    .setStyle(value ? ButtonStyle.Secondary : ButtonStyle.Primary)
                    .setDisabled(disabled || value !== null)
            );
        }
        rows.push(row);
    }
    
    return rows;
}

function checkWinner(board: (string | null)[]): string | null {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 가로
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 세로
        [0, 4, 8], [2, 4, 6] // 대각선
    ];
    
    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    return null;
}
