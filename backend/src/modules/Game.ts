import { Chess } from "chess.js";
import { InGamePayload, MessageType, MoveTypes } from "./types";
import { RawData, WebSocket } from "ws";

class Game {
  public roomId: string;
  private player1: WebSocket | undefined;
  private player2: WebSocket | undefined;
  private readonly chess: Chess;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.chess = new Chess();
  }

  findUser(socket: WebSocket) {
    return this.player1 === socket || this.player2 === socket;
  }

  addUser(socket: WebSocket) {
    if (this.player1 && this.player2) {
      return;
    }

    if (this.player1) {
      this.player2 = socket;
      console.log("player 2 joined");
      this.startGame();
    } else {
      this.player1 = socket;
      console.log("Player 1 joined");
    }
  }

  removeUser(socket: WebSocket) {
    if ([this.player1, this.player2].indexOf(socket) === -1) {
      return;
    }
    let leaveSocket: WebSocket | undefined;
    if (this.player1 === socket) {
      leaveSocket = this.player2;
    } else {
      leaveSocket = this.player1;
    }

    if (!leaveSocket) return;

    leaveSocket.close(1000, "User left the game.");
  }

  send(socket: WebSocket, messageType: MessageType, message: any) {
    if (!socket) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: messageType,
        message,
        history: this.chess.history(),
      })
    );
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
    if (this.player1 && this.player2) {
      this.send(this.player1, MessageType.SUCCESS_MESSAGE, "game started");
      this.send(this.player2, MessageType.SUCCESS_MESSAGE, "game started");
    }
  }

  endGame() {
    if (this.player1 && this.player2) {
      this.send(this.player1, MessageType.SUCCESS_MESSAGE, "Game ended.");
      this.send(this.player2, MessageType.SUCCESS_MESSAGE, "Game ended.");
    }
  }

  handleMessage(data_: RawData, socket: WebSocket, enemySocket: WebSocket) {
    const chess = this.chess;
    let data: InGamePayload | null;
    try {
      data = JSON.parse(data_.toString());
    } catch (e) {
      this.send(socket, MessageType.ERROR_MESSAGE, "Invalid Payload.");
      return;
    }
    if (!data) {
      this.send(socket, MessageType.ERROR_MESSAGE, "No data received.");
      return;
    }
  
    const moveNumber = chess.history().length;
    const color = moveNumber % 2 ? "b" : "w";
  
    try {
      const move = chess.move({ from: data.from, to: data.to });
      if (!move) {
        this.send(socket, MessageType.ERROR_MESSAGE, "Illegal Move.");
        return;
      }
    } catch (e) {
      console.error(e);
      this.send(socket, MessageType.ERROR_MESSAGE, "Illegal Move.");
      return;
    }
  
    // Handle specific move types
    switch (data.moveType) {
      case MoveTypes.CASTLING:
        if (!chess.getCastlingRights(color)) {
          this.send(socket, MessageType.ERROR_MESSAGE, "Cannot castle.");
          return;
        }
        break;
      case MoveTypes.PROMOTION:
        // Handle promotion logic here
        break;
      case MoveTypes.REGULAR:
        break;
      case MoveTypes.GET_BOARD:
        const board = chess.board();
        this.send(socket, MessageType.SUCCESS_MESSAGE, board);
        return;
    }
  
    // Send move updates to both players
    if (this.player1 && this.player2) {
      this.send(this.player1, MessageType.SUCCESS_MESSAGE, {
        move: data,
        board: chess.board(),
      });
      this.send(this.player2, MessageType.SUCCESS_MESSAGE, {
        move: data,
        board: chess.board(),
      });
    }
  
    // Check for checkmate
    if (chess.isCheckmate()) {
      this.send(enemySocket, MessageType.SUCCESS_MESSAGE, "You won!");
      this.send(socket, MessageType.ERROR_MESSAGE, "You lost!");
      this.endGame();
    }
  }
}

export default Game;
