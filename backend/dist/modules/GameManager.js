"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importDefault(require("./Game"));
class GameManager {
    constructor() {
        this.games = [];
    }
    findGame(roomId) {
        const games = this.games.filter(game => game.roomId === roomId);
        return games[0];
    }
    addUser(roomId, socket) {
        let game = this.findGame(roomId);
        if (!game) {
            game = new Game_1.default(roomId);
            this.games.push(game);
            console.log("Created new game");
        }
        game.addUser(socket);
    }
    removeUser(socket, message) {
        if (message)
            console.log(message);
        const game = this.games.filter(game => game.findUser(socket))[0];
        if (!game) {
            return;
        }
        game.removeUser(socket);
        this.games = this.games.filter(game_ => game_ !== game);
    }
}
exports.default = GameManager;
