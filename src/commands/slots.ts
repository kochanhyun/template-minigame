import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { updatePoints, getPoints } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('slots')
    .setNameLocalizations({ ko: '슬롯머신' })
    .setDescription('Play slot machine game')
    .setDescriptionLocalizations({ ko: '슬롯머신 게임을 합니다' });

const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];

/**
 * slots 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const cost = 10;
    
    const currentPoints = getPoints(userId);
    
    if (currentPoints < cost) {
        await interaction.reply({
            content: `❌ 포인트가 부족합니다! (필요: ${cost}P, 보유: ${currentPoints}P)`,
            ephemeral: true
        });
        return;
    }
    
    // 포인트 차감
    updatePoints(userId, -cost);
    
    // 슬롯 결과 생성
    const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
    
    let result = '';
    let prize = 0;
    
    if (slot1 === slot2 && slot2 === slot3) {
        // 3개 일치
        if (slot1 === '7️⃣') {
            prize = 500;
            result = '🎊 대박! 트리플 세븐!';
        } else if (slot1 === '💎') {
            prize = 300;
            result = '💎 트리플 다이아몬드!';
        } else {
            prize = 100;
            result = '🎉 트리플 당첨!';
        }
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        // 2개 일치
        prize = 20;
        result = '✨ 더블 당첨!';
    } else {
        result = '😢 꽝! 다음 기회에...';
    }
    
    if (prize > 0) {
        updatePoints(userId, prize);
    }
    
    const newPoints = getPoints(userId);
    
    let content = `🎰 **슬롯머신**\n\n`;
    content += `[ ${slot1} | ${slot2} | ${slot3} ]\n\n`;
    content += `${result}\n`;
    
    if (prize > 0) {
        content += `획득: **+${prize}P**\n`;
    } else {
        content += `손실: **-${cost}P**\n`;
    }
    
    content += `\n현재 포인트: **${newPoints}P**`;
    
    await interaction.reply(content);
}
