import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getLeaderboard, readStats } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setNameLocalizations({ ko: '순위표' })
    .setDescription('View game leaderboards')
    .setDescriptionLocalizations({ ko: '게임 순위표를 확인합니다' })
    .addStringOption(option =>
        option
            .setName('game')
            .setNameLocalizations({ ko: '게임' })
            .setDescription('Select a game')
            .setDescriptionLocalizations({ ko: '게임을 선택하세요' })
            .setRequired(true)
            .addChoices(
                { name: '가위바위보', value: 'rps' },
                { name: '틱택토', value: 'tictactoe' },
                { name: '블랙잭', value: 'blackjack' },
                { name: '숫자야구', value: 'numberbaseball' },
                { name: '끝말잇기', value: 'wordrelay' },
                { name: '초성퀴즈', value: 'quiz' },
                { name: '타자배틀', value: 'typing' },
                { name: '포인트', value: 'points' },
                { name: '낚시도감', value: 'fishing' }
            )
    );

/**
 * leaderboard 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const game = interaction.options.getString('game', true);
    
    let title = '';
    let field = '';
    let description = '';
    
    switch (game) {
        case 'rps':
            title = '🎮 가위바위보 순위표';
            field = 'wins';
            description = '승리 횟수 기준';
            break;
        case 'tictactoe':
            title = '⭕ 틱택토 순위표';
            field = 'wins';
            description = '승리 횟수 기준';
            break;
        case 'blackjack':
            title = '🃏 블랙잭 순위표';
            field = 'wins';
            description = '승리 횟수 기준';
            break;
        case 'numberbaseball':
            title = '⚾ 숫자야구 순위표';
            field = 'wins';
            description = '성공 횟수 기준';
            break;
        case 'wordrelay':
            title = '💬 끝말잇기 순위표';
            field = 'words';
            description = '단어 수 기준';
            break;
        case 'quiz':
            title = '❓ 초성퀴즈 순위표';
            field = 'correct';
            description = '정답 횟수 기준';
            break;
        case 'typing':
            title = '⌨️ 타자배틀 순위표';
            field = 'wins';
            description = '승리 횟수 기준';
            break;
        case 'points':
            title = '💰 포인트 순위표';
            field = 'points';
            description = '보유 포인트 기준';
            break;
        case 'fishing':
            const stats = readStats();
            const fishingLeaderboard = Object.entries(stats)
                .filter(([_, data]) => data.fishing_inventory && data.fishing_inventory.length > 0)
                .map(([userId, data]) => ({
                    userId,
                    value: data.fishing_inventory?.length || 0
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
            
            const fishingEmbed = new EmbedBuilder()
                .setTitle('🎣 낚시도감 순위표')
                .setDescription('수집한 물고기 수 기준')
                .setColor(0x3498db)
                .setTimestamp();
            
            if (fishingLeaderboard.length === 0) {
                fishingEmbed.addFields({ name: '순위', value: '아직 기록이 없습니다.' });
            } else {
                const rankText = fishingLeaderboard
                    .map((entry, idx) => `${idx + 1}. <@${entry.userId}> - ${entry.value}마리`)
                    .join('\n');
                fishingEmbed.addFields({ name: '🏆 Top 10', value: rankText });
            }
            
            await interaction.reply({ embeds: [fishingEmbed] });
            return;
    }
    
    // 포인트 순위표는 별도 처리
    if (game === 'points') {
        const stats = readStats();
        const pointsLeaderboard = Object.entries(stats)
            .filter(([_, data]) => data.points !== undefined)
            .map(([userId, data]) => ({
                userId,
                value: data.points || 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        
        const pointsEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(0xf1c40f)
            .setTimestamp();
        
        if (pointsLeaderboard.length === 0) {
            pointsEmbed.addFields({ name: '순위', value: '아직 기록이 없습니다.' });
        } else {
            const rankText = pointsLeaderboard
                .map((entry, idx) => `${idx + 1}. <@${entry.userId}> - ${entry.value}P`)
                .join('\n');
            pointsEmbed.addFields({ name: '🏆 Top 10', value: rankText });
        }
        
        await interaction.reply({ embeds: [pointsEmbed] });
        return;
    }
    
    // 일반 게임 순위표
    const leaderboard = getLeaderboard(game, field, 10);
    
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x3498db)
        .setTimestamp();
    
    if (leaderboard.length === 0) {
        embed.addFields({ name: '순위', value: '아직 기록이 없습니다.' });
    } else {
        const rankText = leaderboard
            .map((entry, idx) => `${idx + 1}. <@${entry.userId}> - ${entry.value}`)
            .join('\n');
        embed.addFields({ name: '🏆 Top 10', value: rankText });
    }
    
    await interaction.reply({ embeds: [embed] });
}
