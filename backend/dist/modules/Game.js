"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chess_js_1 = require("chess.js");
const types_1 = require("./types");
class Game {
    constructor(roomId) {
        this.roomId = roomId;
        this.chess = new chess_js_1.Chess();
    }
    findUser(socket) {
        return this.player1 === socket || this.player2 === socket;
    }
    addUser(socket) {
        if (this.player1 && this.player2) {
            return;
        }
        if (this.player1) {
            this.player2 = socket;
            this.startGame();
        }
        else {
            this.player1 = socket;
        }
    }
    removeUser(socket) {
        if ([this.player1, this.player2].indexOf(socket) === -1) {
            return;
        }
        let leaveSocket;
        if (this.player1 === socket) {
            leaveSocket = this.player2;
        }
        else {
            leaveSocket = this.player1;
        }
        if (!leaveSocket)
            return;
        leaveSocket.close(1000, "User left the game.");
    }
    send(socket, messageType, message) {
        if (!socket) {
            return;
        }
        socket.send(JSON.stringify({
            type: messageType,
            message,
        }));
    }
    startGame() {
        if (!this.player1 || !this.player2) {
            return;
        }
        this.player1.on("message", (data) => {
            if (this.player1 && this.player2)
                this.handleMessage(data, this.player1, this.player2);
        });
        this.player2.on("message", (data) => {
            if (this.player1 && this.player2)
                this.handleMessage(data, this.player2, this.player1);
        });
    }
    endGame() {
        if (this.player1 && this.player2) {
            this.send(this.player1, types_1.MessageType.SUCCESS_MESSAGE, "Game ended.");
            this.send(this.player2, types_1.MessageType.SUCCESS_MESSAGE, "Game ended.");
        }
    }
    handleMessage(data_, socket, enemySocket) {
        const chess = this.chess;
        let data;
        try {
            data = JSON.parse(data_.toString());
        }
        catch (e) {
            this.send(socket, types_1.MessageType.ERROR_MESSAGE, "Invalid Payload.");
            return;
        }
        if (!data) {
            return;
        }
        const moveNumber = chess.moveNumber();
        console.log(moveNumber);
        const color = moveNumber % 2 ? "b" : "w";
        switch (data.moveType) {
            case types_1.MoveTypes.CASTLING:
                if (!chess.getCastlingRights(color)) {
                    this.send(socket, types_1.MessageType.ERROR_MESSAGE, "Cannot castle.");
                    return;
                }
                break;
            case types_1.MoveTypes.PROMOTION:
                break;
            case types_1.MoveTypes.REGULAR:
                break;
            case types_1.MoveTypes.GET_BOARD:
                const board = chess.board();
                this.send(socket, types_1.MessageType.SUCCESS_MESSAGE, board);
                return;
        }
        try {
            chess.move({ from: data.from, to: data.to });
        }
        catch (e) {
            console.error(e);
            this.send(socket, types_1.MessageType.ERROR_MESSAGE, "Illegal Move.");
            return;
        }
        // TODO: Check for checks and checkmate here
        if (chess.isCheckmate()) {
            this.send(enemySocket, types_1.MessageType.SUCCESS_MESSAGE, "You won!");
            this.send(socket, types_1.MessageType.ERROR_MESSAGE, "You lost!");
            this.endGame();
        }
    }
}
exports.default = Game;
