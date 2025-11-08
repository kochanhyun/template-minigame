"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageCreate = handleMessageCreate;
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
async function handleMessageCreate(message) {
    if (message.author.bot)
        return;
    const channelId = message.channelId;
    const quiz = gameState_1.channelQuiz.get(channelId);
    if (quiz) {
        const userAnswer = message.content.trim();
        if (userAnswer === quiz.answer) {
            const timeTaken = Math.floor((Date.now() - quiz.startTime) / 1000);
            (0, stats_1.updateStat)(message.author.id, 'quiz', { correct: 1 });
            await message.reply({
                content: `🎉 정답! **${quiz.answer}**\n<@${message.author.id}>님이 ${timeTaken}초 만에 맞췄습니다!`
            });
            gameState_1.channelQuiz.delete(channelId);
            return;
        }
    }
    const typing = gameState_1.typingRace.get(channelId);
    if (typing) {
        const userText = message.content.trim();
        if (userText === typing.text) {
            const timeTaken = Math.floor((Date.now() - typing.startTime) / 1000);
            if (typing.participants.has(message.author.id)) {
                return;
            }
            typing.participants.add(message.author.id);
            if (typing.participants.size === 1) {
                (0, stats_1.updateStat)(message.author.id, 'typing', { wins: 1 });
                await message.reply({
                    content: `⌨️ **승리!**\n<@${message.author.id}>님이 ${timeTaken}초 만에 완료했습니다!`
                });
                gameState_1.typingRace.delete(channelId);
            }
            else {
                await message.reply({
                    content: `✅ <@${message.author.id}>님이 ${timeTaken}초 만에 완료했습니다!`
                });
            }
            return;
        }
    }
}
