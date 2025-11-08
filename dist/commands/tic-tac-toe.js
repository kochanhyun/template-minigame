"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('tic-tac-toe')
    .setNameLocalizations({ ko: '틱택토' })
    .setDescription('Play Tic-Tac-Toe')
    .setDescriptionLocalizations({ ko: '틱택토 게임을 시작합니다' })
    .addUserOption(option => option
    .setName('opponent')
    .setNameLocalizations({ ko: '상대' })
    .setDescription('Select an opponent (leave empty to play vs bot)')
    .setDescriptionLocalizations({ ko: '상대를 선택하세요 (비워두면 봇과 대결)' })
    .setRequired(false));
async function execute(interaction) {
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
    gameState_1.activeTicTacToe.set(gameId, {
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
    const game = gameState_1.activeTicTacToe.get(gameId);
    if (game) {
        game.messageId = reply.id;
    }
    const collector = reply.createMessageComponentCollector({
        filter: (i) => {
            if (!i.isButton())
                return false;
            const currentGame = gameState_1.activeTicTacToe.get(gameId);
            if (!currentGame)
                return false;
            if (currentGame.player2 === 'bot') {
                return i.user.id === currentGame.player1;
            }
            return i.user.id === currentGame.currentTurn;
        },
        time: 300000
    });
    collector.on('collect', async (i) => {
        const position = parseInt(i.customId.split('_')[2]);
        const game = gameState_1.activeTicTacToe.get(gameId);
        if (!game) {
            await i.update({ content: '게임을 찾을 수 없습니다.', components: [] });
            return;
        }
        if (game.board[position] !== null) {
            await i.reply({ content: '이미 선택된 위치입니다!', ephemeral: true });
            return;
        }
        game.board[position] = game.currentTurn === game.player1 ? '⭕' : '❌';
        const winner = checkWinner(game.board);
        if (winner) {
            collector.stop();
            const winnerUser = winner === '⭕' ? game.player1 : game.player2;
            const loserUser = winner === '⭕' ? game.player2 : game.player1;
            if (winnerUser !== 'bot') {
                (0, stats_1.updateStat)(winnerUser, 'tictactoe', { wins: 1 });
            }
            if (loserUser !== 'bot') {
                (0, stats_1.updateStat)(loserUser, 'tictactoe', { losses: 1 });
            }
            const winnerName = winnerUser === 'bot' ? '봇' : `<@${winnerUser}>`;
            await i.update({
                content: `⭕❌ 게임 종료!\n승자: ${winnerName} (${winner})`,
                components: createBoard(gameId, true)
            });
            gameState_1.activeTicTacToe.delete(gameId);
            return;
        }
        if (!game.board.includes(null)) {
            collector.stop();
            if (game.player1 !== 'bot') {
                (0, stats_1.updateStat)(game.player1, 'tictactoe', { ties: 1 });
            }
            if (game.player2 !== 'bot') {
                (0, stats_1.updateStat)(game.player2, 'tictactoe', { ties: 1 });
            }
            await i.update({
                content: '⭕❌ 게임 종료!\n결과: 무승부!',
                components: createBoard(gameId, true)
            });
            gameState_1.activeTicTacToe.delete(gameId);
            return;
        }
        if (game.player2 === 'bot') {
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
                        (0, stats_1.updateStat)(game.player1, 'tictactoe', { losses: 1 });
                    }
                    else {
                        (0, stats_1.updateStat)(game.player1, 'tictactoe', { wins: 1 });
                    }
                    await i.update({
                        content: `⭕❌ 게임 종료!\n승자: ${winnerName} (${botWinner})`,
                        components: createBoard(gameId, true)
                    });
                    gameState_1.activeTicTacToe.delete(gameId);
                    return;
                }
                if (!game.board.includes(null)) {
                    collector.stop();
                    (0, stats_1.updateStat)(game.player1, 'tictactoe', { ties: 1 });
                    await i.update({
                        content: '⭕❌ 게임 종료!\n결과: 무승부!',
                        components: createBoard(gameId, true)
                    });
                    gameState_1.activeTicTacToe.delete(gameId);
                    return;
                }
            }
            await i.update({
                content: `⭕❌ 틱택토 게임!\n<@${game.player1}> (⭕) vs 봇 (❌)\n\n현재 차례: <@${game.player1}>`,
                components: createBoard(gameId)
            });
        }
        else {
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
            gameState_1.activeTicTacToe.delete(gameId);
            await interaction.editReply({
                content: '게임 시간이 초과되었습니다.',
                components: []
            });
        }
    });
}
function createBoard(gameId, disabled = false) {
    const game = gameState_1.activeTicTacToe.get(gameId);
    const board = game?.board || Array(9).fill(null);
    const rows = [];
    for (let i = 0; i < 3; i++) {
        const row = new discord_js_1.ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
            const position = i * 3 + j;
            const value = board[position];
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`ttt_${gameId}_${position}`)
                .setLabel(value || '　')
                .setStyle(value ? discord_js_1.ButtonStyle.Secondary : discord_js_1.ButtonStyle.Primary)
                .setDisabled(disabled || value !== null));
        }
        rows.push(row);
    }
    return rows;
}
function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
