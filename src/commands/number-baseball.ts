import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalSubmitInteraction } from 'discord.js';
import { activeNumberBaseball } from '../gameState';
import { updateStat } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('number-baseball')
    .setNameLocalizations({ ko: '숫자야구' })
    .setDescription('Play Number Baseball game')
    .setDescriptionLocalizations({ ko: '숫자야구 게임을 시작합니다' });

/**
 * number-baseball 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const gameId = interaction.user.id;
    
    // 이미 진행 중인 게임이 있는지 확인
    if (activeNumberBaseball.has(gameId)) {
        await interaction.reply({
            content: '이미 진행 중인 숫자야구 게임이 있습니다! `/guess` 명령어로 숫자를 입력하세요.',
            ephemeral: true
        });
        return;
    }
    
    // 3자리 난수 생성 (중복 없음)
    const answer = generateAnswer();
    
    activeNumberBaseball.set(gameId, {
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

function generateAnswer(): number[] {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const answer: number[] = [];
    
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * numbers.length);
        answer.push(numbers[index]);
        numbers.splice(index, 1);
    }
    
    return answer;
}

export function checkGuess(guess: number[], answer: number[]): { strikes: number; balls: number } {
    let strikes = 0;
    let balls = 0;
    
    for (let i = 0; i < 3; i++) {
        if (guess[i] === answer[i]) {
            strikes++;
        } else if (answer.includes(guess[i])) {
            balls++;
        }
    }
    
    return { strikes, balls };
}
