import React, { useEffect, useRef, useState } from "react";
import { Chessground as NativeChessground } from "chessground";
import "../assets/board/chess.css";
import "../assets/board/board-bg.css";
import "../assets/board/pieces.css";
import PromotionDialog from "./PromotionDialog";
import { pieceSets, board_themes } from "./utils";

const Chessboard = ({
  initialFen,
  orientation,
  onMove,
  chess,
  customArrows,
}) => {
  const chessgroundRef = useRef(null);
  const apiRef = useRef(null);
  const [theme, setTheme] = useState("theme-brown"); // Default to brown
  const [pieceSet, setPieceSet] = useState("alpha"); // Default to Alpha
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const containerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(500);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    //! Initialize Chessground Configuration
    if (chessgroundRef.current && !apiRef.current) {
      apiRef.current = NativeChessground(chessgroundRef.current, {
        fen: initialFen,
        orientation,
        coordinates: false,
        events: {
          move: handleMove,
          select: handleSelected,
        },
        movable: {
          free: false,
          showDests: true,
        },
        highlight: {
          lastMove: true,
          check: true,
        },
        draggable: {
          enabled: true,
        },
      });
    }

    //* Update the board state when the initialFen or the custom arrows change
    apiRef.current.set({
      fen: initialFen,
    });

    return () => {
      if (apiRef.current) {
        apiRef.current.destroy();
        apiRef.current = null;
      }
    };
  }, [initialFen, chess, orientation]); // Added dependencies

  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.set({
        drawable: {
          autoShapes: customArrows,
        },
      });
    }
  }, [customArrows]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newBoardWidth = Math.min(containerWidth, 500);
        setBoardWidth(newBoardWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const pieceStyle = window.localStorage.getItem("pieces");

    if (pieceStyle) {
      setPieceSet(pieceStyle);
      handlePieceChange(pieceStyle);
    }

    const boardTheme = window.localStorage.getItem("board-theme");
    if (boardTheme) {
      setTheme(boardTheme);
    }
  }, []);

  const handleSelected = (key) => {
    const dests = new Map();
    const moves = chess.moves({ square: key, verbose: true });
    const targetSquares = moves.map((move) => move.to);
    dests.set(key, targetSquares);
    if (apiRef.current) {
      apiRef.current.set({
        movable: {
          dests: dests,
        },
      });
    }
  };

  const handleMove = (orig, dest, capturedPiece) => {
    const piece = chess.get(orig);
    // Determine the correct color for promotion based on the piece moving
    const isPromotion =
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && dest[1] === "8") ||
        (piece.color === "b" && dest[1] === "1"));

    if (isPromotion) {
      setPendingMove({ from: orig, to: dest });
      setPromotionDialogOpen(true);
    } else {
      makeMove(orig, dest);
    }
  };

  const makeMove = (from, to, promotion) => {
    try {
      const move = chess.move({ from, to, promotion: promotion || "q" });
      if (move) {
        updateChessboardState(move);
        onMove(move);
      }
    } catch (error) {
      console.error("Invalid move:", error); // Log the error for debugging
      resetChessboardState();
    }
  };

  const handlePromotion = (promotionPiece) => {
    if (pendingMove) {
      makeMove(pendingMove.from, pendingMove.to, promotionPiece);
    }
    setPromotionDialogOpen(false);
    setPendingMove(null);
  };

  const updateChessboardState = (move) => {
    const isCheck = chess.isCheck();
    const side = chess.turn() === "w" ? "white" : "black";

    apiRef.current.set({
      fen: chess.fen(),
      turnColor: side,
      check: isCheck ? side : false,
    });
  };

  const resetChessboardState = () => {
    const side = chess.turn() === "w" ? "white" : "black";
    apiRef.current.set({
      fen: chess.fen(),
      turnColor: side,
    });
  };

  const handleThemeChange = (selectedThemeClass) => {
    window.localStorage.setItem("board-theme", selectedThemeClass);
    setTheme(selectedThemeClass);
  };

  const handlePieceChange = (selectedPiece) => {
    setPieceSet(selectedPiece);
    window.localStorage.setItem("pieces", selectedPiece);

    const whitePawns = document.querySelectorAll(".white.pawn");
    if (whitePawns.length > 0) {
      whitePawns.forEach((pawn) => {
        const url = `./pieces/${selectedPiece}/wP.svg`;
        pawn.style.backgroundImage = `url(${url})`;
      });
    }

    const blackPawns = document.querySelectorAll(".black.pawn");
    if (blackPawns.length > 0) {
      blackPawns.forEach((pawn) => {
        const url = `./pieces/${selectedPiece}/bP.svg`;
        pawn.style.backgroundImage = `url(${url})`;
      });
    }

    const whiteKnights = document.querySelectorAll(".white.knight");
    if (whiteKnights.length > 0) {
      whiteKnights.forEach((knight) => {
        const url = `./pieces/${selectedPiece}/wN.svg`;
        knight.style.backgroundImage = `url(${url})`;
      });
    }
    const blackKnights = document.querySelectorAll(".black.knight");
    if (blackKnights.length > 0) {
      blackKnights.forEach((knight) => {
        const url = `./pieces/${selectedPiece}/bN.svg`;
        knight.style.backgroundImage = `url(${url})`;
      });
    }

    const whiteRooks = document.querySelectorAll(".white.rook");
    if (whiteRooks.length > 0) {
      whiteRooks.forEach((rook) => {
        const url = `./pieces/${selectedPiece}/wR.svg`;
        rook.style.backgroundImage = `url(${url})`;
      });
    }

    const blackRooks = document.querySelectorAll(".black.rook");
    if (blackRooks.length > 0) {
      blackRooks.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/bR.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }

    const whiteBishops = document.querySelectorAll(".white.bishop");
    if (whiteBishops.length > 0) {
      whiteBishops.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/wB.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }
    const blackBishops = document.querySelectorAll(".black.bishop");
    if (blackBishops.length > 0) {
      blackBishops.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/bB.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }

    // Queens
    const whiteQueens = document.querySelectorAll(".white.queen");
    if (whiteQueens.length > 0) {
      whiteQueens.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/wQ.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }
    const blackQueens = document.querySelectorAll(".black.queen");
    if (blackQueens.length > 0) {
      blackQueens.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/bQ.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }

    // Kings
    const whiteKing = document.querySelectorAll(".white.king");
    if (whiteKing.length > 0) {
      whiteKing.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/wK.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }
    const blackKing = document.querySelectorAll(".black.king");
    if (blackKing.length > 0) {
      blackKing.forEach((piece) => {
        const url = `./pieces/${selectedPiece}/bK.svg`;
        piece.style.backgroundImage = `url(${url})`;
      });
    }
  };

  return (
    <div
      className={`chessboard-container ${theme} grid grid-cols-2`}
      ref={containerRef}
      style={{
        filter: hue > 0 ? `hue-rotate(${hue}deg)` : undefined,
      }}
    >
      <div
        ref={chessgroundRef}
        style={{ width: boardWidth, height: boardWidth, position: "relative" }}
        // className={`realtive piece-set-${pieceSet}`}
      >
        <PromotionDialog
          isOpen={promotionDialogOpen}
          onClose={() => {
            setPromotionDialogOpen(false);
            resetChessboardState();
          }}
          onPromote={() => {
            handlePromotion();
            handlePieceChange(pieceSet);
          }}
          color={chess.turn()}
          pieceSet={pieceSet}
        />
      </div>

      <div className="board-controls">
        <div className="hue-set w-full">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            onChange={(e) => setHue(e.target.value)}
            value={hue}
            className="w-full max-w-[500px]"
          ></input>
        </div>

        <div className="theme-selection-menu mt-4 flex justify-center gap-4 flex-wrap">
          {board_themes.map((boardTheme) => (
            <div
              key={boardTheme.css_class}
              className={`theme-option p-2 border rounded-md cursor-pointer ${
                theme === boardTheme.css_class
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleThemeChange(boardTheme.css_class)}
            >
              <img
                src={boardTheme.preview}
                alt={`${boardTheme.name} theme preview`}
                className="w-16 h-16 object-cover rounded-md"
              />
              <p className="text-center text-sm mt-1">{boardTheme.name}</p>
            </div>
          ))}
        </div>

        <div className="piece_sets flex gap-3 flex-wrap">
          {pieceSets.map((pieceSet) => (
            <button onClick={() => handlePieceChange(pieceSet)} key={pieceSet}>
              {pieceSet}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
