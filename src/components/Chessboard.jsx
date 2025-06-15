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
  allowMoveOpponentPieces, // Added this prop as it was used in your snippet
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
          color: !allowMoveOpponentPieces ? orientation : "both", // ensure allowMoveOpponentPieces is defined
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
  }, [initialFen, chess, orientation, allowMoveOpponentPieces]); // Added dependencies

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
    setTheme(selectedThemeClass);
  };

  const handlePieceChange = (selectedPiece) => {
    // setPieceSet(selectedPiece);
  };

  return (
    <div
      className={`chessboard-container ${theme} flex items-center justify-center flex-col md:block`}
      ref={containerRef}
      style={{
        filter: hue? `hue-rotate(${hue}deg)`:undefined,
      }}
    >
      <div
        ref={chessgroundRef}
        style={{ width: boardWidth, height: boardWidth }}
        className={`realtive piece-set-${pieceSet}`}
      >
        <PromotionDialog
          isOpen={promotionDialogOpen}
          onClose={() => {
            setPromotionDialogOpen(false);
            resetChessboardState();
          }}
          onPromote={handlePromotion}
          color={chess.turn()}
          pieceSet={pieceSet}
        />
      </div>

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
          <button onClick={() => handlePieceChange(pieceSet)}>
            {pieceSet}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chessboard;
