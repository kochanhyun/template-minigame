import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from 'discord.js';
import { updateStat } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('rps')
    .setNameLocalizations({ ko: '가위바위보' })
    .setDescription('Play Rock-Paper-Scissors with the bot')
    .setDescriptionLocalizations({ ko: '봇과 가위바위보를 합니다' });

const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '✊', paper: '🖐️', scissors: '✌️' };
const names = { rock: '바위', paper: '보', scissors: '가위' };

/**
 * rps 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('rps_rock')
                .setLabel('✊ 바위')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rps_paper')
                .setLabel('🖐️ 보')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rps_scissors')
                .setLabel('✌️ 가위')
                .setStyle(ButtonStyle.Primary)
        );

    const reply = await interaction.reply({
        content: '가위바위보! 하나를 선택하세요:',
        components: [row],
        fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id && i.isButton(),
        time: 30000,
        max: 1
    });

    collector.on('collect', async (i: ButtonInteraction) => {
        const userChoice = i.customId.replace('rps_', '') as 'rock' | 'paper' | 'scissors';
        const botChoice = choices[Math.floor(Math.random() * choices.length)] as 'rock' | 'paper' | 'scissors';

        let result = '';
        let outcome: 'win' | 'lose' | 'tie';

        if (userChoice === botChoice) {
            result = '무승부!';
            outcome = 'tie';
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = '승리!';
            outcome = 'win';
        } else {
            result = '패배!';
            outcome = 'lose';
        }

        // 통계 업데이트
        const statUpdate: any = { wins: 0, losses: 0, ties: 0 };
        if (outcome === 'win') statUpdate.wins = 1;
        else if (outcome === 'lose') statUpdate.losses = 1;
        else statUpdate.ties = 1;
        
        updateStat(interaction.user.id, 'rps', statUpdate);

        await i.update({
            content: `당신: ${emojis[userChoice]} ${names[userChoice]}\n봇: ${emojis[botChoice]} ${names[botChoice]}\n\n결과: **${result}**`,
            components: []
        });
    });

    collector.on('end', async (collected) => {
        if (collected.size === 0) {
            await interaction.editReply({
                content: '시간이 초과되었습니다.',
                components: []
            });
        }
    });
}
