import Game from "./Game";
import {WebSocket} from "ws";

class GameManager {
  private games: Game[] = [];

  findGame(roomId: string) {
    const games = this.games.filter(game => game.roomId === roomId);
    return games[0];
  }

  addUser(roomId: string, socket: WebSocket) {
    
    let game = this.findGame(roomId);
    if (!game) {
      game = new Game(roomId);
      this.games.push(game);
      console.log("Created new game");
    }

    game.addUser(socket);
  }

  removeUser(socket: WebSocket, message?: string) {
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

export default GameManager;
