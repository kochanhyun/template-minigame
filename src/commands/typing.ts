import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { typingRace } from '../gameState';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('typing')
    .setNameLocalizations({ ko: '타자배틀' })
    .setDescription('Start a typing race game')
    .setDescriptionLocalizations({ ko: '타자 배틀 게임을 시작합니다' });

// 타자 연습 문장들
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

/**
 * typing 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const channelId = interaction.channelId;
    
    // 이미 진행 중인 게임이 있는지 확인
    if (typingRace.has(channelId)) {
        await interaction.reply({
            content: '❌ 이미 진행 중인 타자 배틀이 있습니다!',
            ephemeral: true
        });
        return;
    }
    
    // 랜덤 문장 선택
    const text = sentences[Math.floor(Math.random() * sentences.length)];
    
    typingRace.set(channelId, {
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
    
    // 60초 후 자동 종료
    setTimeout(() => {
        const currentGame = typingRace.get(channelId);
        if (currentGame && currentGame.text === text) {
            typingRace.delete(channelId);
            if (currentGame.participants.size === 0) {
                interaction.followUp({
                    content: `⏰ 시간 초과! 아무도 정답을 입력하지 못했습니다.`
                });
            }
        }
    }, 60000);
}
