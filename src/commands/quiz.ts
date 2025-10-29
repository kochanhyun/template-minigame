import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { channelQuiz } from '../gameState';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('quiz')
    .setNameLocalizations({ ko: '초성퀴즈' })
    .setDescription('Start a consonant quiz game')
    .setDescriptionLocalizations({ ko: '초성 퀴즈 게임을 시작합니다' });

// 퀴즈 데이터
const quizData = [
    { answer: '디스코드', consonants: 'ㄷㅅㅋㄷ' },
    { answer: '가위바위보', consonants: 'ㄱㅇㅂㅇㅂ' },
    { answer: '컴퓨터', consonants: 'ㅋㅍㅇㅌ' },
    { answer: '스마트폰', consonants: 'ㅅㅁㅌㅍ' },
    { answer: '초성퀴즈', consonants: 'ㅊㅅㅋㅈ' },
    { answer: '끝말잇기', consonants: 'ㄲㅁㅇㄱ' },
    { answer: '타자연습', consonants: 'ㅌㅈㅇㅅ' },
    { answer: '블랙잭', consonants: 'ㅂㄹㅈ' },
    { answer: '숫자야구', consonants: 'ㅅㅈㅇㄱ' },
    { answer: '틱택토', consonants: 'ㅌㅌㅌ' },
    { answer: '게임시작', consonants: 'ㄱㅇㅅㅈ' },
    { answer: '순위표', consonants: 'ㅅㅇㅍ' },
    { answer: '레벨업', consonants: 'ㄹㅂㅇ' },
    { answer: '경험치', consonants: 'ㄱㅎㅊ' },
    { answer: '리더보드', consonants: 'ㄹㄷㅂㄷ' }
];

/**
 * quiz 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const channelId = interaction.channelId;
    
    // 이미 진행 중인 퀴즈가 있는지 확인
    if (channelQuiz.has(channelId)) {
        await interaction.reply({
            content: '❌ 이미 진행 중인 퀴즈가 있습니다!',
            ephemeral: true
        });
        return;
    }
    
    // 랜덤 퀴즈 선택
    const quiz = quizData[Math.floor(Math.random() * quizData.length)];
    
    channelQuiz.set(channelId, {
        answer: quiz.answer,
        consonants: quiz.consonants,
        startTime: Date.now()
    });
    
    await interaction.reply({
        content: `❓ **초성 퀴즈**\n\n` +
                `초성: **${quiz.consonants}**\n\n` +
                `채팅으로 정답을 입력하세요!\n` +
                `(30초 제한)`
    });
    
    // 30초 후 자동 종료
    setTimeout(() => {
        const currentQuiz = channelQuiz.get(channelId);
        if (currentQuiz && currentQuiz.answer === quiz.answer) {
            channelQuiz.delete(channelId);
            interaction.followUp({
                content: `⏰ 시간 초과! 정답은 **${quiz.answer}** 였습니다.`
            });
        }
    }, 30000);
}
