import {WebSocketServer, WebSocket, Data} from "ws";
import {ConnectionPayload} from "./modules/types";
import GameManager from "./modules/GameManager";

const server = new WebSocketServer({port: 8080});
const gameManager = new GameManager();

interface MessageEvent {
  data: Data;
  type: string;
  target: WebSocket
}

function handleFirstRequest(event: MessageEvent) {
  const socket = event.target;
  const data_ = event.data;
  let data: ConnectionPayload | null;
  try {
    data = JSON.parse(data_.toString());
    console.log("roomId = " + data?.roomId);
  } catch (e) {
    socket.close(1000, "Invalid Payload");
    return;
  }

  if (!data) {
    return;
  }

  const roomId = data.roomId;
  gameManager.addUser(roomId, socket);
  socket.removeEventListener("message", handleFirstRequest);
}

server.on("connection", (socket: WebSocket) => {
  console.log("Socket connected");

  socket.addEventListener("message", handleFirstRequest);

  socket.on("close", () => {
    gameManager.removeUser(socket, "User left the game.");
  })
});

