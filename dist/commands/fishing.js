"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const builders_1 = require("@discordjs/builders");
const gameState_1 = require("../gameState");
const stats_1 = require("../utils/stats");
exports.data = new builders_1.SlashCommandBuilder()
    .setName('fishing')
    .setNameLocalizations({ ko: '낚시' })
    .setDescription('Go fishing and catch random fish')
    .setDescriptionLocalizations({ ko: '낚시를 하여 랜덤한 물고기를 잡습니다' });
const fishTypes = [
    { name: '붕어', rarity: '일반', emoji: '🐟' },
    { name: '잉어', rarity: '일반', emoji: '🐟' },
    { name: '미꾸라지', rarity: '일반', emoji: '🐟' },
    { name: '피라미', rarity: '일반', emoji: '🐟' },
    { name: '연어', rarity: '고급', emoji: '🐠' },
    { name: '참치', rarity: '고급', emoji: '🐠' },
    { name: '방어', rarity: '고급', emoji: '🐠' },
    { name: '상어', rarity: '희귀', emoji: '🦈' },
    { name: '돌고래', rarity: '희귀', emoji: '🐬' },
    { name: '황금잉어', rarity: '전설', emoji: '🐉' },
    { name: '고래', rarity: '전설', emoji: '🐋' }
];
const COOLDOWN_MS = 30 * 60 * 1000;
async function execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();
    const lastFishing = gameState_1.fishingCooldowns.get(userId);
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
    gameState_1.fishingCooldowns.set(userId, now);
    const rand = Math.random() * 100;
    let fish;
    if (rand < 5) {
        const legendary = fishTypes.filter(f => f.rarity === '전설');
        fish = legendary[Math.floor(Math.random() * legendary.length)];
    }
    else if (rand < 15) {
        const rare = fishTypes.filter(f => f.rarity === '희귀');
        fish = rare[Math.floor(Math.random() * rare.length)];
    }
    else if (rand < 40) {
        const uncommon = fishTypes.filter(f => f.rarity === '고급');
        fish = uncommon[Math.floor(Math.random() * uncommon.length)];
    }
    else {
        const common = fishTypes.filter(f => f.rarity === '일반');
        fish = common[Math.floor(Math.random() * common.length)];
    }
    (0, stats_1.addFishingItem)(userId, fish.name, fish.rarity);
    let content = `🎣 **낚시 성공!**\n\n`;
    content += `${fish.emoji} **${fish.name}**을(를) 잡았습니다!\n`;
    content += `등급: **${fish.rarity}**\n\n`;
    if (fish.rarity === '전설') {
        content += `🎊 전설 등급! 대박!\n`;
    }
    else if (fish.rarity === '희귀') {
        content += `✨ 희귀 등급! 축하합니다!\n`;
    }
    content += `\n다음 낚시까지: **30분**`;
    await interaction.reply(content);
}
