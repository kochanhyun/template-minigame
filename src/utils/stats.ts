import fs from 'fs';
import path from 'path';

const STATS_FILE = path.join(process.cwd(), 'game_stats.json');

/**
 * 게임 통계 데이터 구조
 */
interface GameStats {
    [userId: string]: {
        [key: string]: any;
        rps?: { wins: number; losses: number; ties: number };
        tictactoe?: { wins: number; losses: number; ties: number };
        blackjack?: { wins: number; losses: number };
        numberbaseball?: { wins: number; attempts: number };
        wordrelay?: { words: number };
        quiz?: { correct: number };
        typing?: { wins: number };
        points?: number;
        fishing_inventory?: Array<{ fish: string; rarity: string; timestamp: number }>;
    };
}

/**
 * 통계 파일 읽기
 */
export function readStats(): GameStats {
    try {
        if (!fs.existsSync(STATS_FILE)) {
            return {};
        }
        const data = fs.readFileSync(STATS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading stats file:', error);
        return {};
    }
}

/**
 * 통계 파일 쓰기
 */
export function writeStats(stats: GameStats): void {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing stats file:', error);
    }
}

/**
 * 유저의 통계 업데이트
 */
export function updateStat(userId: string, game: string, updates: any): void {
    const stats = readStats();
    
    if (!stats[userId]) {
        stats[userId] = {};
    }
    
    if (!stats[userId][game]) {
        stats[userId][game] = {};
    }
    
    // 업데이트 적용
    for (const key in updates) {
        if (typeof updates[key] === 'number') {
            stats[userId][game][key] = (stats[userId][game][key] || 0) + updates[key];
        } else {
            stats[userId][game][key] = updates[key];
        }
    }
    
    writeStats(stats);
}

/**
 * 포인트 업데이트
 */
export function updatePoints(userId: string, amount: number): void {
    const stats = readStats();
    
    if (!stats[userId]) {
        stats[userId] = {};
    }
    
    stats[userId].points = (stats[userId].points || 0) + amount;
    
    writeStats(stats);
}

/**
 * 포인트 조회
 */
export function getPoints(userId: string): number {
    const stats = readStats();
    return stats[userId]?.points || 0;
}

/**
 * 낚시 아이템 추가
 */
export function addFishingItem(userId: string, fish: string, rarity: string): void {
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

/**
 * 리더보드 데이터 가져오기
 */
export function getLeaderboard(game: string, field: string, limit: number = 10): Array<{ userId: string; value: number }> {
    const stats = readStats();
    const leaderboard: Array<{ userId: string; value: number }> = [];
    
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
