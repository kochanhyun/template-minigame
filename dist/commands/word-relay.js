"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('word-relay')
    .setNameLocalizations({ ko: '끝말잇기' })
    .setDescription('Start or continue word relay game')
    .setDescriptionLocalizations({ ko: '끝말잇기 게임을 시작하거나 이어갑니다' })
    .addStringOption(option => option
    .setName('word')
    .setNameLocalizations({ ko: '단어' })
    .setDescription('Enter a word')
    .setDescriptionLocalizations({ ko: '단어를 입력하세요' })
    .setRequired(true));
async function execute(interaction) {
    const word = interaction.options.getString('word', true).trim();
    const channelId = interaction.channelId;
    if (!/^[가-힣]+$/.test(word)) {
        await interaction.reply({
            content: '❌ 한글 단어만 입력할 수 있습니다!',
            ephemeral: true
        });
        return;
    }
    const gameState = gameState_1.channelWordRelay.get(channelId);
    if (!gameState) {
        gameState_1.channelWordRelay.set(channelId, {
            lastWord: word,
            lastUserId: interaction.user.id
        });
        (0, stats_1.updateStat)(interaction.user.id, 'wordrelay', { words: 1 });
        await interaction.reply({
            content: `💬 끝말잇기 시작!\n\n시작 단어: **${word}**\n다음 사람은 **"${word[word.length - 1]}"**(으)로 시작하는 단어를 입력하세요!`
        });
    }
    else {
        const lastWord = gameState.lastWord;
        const lastChar = lastWord[lastWord.length - 1];
        const firstChar = word[0];
        if (gameState.lastUserId === interaction.user.id) {
            await interaction.reply({
                content: '❌ 같은 사람이 연속으로 입력할 수 없습니다!',
                ephemeral: true
            });
            return;
        }
        if (lastChar !== firstChar) {
            await interaction.reply({
                content: `❌ **"${lastChar}"**(으)로 시작하는 단어를 입력해야 합니다!`,
                ephemeral: true
            });
            return;
        }
        gameState.lastWord = word;
        gameState.lastUserId = interaction.user.id;
        (0, stats_1.updateStat)(interaction.user.id, 'wordrelay', { words: 1 });
        await interaction.reply({
            content: `✅ **${word}**\n다음 사람은 **"${word[word.length - 1]}"**(으)로 시작하는 단어를 입력하세요!`
        });
    }
}
