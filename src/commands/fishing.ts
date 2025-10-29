import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { fishingCooldowns } from '../gameState';
import { addFishingItem } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('fishing')
    .setNameLocalizations({ ko: '낚시' })
    .setDescription('Go fishing and catch random fish')
    .setDescriptionLocalizations({ ko: '낚시를 하여 랜덤한 물고기를 잡습니다' });

const fishTypes = [
    // 일반 (60%)
    { name: '붕어', rarity: '일반', emoji: '🐟' },
    { name: '잉어', rarity: '일반', emoji: '🐟' },
    { name: '미꾸라지', rarity: '일반', emoji: '🐟' },
    { name: '피라미', rarity: '일반', emoji: '🐟' },
    // 고급 (25%)
    { name: '연어', rarity: '고급', emoji: '🐠' },
    { name: '참치', rarity: '고급', emoji: '🐠' },
    { name: '방어', rarity: '고급', emoji: '🐠' },
    // 희귀 (10%)
    { name: '상어', rarity: '희귀', emoji: '🦈' },
    { name: '돌고래', rarity: '희귀', emoji: '🐬' },
    // 전설 (5%)
    { name: '황금잉어', rarity: '전설', emoji: '🐉' },
    { name: '고래', rarity: '전설', emoji: '🐋' }
];

const COOLDOWN_MS = 30 * 60 * 1000; // 30분

/**
 * fishing 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const now = Date.now();
    
    // 쿨타임 확인
    const lastFishing = fishingCooldowns.get(userId);
    if (lastFishing) {
        const timeLeft = COOLDOWN_MS - (now - lastFishing);
        if (timeLeft > 0) {
            const minutes = Math.ceil(timeLeft / 60000);
            await interaction.reply({
                content: `⏰ 아직 낚시를 할 수 없습니다!\n남은 시간: **${minutes}분**`,
                ephemeral: true
            });
            return;
        }
    }
    
    // 쿨타임 설정
    fishingCooldowns.set(userId, now);
    
    // 랜덤 물고기 선택
    const rand = Math.random() * 100;
    let fish;
    
    if (rand < 5) {
        // 전설 (5%)
        const legendary = fishTypes.filter(f => f.rarity === '전설');
        fish = legendary[Math.floor(Math.random() * legendary.length)];
    } else if (rand < 15) {
        // 희귀 (10%)
        const rare = fishTypes.filter(f => f.rarity === '희귀');
        fish = rare[Math.floor(Math.random() * rare.length)];
    } else if (rand < 40) {
        // 고급 (25%)
        const uncommon = fishTypes.filter(f => f.rarity === '고급');
        fish = uncommon[Math.floor(Math.random() * uncommon.length)];
    } else {
        // 일반 (60%)
        const common = fishTypes.filter(f => f.rarity === '일반');
        fish = common[Math.floor(Math.random() * common.length)];
    }
    
    // 도감에 추가
    addFishingItem(userId, fish.name, fish.rarity);
    
    let content = `🎣 **낚시 성공!**\n\n`;
    content += `${fish.emoji} **${fish.name}**을(를) 잡았습니다!\n`;
    content += `등급: **${fish.rarity}**\n\n`;
    
    if (fish.rarity === '전설') {
        content += `🎊 전설 등급! 대박!\n`;
    } else if (fish.rarity === '희귀') {
        content += `✨ 희귀 등급! 축하합니다!\n`;
    }
    
    content += `\n다음 낚시까지: **30분**`;
    
    await interaction.reply(content);
}
