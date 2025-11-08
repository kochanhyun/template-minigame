"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
const number_baseball_1 = require("./number-baseball");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('guess')
    .setNameLocalizations({ ko: '추측' })
    .setDescription('Guess the number in Number Baseball game')
    .setDescriptionLocalizations({ ko: '숫자야구 게임에서 숫자를 추측합니다' })
    .addStringOption(option => option
    .setName('number')
    .setNameLocalizations({ ko: '숫자' })
    .setDescription('Enter 3 different digits (e.g., 123)')
    .setDescriptionLocalizations({ ko: '서로 다른 3자리 숫자를 입력하세요 (예: 123)' })
    .setRequired(true));
async function execute(interaction) {
    const gameId = interaction.user.id;
    const game = gameState_1.activeNumberBaseball.get(gameId);
    if (!game) {
        await interaction.reply({
            content: '진행 중인 숫자야구 게임이 없습니다. `/number-baseball` 명령어로 게임을 시작하세요.',
            ephemeral: true
        });
        return;
    }
    const numberStr = interaction.options.getString('number', true);
    if (numberStr.length !== 3 || !/^\d{3}$/.test(numberStr)) {
        await interaction.reply({
            content: '❌ 3자리 숫자를 입력해주세요!',
            ephemeral: true
        });
        return;
    }
    const guess = numberStr.split('').map(Number);
    if (new Set(guess).size !== 3) {
        await interaction.reply({
            content: '❌ 서로 다른 숫자 3개를 입력해주세요!',
            ephemeral: true
        });
        return;
    }
    game.attempts++;
    const result = (0, number_baseball_1.checkGuess)(guess, game.answer);
    if (result.strikes === 3) {
        (0, stats_1.updateStat)(interaction.user.id, 'numberbaseball', { wins: 1, attempts: game.attempts });
        await interaction.reply({
            content: `🎉 정답입니다!\n\n` +
                `답: ${game.answer.join('')}\n` +
                `시도 횟수: ${game.attempts}회`
        });
        gameState_1.activeNumberBaseball.delete(gameId);
    }
    else {
        let resultText = `⚾ 시도 ${game.attempts}회: ${numberStr}\n`;
        if (result.strikes > 0) {
            resultText += `🟢 ${result.strikes} 스트라이크`;
        }
        if (result.balls > 0) {
            if (result.strikes > 0)
                resultText += ', ';
            resultText += `🟡 ${result.balls} 볼`;
        }
        if (result.strikes === 0 && result.balls === 0) {
            resultText += `⚪ 아웃`;
        }
        await interaction.reply(resultText);
    }
}
