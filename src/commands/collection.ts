import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { readStats } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('collection')
    .setNameLocalizations({ ko: '도감' })
    .setDescription('View your collection of items')
    .setDescriptionLocalizations({ ko: '수집한 아이템 도감을 확인합니다' });

/**
 * collection 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const stats = readStats();
    
    const userData = stats[userId];
    
    if (!userData || !userData.fishing_inventory || userData.fishing_inventory.length === 0) {
        await interaction.reply({
            content: '아직 수집한 아이템이 없습니다!\n`/fishing` 명령어로 낚시를 시작해보세요.',
            ephemeral: true
        });
        return;
    }
    
    const inventory = userData.fishing_inventory;
    
    // 등급별로 분류
    const byRarity: { [key: string]: Array<{ fish: string; timestamp: number }> } = {
        '전설': [],
        '희귀': [],
        '고급': [],
        '일반': []
    };
    
    for (const item of inventory) {
        if (!byRarity[item.rarity]) {
            byRarity[item.rarity] = [];
        }
        byRarity[item.rarity].push({ fish: item.fish, timestamp: item.timestamp });
    }
    
    // 각 등급별 물고기 카운트
    const counts: { [key: string]: { [key: string]: number } } = {};
    
    for (const rarity in byRarity) {
        counts[rarity] = {};
        for (const item of byRarity[rarity]) {
            counts[rarity][item.fish] = (counts[rarity][item.fish] || 0) + 1;
        }
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🎣 낚시 도감')
        .setDescription(`<@${userId}>님의 수집품`)
        .setColor(0x3498db)
        .setTimestamp()
        .addFields(
            { name: '📊 총 수집 개수', value: `${inventory.length}개`, inline: false }
        );
    
    // 등급별로 표시
    const rarityOrder = ['전설', '희귀', '고급', '일반'];
    const rarityEmojis: { [key: string]: string } = {
        '전설': '🌟',
        '희귀': '💎',
        '고급': '✨',
        '일반': '📦'
    };
    
    for (const rarity of rarityOrder) {
        const fishList = counts[rarity];
        if (fishList && Object.keys(fishList).length > 0) {
            const fishText = Object.entries(fishList)
                .map(([fish, count]) => `${fish} x${count}`)
                .join('\n');
            
            embed.addFields({
                name: `${rarityEmojis[rarity]} ${rarity}`,
                value: fishText || '없음',
                inline: false
            });
        }
    }
    
    await interaction.reply({ embeds: [embed] });
}
