"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStats = readStats;
exports.writeStats = writeStats;
exports.updateStat = updateStat;
exports.updatePoints = updatePoints;
exports.getPoints = getPoints;
exports.addFishingItem = addFishingItem;
exports.getLeaderboard = getLeaderboard;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const STATS_FILE = path_1.default.join(process.cwd(), 'game_stats.json');
function readStats() {
    try {
        if (!fs_1.default.existsSync(STATS_FILE)) {
            return {};
        }
        const data = fs_1.default.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading stats file:', error);
        return {};
    }
}
function writeStats(stats) {
    try {
        fs_1.default.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('Error writing stats file:', error);
    }
}
function updateStat(userId, game, updates) {
    const stats = readStats();
    if (!stats[userId]) {
        stats[userId] = {};
    }
    if (!stats[userId][game]) {
        stats[userId][game] = {};
    }
    for (const key in updates) {
        if (typeof updates[key] === 'number') {
            stats[userId][game][key] = (stats[userId][game][key] || 0) + updates[key];
        }
        else {
            stats[userId][game][key] = updates[key];
        }
    }
    writeStats(stats);
}
function updatePoints(userId, amount) {
    return;
}
function getPoints(userId) {
    return 0;
}
function addFishingItem(userId, fish, rarity) {
    const stats = readStats();
    if (!stats[userId]) {
        stats[userId] = {};
    }
    if (!stats[userId].fishing_inventory) {
        stats[userId].fishing_inventory = [];
    }
    stats[userId].fishing_inventory.push({
        fish,
        rarity,
        timestamp: Date.now()
    });
    writeStats(stats);
}
function getLeaderboard(game, field, limit = 10) {
    const stats = readStats();
    const leaderboard = [];
    for (const userId in stats) {
        if (stats[userId][game] && typeof stats[userId][game][field] === 'number') {
            leaderboard.push({
                userId,
                value: stats[userId][game][field]
            });
        }
    }
    return leaderboard
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}
