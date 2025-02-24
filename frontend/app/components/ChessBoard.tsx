"use client";
import {Color, PieceSymbol, Square} from "chess.js";
import {useState} from "react";
import {MoveTypes} from "@/app/hooks/types";

export default function ChessBoard({ board, socket}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
}) {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  const toChessNotation = (rowIndex: number, colIndex: number) => {
    const column = String.fromCharCode("a".charCodeAt(0) + colIndex);
    const row = 8 - rowIndex;
    return column + row;
  };

  const handleSquareClick = (rowIndex: number, columnIndex: number) => {
    const notation = toChessNotation(rowIndex, columnIndex);
    if (!from) {
      setFrom(notation);
      return;
    }
    try {
      socket.send(
        JSON.stringify({
          moveType: MoveTypes.REGULAR,
          from: from,
          to: notation,
        })
      );
      setTo(null);
      setFrom(null);
    } catch (err) {
      console.log(err);
      setTo(null);
      setFrom(null);
    }
  }

  return (
    <div>
      {JSON.stringify(from)}
      {JSON.stringify(to)}
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((square, columnIndex) => (
              <button
                onClick={() => handleSquareClick(rowIndex, columnIndex)}
                className={`w-[80px] flex justify-center items-center h-[80px] ${
                  (rowIndex + columnIndex) % 2 === 0
                    ? "bg-[#c3a082]"
                    : "bg-[#f2e1c3]"
                } text-xl border border-black`}
                key={columnIndex}
              >
                {square?.color == "w" ? <div className="text-black">{square?.type}</div> :
                  <div className="text-green-800">{square?.type}</div>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
