import { Message } from 'discord.js';
import { channelQuiz, typingRace } from '../gameState';
import { updateStat } from '../utils/stats';

/**
 * 메시지 생성 이벤트 처리
 * @param message Discord 메시지
 */
export async function handleMessageCreate(message: Message): Promise<void> {
    // 봇 자신의 메시지는 무시
    if (message.author.bot) return;
    
    const channelId = message.channelId;
    
    // 초성 퀴즈 체크
    const quiz = channelQuiz.get(channelId);
    if (quiz) {
        const userAnswer = message.content.trim();
        
        if (userAnswer === quiz.answer) {
            const timeTaken = Math.floor((Date.now() - quiz.startTime) / 1000);
            
            // 통계 업데이트
            updateStat(message.author.id, 'quiz', { correct: 1 });
            
            await message.reply({
                content: `🎉 정답! **${quiz.answer}**\n<@${message.author.id}>님이 ${timeTaken}초 만에 맞췄습니다!`
            });
            
            channelQuiz.delete(channelId);
            return;
        }
    }
    
    // 타자 배틀 체크
    const typing = typingRace.get(channelId);
    if (typing) {
        const userText = message.content.trim();
        
        if (userText === typing.text) {
            const timeTaken = Math.floor((Date.now() - typing.startTime) / 1000);
            
            // 이미 참여한 유저인지 확인
            if (typing.participants.has(message.author.id)) {
                return;
            }
            
            typing.participants.add(message.author.id);
            
            // 통계 업데이트 (첫 번째 사람만 승리로 기록)
            if (typing.participants.size === 1) {
                updateStat(message.author.id, 'typing', { wins: 1 });
                
                await message.reply({
                    content: `⌨️ **승리!**\n<@${message.author.id}>님이 ${timeTaken}초 만에 완료했습니다!`
                });
                
                typingRace.delete(channelId);
            } else {
                await message.reply({
                    content: `✅ <@${message.author.id}>님이 ${timeTaken}초 만에 완료했습니다!`
                });
            }
            
            return;
        }
    }
}