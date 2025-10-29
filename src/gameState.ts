/**
 * 게임 상태 관리 (메모리)
 * 현재 진행 중인 게임의 상태를 Map 객체로 관리합니다.
 * 이 데이터는 봇 재시작 시 사라집니다.
 */

// 1:1 게임 상태
export const activeTicTacToe = new Map<string, {
    player1: string;
    player2: string;
    board: (string | null)[];
    currentTurn: string;
    messageId: string;
}>();

export const activeBlackjack = new Map<string, {
    userId: string;
    playerHand: number[];
    dealerHand: number[];
    deck: number[];
    messageId: string;
}>();

export const activeNumberBaseball = new Map<string, {
    userId: string;
    answer: number[];
    attempts: number;
}>();

// 채널 전체 참여 게임 상태
export const channelWordRelay = new Map<string, {
    lastWord: string;
    lastUserId: string;
}>();

export const channelQuiz = new Map<string, {
    answer: string;
    consonants: string;
    startTime: number;
}>();

export const typingRace = new Map<string, {
    text: string;
    startTime: number;
    participants: Set<string>;
}>();

// 쿨타임 관리
export const fishingCooldowns = new Map<string, number>();
