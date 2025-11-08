"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
exports.checkGuess = checkGuess;
const builders_1 = require("@discordjs/builders");
const gameState_1 = require("../gameState");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('number-baseball')
    .setNameLocalizations({ ko: '숫자야구' })
    .setDescription('Play Number Baseball game')
    .setDescriptionLocalizations({ ko: '숫자야구 게임을 시작합니다' });
async function execute(interaction) {
    const gameId = interaction.user.id;
    if (gameState_1.activeNumberBaseball.has(gameId)) {
        await interaction.reply({
            content: '이미 진행 중인 숫자야구 게임이 있습니다! `/guess` 명령어로 숫자를 입력하세요.',
            ephemeral: true
        });
        return;
    }
    const answer = generateAnswer();
    gameState_1.activeNumberBaseball.set(gameId, {
        userId: gameId,
        answer,
        attempts: 0
    });
    await interaction.reply({
        content: `⚾ 숫자야구 게임을 시작합니다!\n\n` +
            `0-9 사이의 서로 다른 숫자 3개를 맞춰보세요.\n` +
            `\`/guess [숫자]\` 명령어로 추측하세요.\n\n` +
            `**힌트:**\n` +
            `🟢 스트라이크: 숫자와 위치가 모두 맞음\n` +
            `🟡 볼: 숫자는 맞지만 위치가 틀림\n` +
            `⚪ 아웃: 해당 숫자가 없음`
    });
}
function generateAnswer() {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const answer = [];
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * numbers.length);
        answer.push(numbers[index]);
        numbers.splice(index, 1);
    }
    return answer;
}
function checkGuess(guess, answer) {
    let strikes = 0;
    let balls = 0;
    for (let i = 0; i < 3; i++) {
        if (guess[i] === answer[i]) {
            strikes++;
        }
        else if (answer.includes(guess[i])) {
            balls++;
        }
    }
    return { strikes, balls };
}
