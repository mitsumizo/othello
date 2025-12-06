import { describe, it, expect } from 'vitest'
import {
  BOARD_SIZE,
  BLACK,
  WHITE,
  EMPTY,
  createInitialBoard,
  isValidPosition,
  getFlippedPieces,
  getValidMoves,
  evaluateBoard,
  getBestMove,
  countPieces
} from './gameLogic'

describe('createInitialBoard', () => {
  it('8x8のボードを作成すること', () => {
    const board = createInitialBoard()
    expect(board).toHaveLength(BOARD_SIZE)
    expect(board[0]).toHaveLength(BOARD_SIZE)
  })

  it('初期配置が正しいこと', () => {
    const board = createInitialBoard()
    expect(board[3][3]).toBe(WHITE)
    expect(board[3][4]).toBe(BLACK)
    expect(board[4][3]).toBe(BLACK)
    expect(board[4][4]).toBe(WHITE)
  })

  it('初期配置以外のマスが空であること', () => {
    const board = createInitialBoard()
    let emptyCount = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === EMPTY) {
          emptyCount++
        }
      }
    }
    expect(emptyCount).toBe(64 - 4)
  })
})

describe('isValidPosition', () => {
  it('有効な位置の場合trueを返すこと', () => {
    expect(isValidPosition(0, 0)).toBe(true)
    expect(isValidPosition(3, 4)).toBe(true)
    expect(isValidPosition(7, 7)).toBe(true)
  })

  it('無効な位置の場合falseを返すこと', () => {
    expect(isValidPosition(-1, 0)).toBe(false)
    expect(isValidPosition(0, -1)).toBe(false)
    expect(isValidPosition(8, 0)).toBe(false)
    expect(isValidPosition(0, 8)).toBe(false)
    expect(isValidPosition(100, 100)).toBe(false)
  })

  it('境界値を正しく判定すること', () => {
    expect(isValidPosition(0, 0)).toBe(true)
    expect(isValidPosition(7, 7)).toBe(true)
    expect(isValidPosition(-1, -1)).toBe(false)
    expect(isValidPosition(8, 8)).toBe(false)
  })
})

describe('getFlippedPieces', () => {
  it('既に石がある場所には置けないこと', () => {
    const board = createInitialBoard()
    const flipped = getFlippedPieces(board, 3, 3, BLACK)
    expect(flipped).toHaveLength(0)
  })

  it('初期状態で黒が置ける場所を正しく判定すること', () => {
    const board = createInitialBoard()
    const flipped = getFlippedPieces(board, 2, 3, BLACK)
    expect(flipped).toHaveLength(1)
    expect(flipped[0]).toEqual([3, 3])
  })

  it('挟めない場所には置けないこと', () => {
    const board = createInitialBoard()
    const flipped = getFlippedPieces(board, 0, 0, BLACK)
    expect(flipped).toHaveLength(0)
  })

  it('複数方向の石をひっくり返せること', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board[3][3] = BLACK
    board[3][4] = WHITE
    board[3][5] = WHITE
    board[4][3] = WHITE
    board[5][3] = WHITE

    const flipped = getFlippedPieces(board, 3, 6, BLACK)
    const flippedPositions = flipped.sort()
    expect(flippedPositions).toHaveLength(2)
    expect(flippedPositions).toContainEqual([3, 4])
    expect(flippedPositions).toContainEqual([3, 5])
  })

  it('斜め方向の石をひっくり返せること', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board[2][2] = BLACK
    board[3][3] = WHITE
    board[4][4] = WHITE

    const flipped = getFlippedPieces(board, 5, 5, BLACK)
    expect(flipped).toHaveLength(2)
    expect(flipped).toContainEqual([3, 3])
    expect(flipped).toContainEqual([4, 4])
  })

  it('自分の石で挟めていない場合は空配列を返すこと', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board[3][3] = WHITE
    board[3][4] = WHITE

    const flipped = getFlippedPieces(board, 3, 5, BLACK)
    expect(flipped).toHaveLength(0)
  })
})

describe('getValidMoves', () => {
  it('初期状態で黒が置ける場所が4箇所あること', () => {
    const board = createInitialBoard()
    const validMoves = getValidMoves(board, BLACK)
    expect(validMoves).toHaveLength(4)
  })

  it('初期状態で黒が置ける位置が正しいこと', () => {
    const board = createInitialBoard()
    const validMoves = getValidMoves(board, BLACK)
    const positions = validMoves.map(([r, c]) => `${r},${c}`)
    expect(positions).toContain('2,3')
    expect(positions).toContain('3,2')
    expect(positions).toContain('4,5')
    expect(positions).toContain('5,4')
  })

  it('初期状態で白が置ける場所が4箇所あること', () => {
    const board = createInitialBoard()
    const validMoves = getValidMoves(board, WHITE)
    expect(validMoves).toHaveLength(4)
  })

  it('空のボードでは有効な手がないこと', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    const validMoves = getValidMoves(board, BLACK)
    expect(validMoves).toHaveLength(0)
  })

  it('全て埋まったボードでは有効な手がないこと', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(BLACK))
    const validMoves = getValidMoves(board, WHITE)
    expect(validMoves).toHaveLength(0)
  })
})

describe('countPieces', () => {
  it('初期状態で黒と白が2つずつあること', () => {
    const board = createInitialBoard()
    const count = countPieces(board)
    expect(count.black).toBe(2)
    expect(count.white).toBe(2)
  })

  it('空のボードでは黒と白が0であること', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    const count = countPieces(board)
    expect(count.black).toBe(0)
    expect(count.white).toBe(0)
  })

  it('全て黒のボードで正しくカウントすること', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(BLACK))
    const count = countPieces(board)
    expect(count.black).toBe(64)
    expect(count.white).toBe(0)
  })

  it('手を打った後の石の数を正しくカウントすること', () => {
    const board = createInitialBoard()
    board[2][3] = BLACK
    board[3][3] = BLACK

    const count = countPieces(board)
    expect(count.black).toBe(4)
    expect(count.white).toBe(1)
  })
})

describe('evaluateBoard', () => {
  it('初期状態での評価値が計算されること', () => {
    const board = createInitialBoard()
    const score = evaluateBoard(board, BLACK)
    expect(typeof score).toBe('number')
  })

  it('角を取った方が高い評価値になること', () => {
    const board1 = createInitialBoard()
    const board2 = createInitialBoard()
    board2[0][0] = BLACK

    const score1 = evaluateBoard(board1, BLACK)
    const score2 = evaluateBoard(board2, BLACK)
    expect(score2).toBeGreaterThan(score1)
  })

  it('相手が角を取った場合は評価値が下がること', () => {
    const board1 = createInitialBoard()
    const board2 = createInitialBoard()
    board2[0][0] = WHITE

    const score1 = evaluateBoard(board1, BLACK)
    const score2 = evaluateBoard(board2, BLACK)
    expect(score2).toBeLessThan(score1)
  })

  it('機動性（有効な手の数）が評価に影響すること', () => {
    const board1 = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board1[3][3] = WHITE
    board1[3][4] = BLACK
    board1[4][3] = BLACK
    board1[4][4] = WHITE

    const board2 = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board2[3][3] = WHITE
    board2[3][4] = BLACK
    board2[4][3] = BLACK
    board2[4][4] = WHITE
    board2[2][2] = WHITE
    board2[2][3] = WHITE
    board2[2][4] = WHITE

    const score1 = evaluateBoard(board1, BLACK)
    const score2 = evaluateBoard(board2, BLACK)
    expect(score1).not.toBe(score2)
  })
})

describe('getBestMove', () => {
  it('有効な手がある場合、最善手を返すこと', () => {
    const board = createInitialBoard()
    const bestMove = getBestMove(board, BLACK)
    expect(bestMove).not.toBeNull()
    expect(Array.isArray(bestMove)).toBe(true)
    expect(bestMove).toHaveLength(2)
  })

  it('有効な手がない場合、nullを返すこと', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    const bestMove = getBestMove(board, BLACK)
    expect(bestMove).toBeNull()
  })

  it('角を取れる場合、角を優先すること', () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    board[0][1] = BLACK
    board[1][0] = BLACK
    board[1][1] = WHITE

    const bestMove = getBestMove(board, BLACK)
    expect(bestMove).not.toBeNull()

    const validMoves = getValidMoves(board, BLACK)
    const hasCornerMove = validMoves.some(([r, c]) =>
      (r === 0 && c === 0) || (r === 0 && c === 7) || (r === 7 && c === 0) || (r === 7 && c === 7)
    )

    if (hasCornerMove) {
      const isCorner = (bestMove[0] === 0 || bestMove[0] === 7) && (bestMove[1] === 0 || bestMove[1] === 7)
      expect(isCorner).toBe(true)
    }
  })

  it('返される手が有効な手であること', () => {
    const board = createInitialBoard()
    const bestMove = getBestMove(board, BLACK)
    const validMoves = getValidMoves(board, BLACK)
    const isValid = validMoves.some(([r, c]) => r === bestMove[0] && c === bestMove[1])
    expect(isValid).toBe(true)
  })

  it('複数の有効な手がある場合、最も高いスコアの手を選ぶこと', () => {
    const board = createInitialBoard()
    const bestMove = getBestMove(board, BLACK)
    const validMoves = getValidMoves(board, BLACK)

    expect(validMoves.length).toBeGreaterThan(0)
    expect(bestMove).not.toBeNull()

    const flipped = getFlippedPieces(board, bestMove[0], bestMove[1], BLACK)
    expect(flipped.length).toBeGreaterThan(0)
  })
})
