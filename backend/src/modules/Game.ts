import {Chess} from "chess.js";
import {InGamePayload, MessageType, MoveTypes, ResponseType} from "./types";
import {RawData, WebSocket} from "ws";

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
      this.startGame();
    } else {
      this.player1 = socket;
    }
  }

  removeUser(socket: WebSocket) {
    if ([this.player1, this.player2].indexOf(socket) === -1) {
      return;
    }
    let leaveSocket = this.player1 === socket ? this.player2 : this.player1;
    if (!leaveSocket) return;

    leaveSocket.close(1000, "User left the game.");
  }

  send(
    socket: WebSocket,
    messageType: MessageType,
    message: any,
    responseType: ResponseType = ResponseType.INFO
  ) {
    if (socket.CLOSED) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: messageType,
        responseType,
        message,
      })
    );
  }

  sendBoard() {
    if (this.player1 && this.player2) {
      const whiteBoard = this.chess.board();
      const blackBoard = [];
      for (let i = whiteBoard.length - 1; i >= 0; i--) {
        const newArr = Array.from(whiteBoard[i]);
        blackBoard.push(newArr.reverse());
      }
      this.send(this.player1, MessageType.SUCCESS_MESSAGE, {board: whiteBoard, history: this.chess.history(), color: "w"}, ResponseType.BOARD);
      this.send(this.player2, MessageType.SUCCESS_MESSAGE, {board: blackBoard, history: this.chess.history(), color: "b"}, ResponseType.BOARD);
    }
  }

  startGame() {
    if (!this.player1 || !this.player2) {
      return;
    }

    console.log("Game started in roomId", this.roomId);

    this.player1.on("message", (data) => {
      if (this.player1 && this.player2)
        this.handleMessage(data, this.player1, this.player2);
    });

    this.player2.on("message", (data) => {
      if (this.player1 && this.player2)
        this.handleMessage(data, this.player2, this.player1);
    });

    this.sendBoard()
  }

  endGame() {
    if (this.player1 && !this.player1.CLOSED) {
      this.player1.close(1000, "Game ended.");
    }
    if (this.player2 && !this.player2.CLOSED) {
      this.player2.close(1000, "Game ended.");
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

    const color = socket === this.player1 ? "w" : "b";
    if (chess.turn() !== color) {
      this.send(socket, MessageType.ERROR_MESSAGE, "Not your turn.");
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

    if (!data.from || !data.to) {
      this.send(socket, MessageType.ERROR_MESSAGE, "Invalid Payload.");
      return;
    }

    try {
      const move = chess.move({from: data.from, to: data.to});
      if (!move) {
        this.send(socket, MessageType.ERROR_MESSAGE, "Illegal Move.");
        return;
      }
    } catch (e) {
      this.send(socket, MessageType.ERROR_MESSAGE, "Illegal Move.");
      return;
    }

    // Send move updates to both players
    this.sendBoard();

    // Check for checkmate
    if (chess.isCheckmate()) {
      this.send(enemySocket, MessageType.ERROR_MESSAGE, "You lost!");
      this.send(socket, MessageType.ERROR_MESSAGE, "You won!");
      this.endGame();
    }
  }
}

export default Game;
