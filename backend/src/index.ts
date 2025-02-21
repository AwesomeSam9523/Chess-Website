import {WebSocketServer, WebSocket} from "ws";
import {ConnectionPayload} from "./modules/types";
import GameManager from "./modules/GameManager";

const server = new WebSocketServer({port: 8080});
const gameManager = new GameManager();

server.on("connection", (socket: WebSocket) => {
  console.log("Socket connected");

  socket.on("message", (data_) => {
    let data: ConnectionPayload | null;
    try {
      data = JSON.parse(data_.toString());
      console.log("roomId = "+ data?.roomId);
    } catch (e) {
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
  })
});

