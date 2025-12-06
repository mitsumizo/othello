import { useState, useEffect } from 'react'
import './App.css'
import {
  BOARD_SIZE,
  BLACK,
  WHITE,
  EMPTY,
  createInitialBoard,
  getFlippedPieces,
  getValidMoves,
  getBestMove,
  countPieces
} from './gameLogic'

function App() {
  const [board, setBoard] = useState(createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState(BLACK)
  const [validMoves, setValidMoves] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [passed, setPassed] = useState(false)
  const [message, setMessage] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)

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
