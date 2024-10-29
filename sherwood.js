// Legal Square: 0      Off Board: X

// White King: 6        Black King: -6
// White Queen: 5       Black Qeen: -5
// White Rook: 4        Black Rook: -4
// White Bishop: 3      Black Bishop: -3
// White Knight: 2      Black Knight: -2
// White Pawn: 1        Black Pawn: -1

// TODO List:
// 1. Rewrite the ChessBoard an an object (constructor funtion) with props for board state and position.
// 1.1. Use 'New' syntax.
// 2. Rewrite variuos functions as methods on the ChessBoard object.



// create the chess board object
const ChessBoard = {
    position: Array(128),
    sideToMove: 'w',
    castling: 'KQkq',
    enPassant: '-',
    movesMade: 0,
}

// mark the playable squares on the board with '0'
function initializeBoard() {
    for (i = 0; i < 128; i++) {
        if ((i & 0x88) === 0) {
            ChessBoard[i] = 0;
        }
    }
}

// convert the index of the array to human-readable algebraic notation
function squareToCoords(square) {
    let file = square % 16;
    let rank = Math.floor(square / 16);

    const fileChar = String.fromCharCode("a".charCodeAt(0) + file);
    const rowChar = (rank + 1).toString();

    return fileChar + rowChar;
}

// display the board in the console
function displayBoard() {
    const pieceSymbols = {
        1: 'P',   // White Pawn
        2: 'N',   // White Knight
        3: 'B',   // White Bishop
        4: 'R',   // White Rook
        5: 'Q',   // White Queen
        6: 'K',   // White King
        '-1': 'p',  // Black Pawn
        '-2': 'n',  // Black Knight
        '-3': 'b',  // Black Bishop
        '-4': 'r',  // Black Rook
        '-5': 'q',  // Black Queen
        '-6': 'k',  // Black King
        0: '.' // Empty square
    };    
    
    console.log("  a b c d e f g h"); // Column headers

    for (let row = 7; row >= 0; row--) {
        let rowString = (row + 1) + " "; // Row numbers
        for (let col = 0; col < 8; col++) {
            const index = row * 16 + col;
            rowString += pieceSymbols[ChessBoard[index]] + " ";
        }
        console.log(rowString);
    }
    console.log("  a b c d e f g h\n"); // Column headers again for clarity
}

// parse a FEN string and arrange the peices on the board
function parseFEN(fen) {
    const piecePlacement = fen.split(" ")[0]; // Get the piece placement part of the FEN

    let row = 7, col = 0;
    for (let char of piecePlacement) {
        if (char === '/') {
            row--;     // Move to the next row
            col = 0;   // Reset column to the beginning of the row
        } else if (/[1-8]/.test(char)) {
            col += parseInt(char, 10); // Empty squares; move right by the given number
        } else {
            // Place piece on 0x88 board
            const index = row * 16 + col; // Calculate 0x88 index
            if (char === 'k') ChessBoard[index] = -6;
            else if (char === 'q') ChessBoard[index] = -5;
            else if (char === 'r') ChessBoard[index] = -4;
            else if (char === 'b') ChessBoard[index] = -3;
            else if (char === 'n') ChessBoard[index] = -2;
            else if (char === 'p') ChessBoard[index] = -1;
            else if (char === 'K') ChessBoard[index] = 6;
            else if (char === 'Q') ChessBoard[index] = 5;
            else if (char === 'R') ChessBoard[index] = 4;
            else if (char === 'B') ChessBoard[index] = 3;
            else if (char === 'N') ChessBoard[index] = 2;
            else if (char === 'P') ChessBoard[index] = 1;
            else ChessBoard[index] = 0;
             col++;
        }
    }
}

// generate all pseudo-legal moves in the current position
function generateMoves() {
    const moves = [];
    let moveCounter = 0;

    for (let square = 0; square < 128; square++) {
        if ((square & 0x88) !== 0 || ChessBoard[square] === null) continue; // Skip invalid or empty squares

        const piece = ChessBoard[square];
        const absPiece = Math.abs(piece);
        let pawnCaptures = [];
        let pieceOffsets = [];

        //get white pawn moves
        if (piece === 1) {
            pieceOffsets = [16];
            if (Math.floor(square / 8) === 2 ) {
                pieceOffsets.push(32);
            }
        }

        //get black pawn moves
        if (piece === -1) {
            pieceOffsets = [-16];
            if (Math.floor(square / 8) === 12 ) {
                pieceOffsets.push(-32);
            }
        }

        //get knight moves
        if (absPiece === 2) {
           pieceOffsets = [31, 33, 14, 18, -31, -33, -14, -18];
        }

        //get bishop moves
        if (absPiece === 3) {
           pieceOffsets = [15, 17, -15, -17];
         }

        //get rook moves
        if (absPiece === 4) {
            pieceOffsets = [1, -1, 16, -16];
         }

        //get queen moves
        if (absPiece === 5) {
           pieceOffsets = [1, -1, 16, -16, 15, 17, -15, -17];
        }

        //get king moves
        if (absPiece === 6) {
           pieceOffsets = [1, -1, 16, -16, 15, 17, -15, -17];
        }

        for (let offset of pieceOffsets) {
            let target = square + offset;
            const fromSquare = squareToCoords(square);
            const toSquare = squareToCoords(target);

            while ((target & 0x88) === 0) { // Valid ChessBoard square
                //check for diagonal pawn captures
                if (absPiece === 1) {
                    if (ChessBoard[target - 1] !== 0) {
                        if (( ChessBoard[target - 1] > 0) !== (piece > 0)) { // Capture if opposite color
                            moves.push(fromSquare + squareToCoords(target - 1) + ' ' + piece + "x" + ChessBoard[target - 1] );
                            moveCounter++;
                        }
                    }
                    if (ChessBoard[target + 1] !== 0) {
                        if (( ChessBoard[target + 1] > 0) !== (piece > 0)) { // Capture if opposite color
                            moves.push(fromSquare + squareToCoords(target + 1) + ' ' + piece + "x" + ChessBoard[target + 1] );
                            moveCounter++;
                        }
                    }
                }
                
                //check for moves to empy squares
                if (ChessBoard[target] === 0) {
                    moves.push(fromSquare + toSquare); // Add empty square move
                    moveCounter++;
                } 

                //check for captures
                if (ChessBoard[target] !== 0) { 
                    if ( absPiece !== 1 ) { //prevent pawn from caputing forward
                        if (( ChessBoard[target] > 0) !== (piece > 0)) { // Capture if opposite color
                            moves.push(fromSquare + toSquare + ' ' + piece + "x" + ChessBoard[target] );
                            moveCounter++;
                        }
                    }
                    break; // Stop if blocked by any piece
                }
                if ([1, 2, 6].includes(absPiece)) break; // Stop if non-sliding piece (Pawn, Knight, King)
                target += offset; // Slide in the direction for rooks, bishops, queens
            }
        }
    }
    console.log("Total Moves: " + moveCounter);
    return moves;
}

// RUN THE APP
// -----------

// Set our starting FEN
//const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
//const fen = "r6r/1b2k1bq/8/8/7B/8/8/R3K2R b KQ - 3 2";
const fen = "8/8/8/4p3/3N4/8/8/8 w KQkq - 0 1";

// Run the app
initializeBoard();
parseFEN(fen);
displayBoard();

console.log(generateMoves());

