"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const ping = __importStar(require("./ping"));
const leaderboard = __importStar(require("./leaderboard"));
const rps = __importStar(require("./rps"));
const ticTacToe = __importStar(require("./tic-tac-toe"));
const blackjack = __importStar(require("./blackjack"));
const numberBaseball = __importStar(require("./number-baseball"));
const guess = __importStar(require("./guess"));
const wordRelay = __importStar(require("./word-relay"));
const quiz = __importStar(require("./quiz"));
const typing = __importStar(require("./typing"));
const slots = __importStar(require("./slots"));
const coinflip = __importStar(require("./coinflip"));
const fishing = __importStar(require("./fishing"));
const collection = __importStar(require("./collection"));
exports.commands = {
    ping,
    leaderboard,
    rps,
    'tic-tac-toe': ticTacToe,
    blackjack,
    'number-baseball': numberBaseball,
    guess,
    'word-relay': wordRelay,
    quiz,
    typing,
    slots,
    coinflip,
    fishing,
    collection
};
