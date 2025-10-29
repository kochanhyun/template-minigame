import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { updatePoints, getPoints } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setNameLocalizations({ ko: '동전던지기' })
    .setDescription('Flip a coin and bet points')
    .setDescriptionLocalizations({ ko: '동전을 던져 포인트를 걸고 게임합니다' })
    .addStringOption(option =>
        option
            .setName('choice')
            .setNameLocalizations({ ko: '선택' })
            .setDescription('Choose heads or tails')
            .setDescriptionLocalizations({ ko: '앞면 또는 뒷면을 선택하세요' })
            .setRequired(true)
            .addChoices(
                { name: '앞면', value: 'heads' },
                { name: '뒷면', value: 'tails' }
            )
    )
    .addIntegerOption(option =>
        option
            .setName('amount')
            .setNameLocalizations({ ko: '금액' })
            .setDescription('Amount of points to bet')
            .setDescriptionLocalizations({ ko: '베팅할 포인트 금액' })
            .setRequired(true)
            .setMinValue(1)
    );

/**
 * coinflip 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const choice = interaction.options.getString('choice', true);
    const amount = interaction.options.getInteger('amount', true);
    
    const currentPoints = getPoints(userId);
    
    if (currentPoints < amount) {
        await interaction.reply({
            content: `❌ 포인트가 부족합니다! (필요: ${amount}P, 보유: ${currentPoints}P)`,
            ephemeral: true
        });
        return;
    }
    
    // 동전 던지기
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const resultKorean = result === 'heads' ? '앞면' : '뒷면';
    const choiceKorean = choice === 'heads' ? '앞면' : '뒷면';
    
    let content = `🪙 **동전 던지기**\n\n`;
    content += `당신의 선택: **${choiceKorean}**\n`;
    content += `결과: **${resultKorean}**\n\n`;
    
    if (choice === result) {
        // 승리
        updatePoints(userId, amount);
        content += `🎉 승리!\n`;
        content += `획득: **+${amount * 2}P** (베팅 반환 + 상금)\n`;
        content += `\n현재 포인트: **${currentPoints + amount}P**`;
    } else {
        // 패배
        updatePoints(userId, -amount);
        content += `😢 패배!\n`;
        content += `손실: **-${amount}P**\n`;
        content += `\n현재 포인트: **${currentPoints - amount}P**`;
    }
    
    await interaction.reply(content);
}
