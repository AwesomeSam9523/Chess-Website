"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = __importDefault(require("./modules/GameManager"));
const server = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.default();
server.on("connection", (socket) => {
    console.log("Socket connected");
    socket.on("message", (data_) => {
        let data;
        try {
            data = JSON.parse(data_.toString());
            console.log("roomId = " + (data === null || data === void 0 ? void 0 : data.roomId));
        }
        catch (e) {
            socket.close(1000, "Invalid Payload");
            return;
        }
        if (!data) {
            return;
        }
        const roomId = data.roomId;
        gameManager.addUser(roomId, socket);
    });
    socket.on("close", () => {
        gameManager.removeUser(socket, "User left the game.");
    });
});
