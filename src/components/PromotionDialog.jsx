const PromotionDialog = ({ isOpen, onClose, onPromote, color, pieceSet }) => {
  if (!isOpen) return null;
  const pieceColor = color === "w" ? "/w" : "/b";

  const pieces = [
    {
      name: "q",
      url: "./pieces/" + pieceSet + pieceColor + "Q.svg",
    },
    { name: "r", url: "./pieces/" + pieceSet + pieceColor + "R.svg" },
    { name: "n", url: "./pieces/" + pieceSet + pieceColor + "N.svg" },
    { name: "b", url: "./pieces/" + pieceSet + pieceColor + "B.svg" },
  ];

  return (
    <div className="absolute inset-0 bg-slate-900/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-4 bg-gray-200 rounded-lg flex items-center justify-center flex-col">
        <div className="flex space-x-4">
          {pieces.map((piece) => (
            <button
              key={piece.name}
              className={`w-16 h-16 rounded-full border flex items-center justify-center ${color === "w"? "bg-gray-400": "bg-white"}`}
              onClick={() => onPromote(piece.name)}
            >
              <img src={piece.url} className="h-11" alt="piece-image" />
            </button>
          ))}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PromotionDialog;
