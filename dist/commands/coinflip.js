"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('coinflip')
    .setNameLocalizations({ ko: '동전던지기' })
    .setDescription('Flip a coin and bet points')
    .setDescriptionLocalizations({ ko: '동전을 던져 포인트를 걸고 게임합니다' })
    .addStringOption(option => option
    .setName('choice')
    .setNameLocalizations({ ko: '선택' })
    .setDescription('Choose heads or tails')
    .setDescriptionLocalizations({ ko: '앞면 또는 뒷면을 선택하세요' })
    .setRequired(true)
    .addChoices({ name: '앞면', value: 'heads' }, { name: '뒷면', value: 'tails' }));
async function execute(interaction) {
    const choice = interaction.options.getString('choice', true);
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const resultKorean = result === 'heads' ? '앞면' : '뒷면';
    const choiceKorean = choice === 'heads' ? '앞면' : '뒷면';
    let content = `🪙 **동전 던지기**\n\n`;
    content += `당신의 선택: **${choiceKorean}**\n`;
    content += `결과: **${resultKorean}**\n\n`;
    if (choice === result) {
        content += `🎉 승리! (포인트 시스템이 비활성화되어 포인트는 부여되지 않습니다.)`;
    }
    else {
        content += `😢 패배! (포인트 시스템이 비활성화되어 포인트는 차감되지 않습니다.)`;
    }
    await interaction.reply(content);
}
