export const BOARD_SIZE = 8
export const BLACK = 1
export const WHITE = 2
export const EMPTY = 0

export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
]

export const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [ 10,  -2,   1,   1,   1,   1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100]
]

export function createInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
  board[3][3] = WHITE
  board[3][4] = BLACK
  board[4][3] = BLACK
  board[4][4] = WHITE
  return board
}

export function isValidPosition(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function getFlippedPieces(board, row, col, player) {
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

export function getValidMoves(board, player) {
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

export function evaluateBoard(board, player) {
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

export function getBestMove(board, player) {
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

export function countPieces(board) {
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
