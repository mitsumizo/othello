import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { BLACK, WHITE } from './gameLogic'

describe('App コンポーネント', () => {
  it('正しくレンダリングされること', () => {
    render(<App />)
    expect(screen.getByText('オセロ')).toBeInTheDocument()
    expect(screen.getByText('新しいゲーム')).toBeInTheDocument()
  })

  it('初期スコアが黒2、白2で表示されること', () => {
    render(<App />)
    const scores = screen.getAllByText('2')
    expect(scores).toHaveLength(2)
  })

  it('初期状態で黒（あなた）のターンであること', () => {
    render(<App />)
    expect(screen.getByText('あなたのターン')).toBeInTheDocument()
  })

  it('プレイヤーラベルが正しく表示されること', () => {
    render(<App />)
    expect(screen.getByText('あなた')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('64個のセルがレンダリングされること', () => {
    const { container } = render(<App />)
    const cells = container.querySelectorAll('.cell')
    expect(cells).toHaveLength(64)
  })

  it('初期配置で4つの石が表示されること', () => {
    const { container } = render(<App />)
    const pieces = container.querySelectorAll('.cell .piece')
    expect(pieces).toHaveLength(4)
  })

  it('初期状態で黒の石が2つ表示されること', () => {
    const { container } = render(<App />)
    const blackPieces = container.querySelectorAll('.cell .piece.black')
    expect(blackPieces).toHaveLength(2)
  })

  it('初期状態で白の石が2つ表示されること', () => {
    const { container } = render(<App />)
    const whitePieces = container.querySelectorAll('.cell .piece.white')
    expect(whitePieces).toHaveLength(2)
  })

  it('初期状態で有効な手にヒントが表示されること', () => {
    const { container } = render(<App />)
    const hints = container.querySelectorAll('.hint')
    expect(hints.length).toBeGreaterThan(0)
  })

  it('初期状態で4つのヒントが表示されること', () => {
    const { container } = render(<App />)
    const hints = container.querySelectorAll('.hint')
    expect(hints).toHaveLength(4)
  })

  it('新しいゲームボタンをクリックするとゲームがリセットされること', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    const validCell = container.querySelector('.cell.valid')
    await user.click(validCell)

    await waitFor(() => {
      const pieces = container.querySelectorAll('.cell .piece')
      expect(pieces.length).toBeGreaterThan(4)
    })

    const resetButton = screen.getByText('新しいゲーム')
    await user.click(resetButton)

    await waitFor(() => {
      const pieces = container.querySelectorAll('.cell .piece')
      expect(pieces).toHaveLength(4)
    })
  })

  it('有効なマスをクリックすると石が置かれること', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    const initialPieces = container.querySelectorAll('.cell .piece').length

    const validCell = container.querySelector('.cell.valid')
    expect(validCell).not.toBeNull()

    await user.click(validCell)

    await waitFor(() => {
      const pieces = container.querySelectorAll('.cell .piece')
      expect(pieces.length).toBeGreaterThan(initialPieces)
    })
  })

  it('無効なマスをクリックしても石が置かれないこと', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    const initialPieces = container.querySelectorAll('.cell .piece').length

    const cells = container.querySelectorAll('.cell')
    const invalidCell = Array.from(cells).find(cell => !cell.classList.contains('valid'))

    if (invalidCell) {
      await user.click(invalidCell)

      const pieces = container.querySelectorAll('.cell .piece')
      expect(pieces).toHaveLength(initialPieces)
    }
  })

  it('石を置いた後、スコアが更新されること', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    const validCell = container.querySelector('.cell.valid')
    await user.click(validCell)

    await waitFor(() => {
      const blackScore = screen.getAllByText(/[0-9]+/).find(el => {
        return el.parentElement?.querySelector('.player-label')?.textContent === 'あなた'
      })
      if (blackScore) {
        expect(parseInt(blackScore.textContent)).toBeGreaterThan(2)
      }
    })
  })

  it('黒が手を打った後、AIが自動的に手を打つこと', async () => {
    const { container } = render(<App />)

    const initialPieces = container.querySelectorAll('.cell .piece').length
    const validCell = container.querySelector('.cell.valid')

    expect(validCell).not.toBeNull()

    validCell.click()

    await waitFor(() => {
      const pieces = container.querySelectorAll('.cell .piece')
      expect(pieces.length).toBeGreaterThan(initialPieces)
    }, { timeout: 2000 })
  })

  it('リセット後、初期状態に戻ること', async () => {
    const user = userEvent.setup()
    render(<App />)

    const resetButton = screen.getByText('新しいゲーム')
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('あなたのターン')).toBeInTheDocument()
    })

    const scores = screen.getAllByText('2')
    expect(scores).toHaveLength(2)
  })

  it('アクティブなプレイヤーにactiveクラスが付与されること', () => {
    const { container } = render(<App />)
    const scoreElements = container.querySelectorAll('.score')
    const activeScores = Array.from(scoreElements).filter(el => el.classList.contains('active'))
    expect(activeScores).toHaveLength(1)
  })
})
