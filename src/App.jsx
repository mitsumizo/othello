import { useState, useEffect } from 'react'
import './App.css'

const BOARD_SIZE = 8
const BLACK = 1
const WHITE = 2
const EMPTY = 0

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
]

const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100]
]

function App() {
  const [board, setBoard] = useState(createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState(BLACK)
  const [validMoves, setValidMoves] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [passed, setPassed] = useState(false)
  const [message, setMessage] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)

  function createInitialBoard() {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board[3][3] = WHITE
    board[3][4] = BLACK
    board[4][3] = BLACK
    board[4][4] = WHITE
    return board
  }

  function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
  }

  function getFlippedPieces(board, row, col, player) {
    if (board[row][col] !== EMPTY) return []

    const opponent = player === BLACK ? WHITE : BLACK
    const allFlipped = []

    for (const [dr, dc] of DIRECTIONS) {
      const flipped = []
      let r = row + dr
      let c = col + dc

      while (isValidPosition(r, c) && board[r][c] === opponent) {
        flipped.push([r, c])
        r += dr
        c += dc
      }

      if (isValidPosition(r, c) && board[r][c] === player && flipped.length > 0) {
        allFlipped.push(...flipped)
      }
    }

    return allFlipped
  }

  function getValidMoves(board, player) {
    const moves = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (getFlippedPieces(board, row, col, player).length > 0) {
          moves.push([row, col])
        }
      }
    }
    return moves
  }

  function evaluateBoard(board, player) {
    const opponent = player === BLACK ? WHITE : BLACK
    let score = 0

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === player) {
          score += POSITION_WEIGHTS[row][col]
        } else if (board[row][col] === opponent) {
          score -= POSITION_WEIGHTS[row][col]
        }
      }
    }

    const playerMoves = getValidMoves(board, player).length
    const opponentMoves = getValidMoves(board, opponent).length
    score += (playerMoves - opponentMoves) * 5

    return score
  }

  function getBestMove(board, player) {
    const moves = getValidMoves(board, player)
    if (moves.length === 0) return null

    let bestScore = -Infinity
    let bestMove = moves[0]

    for (const [row, col] of moves) {
      const testBoard = board.map(row => [...row])
      testBoard[row][col] = player

      const flipped = getFlippedPieces(board, row, col, player)
      for (const [r, c] of flipped) {
        testBoard[r][c] = player
      }

      const opponent = player === BLACK ? WHITE : BLACK
      const opponentBestScore = Math.max(
        ...getValidMoves(testBoard, opponent).map(([r, c]) => {
          const oppTestBoard = testBoard.map(row => [...row])
          oppTestBoard[r][c] = opponent
          const oppFlipped = getFlippedPieces(testBoard, r, c, opponent)
          for (const [fr, fc] of oppFlipped) {
            oppTestBoard[fr][fc] = opponent
          }
          return evaluateBoard(oppTestBoard, player)
        }),
        evaluateBoard(testBoard, player)
      )

      const score = evaluateBoard(testBoard, player) - opponentBestScore * 0.5

      if (score > bestScore) {
        bestScore = score
        bestMove = [row, col]
      }
    }

    return bestMove
  }

  function makeMove(row, col, skipAI = false) {
    if (gameOver || isAIThinking) return

    const flipped = getFlippedPieces(board, row, col, currentPlayer)
    if (flipped.length === 0) return

    const newBoard = board.map(row => [...row])
    newBoard[row][col] = currentPlayer

    for (const [r, c] of flipped) {
      newBoard[r][c] = currentPlayer
    }

    setBoard(newBoard)

    const nextPlayer = currentPlayer === BLACK ? WHITE : BLACK
    const nextMoves = getValidMoves(newBoard, nextPlayer)

    if (nextMoves.length === 0) {
      const currentMoves = getValidMoves(newBoard, currentPlayer)
      if (currentMoves.length === 0) {
        endGame(newBoard)
      } else {
        setMessage(`${nextPlayer === BLACK ? '黒' : '白'}はパスしました`)
        setPassed(true)
        setTimeout(() => {
          setMessage('')
          setPassed(false)
        }, 1500)
      }
    } else {
      setCurrentPlayer(nextPlayer)
      setValidMoves(nextMoves)
      setPassed(false)
      setMessage('')
    }
  }

  function endGame(finalBoard) {
    const score = countPieces(finalBoard)
    setGameOver(true)

    if (score.black > score.white) {
      setMessage(`ゲーム終了！黒の勝ち！ (${score.black} - ${score.white})`)
    } else if (score.white > score.black) {
      setMessage(`ゲーム終了！白の勝ち！ (${score.black} - ${score.white})`)
    } else {
      setMessage(`ゲーム終了！引き分け！ (${score.black} - ${score.white})`)
    }
  }

  function countPieces(board) {
    let black = 0
    let white = 0

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === BLACK) black++
        if (board[row][col] === WHITE) white++
      }
    }

    return { black, white }
  }

  function resetGame() {
    setBoard(createInitialBoard())
    setCurrentPlayer(BLACK)
    setGameOver(false)
    setPassed(false)
    setMessage('')
    setIsAIThinking(false)
  }

  useEffect(() => {
    const moves = getValidMoves(board, currentPlayer)
    setValidMoves(moves)
  }, [board, currentPlayer])

  useEffect(() => {
    if (currentPlayer === WHITE && !gameOver && !isAIThinking && validMoves.length > 0) {
      setIsAIThinking(true)
      setMessage('AIが考え中...')

      setTimeout(() => {
        const bestMove = getBestMove(board, WHITE)
        if (bestMove) {
          makeMove(bestMove[0], bestMove[1])
        }
        setIsAIThinking(false)
        setMessage('')
      }, 800)
    }
  }, [currentPlayer, gameOver, validMoves])

  const score = countPieces(board)

  return (
    <div className="app">
      <div className="game-container">
        <h1>オセロ</h1>

        <div className="info-panel">
          <div className="score-board">
            <div className={`score ${currentPlayer === BLACK && !gameOver ? 'active' : ''}`}>
              <div className="piece black"></div>
              <span>{score.black}</span>
              <div className="player-label">あなた</div>
            </div>
            <div className={`score ${currentPlayer === WHITE && !gameOver ? 'active' : ''}`}>
              <div className="piece white"></div>
              <span>{score.white}</span>
              <div className="player-label">AI</div>
            </div>
          </div>

          {!gameOver && (
            <div className="turn-indicator">
              {currentPlayer === BLACK ? 'あなた' : 'AI'}のターン
            </div>
          )}

          {message && (
            <div className={`message ${gameOver ? 'game-over' : ''}`}>
              {message}
            </div>
          )}
        </div>

        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => {
                const isValid = validMoves.some(([r, c]) => r === rowIndex && c === colIndex)
                const canClick = isValid && !gameOver && currentPlayer === BLACK && !isAIThinking

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${canClick ? 'valid' : ''}`}
                    onClick={() => canClick && makeMove(rowIndex, colIndex)}
                  >
                    {cell !== EMPTY && (
                      <div className={`piece ${cell === BLACK ? 'black' : 'white'}`}></div>
                    )}
                    {canClick && <div className="hint"></div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <button className="reset-button" onClick={resetGame}>
          新しいゲーム
        </button>
      </div>
    </div>
  )
}

export default App
