"use client";
import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";
import ChessBoard from "./components/ChessBoard";
import { MessageType, ResponseType, ServerResponse } from "@/app/hooks/types";

const Home = () => {
  const [board, setBoard] = useState(null);
  const socket = useSocket();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [color, setColor] = useState<"w" | "b" | null>(null);
  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }
    console.log("Socket connected");
    socket.onmessage = (event) => {
      const data: ServerResponse = JSON.parse(event.data);
      console.log("Data is ", JSON.parse(event.data));

      if (data.type !== MessageType.SUCCESS_MESSAGE) {
        alert(data.message);
        return;
      }

      switch (data.responseType) {
        case ResponseType.BOARD:
          console.log("Board Updated");
          setBoard(data.message.board);
          setColor(data.message.color);

          break;
        default:
          console.log("Unknown response type");
      }
    };
  }, [socket]);

  const joinRoom = () => {
    socket?.send(JSON.stringify({ roomId: roomId }));
  };

  return (
    <div className="w-full absolute top-60 flex justify-center items-center">
      <div className="flex flex-col justify-start items-center">
        <input
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId || ""}
          type="text"
          placeholder="Enter Room Id"
          className="w-[400px] border border-black px-8 py-4 text-4xl rounded-lg "
        />
        {JSON.stringify({ roomId })}
        <button
          onClick={joinRoom}
          className="bg-green-600 w-fit text-white px-8 py-4 text-4xl mt-4 rounded-lg shadow-md hover:shadow-xl "
        >
          Join
        </button>
        {socket && board && color && (
          <div>
            <ChessBoard color={color} socket={socket} board={board} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
