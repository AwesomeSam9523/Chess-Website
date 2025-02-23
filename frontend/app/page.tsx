"use client";
import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";
import ChessBoard from "./components/ChessBoard";
import { Chess } from "chess.js";
const Home = () => {
    const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const socket = useSocket();
  const [roomId, setRoomId] = useState<string | null>(null);
  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
    } else {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(JSON.stringify(data));
        if (data.type == 0 && !data.message.board) {          
          console.log("Game Started");
        }
        if(data.message.board){
          console.log("Board Updated");
          // setBoard(data.message.board);
          chess.move(data.message.move);
          
        }
      };
    }
  }, [socket,chess]);

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
          className="w-[800px] border border-black px-8 py-4 text-4xl rounded-lg "
        />
        {JSON.stringify({ roomId })}
        <button
          onClick={joinRoom}
          className="bg-green-600 w-fit text-white px-8 py-4 text-4xl mt-4 rounded-lg shadow-md hover:shadow-xl "
        >
          Join
        </button>
        {socket && (
          <div>
            <ChessBoard
              socket={socket}
              setBoard={setBoard}
              board={board}
              chess={chess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
