"use client";
import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MoveTypes } from "@/app/hooks/types";

export default function ChessBoard({
  board,
  socket,
  color,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  color: "w" | "b";
}) {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  const toChessNotation = (
    rowIndex: number,
    colIndex: number,
    color: "w" | "b"
  ) => {
    const column = String.fromCharCode(
      "a".charCodeAt(0) + (color === "b" ? 7 - colIndex : colIndex)
    );
    const row = color === "w" ? 8 - rowIndex : rowIndex + 1;
    return column + row;
  };

  const handleSquareClick = (rowIndex: number, columnIndex: number) => {
    const notation = toChessNotation(rowIndex, columnIndex, color);
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
  };

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
                className={`w-[60px] flex justify-center items-center h-[60px] ${
                  (rowIndex + columnIndex) % 2 === 0
                    ? "bg-[#c3a082]"
                    : "bg-[#f2e1c3]"
                } text-xl border border-black`}
                key={columnIndex}
              >
                {square ? (
                  <img
                    className="w-full p-2"
                    src={
                      `/${
                        square.color === "b"
                          ? square.type
                          : square.type.toUpperCase().concat(" COPY")
                      }` + ".png"
                    }
                  />
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
