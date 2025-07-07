import { useState, useEffect } from 'react'
import './App.css'

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getAvailableMoves(squares) {
  return squares.map((val, idx) => val ? null : idx).filter(idx => idx !== null);
}

function getRandomMove(squares) {
  const moves = getAvailableMoves(squares);
  return moves[Math.floor(Math.random() * moves.length)];
}

function getMediumMove(squares, player, opponent) {
  // Block or win if possible, else random
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  // Try to win
  for (let line of lines) {
    const [a, b, c] = line;
    const lineVals = [squares[a], squares[b], squares[c]];
    if (lineVals.filter(v => v === player).length === 2 && lineVals.includes(null)) {
      return line[lineVals.indexOf(null)];
    }
  }
  // Try to block
  for (let line of lines) {
    const [a, b, c] = line;
    const lineVals = [squares[a], squares[b], squares[c]];
    if (lineVals.filter(v => v === opponent).length === 2 && lineVals.includes(null)) {
      return line[lineVals.indexOf(null)];
    }
  }
  // Else random
  return getRandomMove(squares);
}

function minimax(squares, isMax, player, opponent) {
  const winner = calculateWinner(squares);
  if (winner === player) return { score: 1 };
  if (winner === opponent) return { score: -1 };
  if (squares.every(Boolean)) return { score: 0 };
  const moves = getAvailableMoves(squares);
  let bestMove = null;
  let bestScore = isMax ? -Infinity : Infinity;
  for (let move of moves) {
    const next = squares.slice();
    next[move] = isMax ? player : opponent;
    const result = minimax(next, !isMax, player, opponent);
    if (isMax) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    } else {
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
  }
  return { score: bestScore, move: bestMove };
}

function getHardMove(squares, player, opponent) {
  return minimax(squares, true, player, opponent).move;
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('pvp'); // pvp or pvc
  const [difficulty, setDifficulty] = useState('easy');
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const isComputerTurn = mode === 'pvc' && ((xIsNext && playerSymbol === 'O') || (!xIsNext && playerSymbol === 'X')) && !winner && !isDraw;

  function handleClick(i) {
    if (squares[i] || winner || (isComputerTurn && mode === 'pvc')) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  function handleModeChange(e) {
    setMode(e.target.value);
    handleRestart();
  }

  function handleDifficultyChange(e) {
    setDifficulty(e.target.value);
    handleRestart();
  }

  function handleSymbolChange(e) {
    setPlayerSymbol(e.target.value);
    handleRestart();
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => handleClick(i)}>
        {squares[i]}
      </button>
    );
  }

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  // Computer move effect
  useEffect(() => {
    if (isComputerTurn) {
      const timer = setTimeout(() => {
        let move;
        if (difficulty === 'easy') {
          move = getRandomMove(squares);
        } else if (difficulty === 'medium') {
          move = getMediumMove(squares, computerSymbol, playerSymbol);
        } else {
          move = getHardMove(squares, computerSymbol, playerSymbol);
        }
        if (move !== undefined) {
          const nextSquares = squares.slice();
          nextSquares[move] = computerSymbol;
          setSquares(nextSquares);
          setXIsNext(prev => !prev);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, squares, difficulty, computerSymbol, playerSymbol]);

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          <input className="mode" type="radio" value="pvp" checked={mode === 'pvp'} onChange={handleModeChange} />
          Player vs Player
        </label>
        <label style={{ marginLeft: 16 }}>
          <input type="radio" value="pvc" checked={mode === 'pvc'} onChange={handleModeChange} />
          Player vs Computer
        </label>
      </div>
      {mode === 'pvc' && (
        <div style={{ marginBottom: 16 }}>
          <label>
            Difficulty:
            <select value={difficulty} onChange={handleDifficultyChange} style={{ marginLeft: 8 }}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label style={{ marginLeft: 16 }}>
            You play as:
            <select value={playerSymbol} onChange={handleSymbolChange} style={{ marginLeft: 8 }}>
              <option value="X">X</option>
              <option value="O">O</option>
            </select>
          </label>
        </div>
      )}
      <div className="status">{status}</div>
      <div className="board">
        <div className="board-row">
          {renderSquare(0)}{renderSquare(1)}{renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}{renderSquare(4)}{renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}{renderSquare(7)}{renderSquare(8)}
        </div>
      </div>
      {(winner || isDraw) && (
        <button className="restart" onClick={handleRestart}>
          Restart Game
        </button>
      )}
    </div>
  );
}

export default App
