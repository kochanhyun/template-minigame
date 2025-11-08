"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const gameState_1 = require("../gameState");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('typing')
    .setNameLocalizations({ ko: '타자배틀' })
    .setDescription('Start a typing race game')
    .setDescriptionLocalizations({ ko: '타자 배틀 게임을 시작합니다' });
const sentences = [
    '빠른 갈색 여우가 게으른 개를 뛰어넘습니다',
    '디스코드 봇 개발은 재미있습니다',
    '타이핑 속도를 향상시키는 연습',
    '프로그래밍은 창의성과 논리를 요구합니다',
    '게임을 즐기면서 실력을 키워봅시다',
    '한글 타자 연습으로 속도를 높이세요',
    '집중력과 정확성이 중요합니다',
    '꾸준한 연습이 실력 향상의 비결',
    '빠르고 정확하게 입력하는 것이 목표',
    '함께 게임하며 즐거운 시간 보내요'
];
async function execute(interaction) {
    const channelId = interaction.channelId;
    if (gameState_1.typingRace.has(channelId)) {
        await interaction.reply({
            content: '❌ 이미 진행 중인 타자 배틀이 있습니다!',
            ephemeral: true
        });
        return;
    }
    const text = sentences[Math.floor(Math.random() * sentences.length)];
    gameState_1.typingRace.set(channelId, {
        text,
        startTime: Date.now(),
        participants: new Set()
    });
    await interaction.reply({
        content: `⌨️ **타자 배틀 시작!**\n\n` +
            `다음 문장을 채팅으로 정확하게 입력하세요:\n\n` +
            `\`\`\`\n${text}\n\`\`\`\n` +
            `(60초 제한)`
    });
    setTimeout(() => {
        const currentGame = gameState_1.typingRace.get(channelId);
        if (currentGame && currentGame.text === text) {
            gameState_1.typingRace.delete(channelId);
            if (currentGame.participants.size === 0) {
                interaction.followUp({
                    content: `⏰ 시간 초과! 아무도 정답을 입력하지 못했습니다.`
                });
            }
        }
    }, 60000);
}
