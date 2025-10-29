import * as ping from "./ping";
import * as leaderboard from "./leaderboard";
import * as rps from "./rps";
import * as ticTacToe from "./tic-tac-toe";
import * as blackjack from "./blackjack";
import * as numberBaseball from "./number-baseball";
import * as guess from "./guess";
import * as wordRelay from "./word-relay";
import * as quiz from "./quiz";
import * as typing from "./typing";
import * as slots from "./slots";
import * as coinflip from "./coinflip";
import * as fishing from "./fishing";
import * as collection from "./collection";

export const commands = {
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