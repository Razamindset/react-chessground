import { lazy, Suspense, useState } from "react";
const Chessboard = lazy(() => import("./components/Chessboard"));
import { Chess } from "chess.js";
import useChessSounds from "./lib/useSound";
import { FaSpinner } from "react-icons/fa";

function App() {
  const [fen, setFen] = useState(
    "rnbqkbnr/ppppppPp/8/8/8/8/PPPPP1PP/RNBQKBNR w KQkq - 0 1"
  );
  const [chess] = useState(new Chess(fen));
  const { handleMoveSounds } = useChessSounds(chess);
  const [customArrows, setCustomArrows] = useState([]);

  const handleMove = (move) => {
    handleMoveSounds(move);
  };

  // const showCustommArrows = () => {
  //   setCustomArrows([
  //     {
  //       orig: "a2",
  //       dest: "a6",
  //       brush: "blue",
  //       modifiers: {
  //         lineWidth: "10",
  //       },
  //     },
  //   ]);
  // };

  return (
    <div className="App">
      <Suspense
        fallback={
          <div className="h-screen">
            <FaSpinner className="animate-spin" />
          </div>
        }
      >
        <Chessboard
          initialFen={fen}
          chess={chess}
          orientation="white"
          onMove={handleMove}
          customArrows={customArrows}
        />
      </Suspense>
    </div>
  );
}

export default App;
