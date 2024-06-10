import { Board } from 'wasm-cat'
import { memory } from 'wasm-cat/cat_wasm_bg.wasm'
import IconCat from '@/assets/cat.png'

// 精灵图的每一项的宽高
const imageItem = {
  width: 64,
  height: 92,
}

enum BoardColor {
  Background = '#666666',
  ChessEmpty = '#b6b6b6',
  ChessDone = '#fe845e',
}

interface BoardProps {
  row: number
  col: number
  cellSize: number
  padding: number
  xGap: number
  yGap: number
}

export default class Painter {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private timer: NodeJS.Timeout = null as any
  private cat: HTMLImageElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.cat = new Image()
    this.cat.src = IconCat
  }

  private drawCell(x: number, y: number, r: number, color: string) {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    this.ctx.arc(x, y, r, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  public drawBackground() {
    this.ctx.fillStyle = BoardColor.Background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  public drawBoard(cellsPtr: number, boardProps: BoardProps) {
    const { padding, cellSize, xGap, yGap, row, col } = boardProps
    const cells = new Uint8Array(memory.buffer, cellsPtr, row * col)
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        const color = cells[i * col + j] ? BoardColor.ChessDone : BoardColor.ChessEmpty
        const { x, y } = this.getCircleCenter(j, i, padding, cellSize, xGap, yGap)
        const r = cellSize / 2
        this.drawCell(x, y, r, color)
      }
    }
  }

  public clearCatRect(x: number, y: number, cellSize: number) {
    this.ctx.fillStyle = BoardColor.Background
    this.ctx.fillRect(x, y, cellSize, cellSize)
  }

  public getCircleCenter(x: number, y: number, padding: number, cellSize: number, xGap: number, yGap: number) {
    const x1 = (x + 0.5) * cellSize + padding + (y % 2 === 1 ? cellSize / 2 : 0) + x * xGap
    const y1 = (y + 0.5) * cellSize + padding + y * yGap
    return {
      x: x1,
      y: y1,
    }
  }

  public clearTimer() {
    clearTimeout(this.timer)
  }

  public drawChess(
    x: number,
    y: number,
    cat_x: number,
    cat_y: number,
    boardProps: BoardProps,
    isEmpty: boolean = true
  ) {
    const { cellSize, padding, xGap, yGap } = boardProps
    this.clearCatRect(x, y, cellSize)
    const center = this.getCircleCenter(cat_x, cat_y, padding, cellSize, xGap, yGap)
    this.drawCell(center.x, center.y, cellSize / 2, isEmpty ? BoardColor.ChessEmpty : BoardColor.ChessDone)
  }

  public drawCat(idx: number, boardProps: BoardProps, board: Board) {
    const { x, y, cat_x, cat_y } = Object.fromEntries(board.get_cat_rect_start_xy())
    const { cellSize } = boardProps
    this.drawChess(x, y, cat_x, cat_y, boardProps)
    const { width, height } = imageItem
    const imageItemX = width * (idx % 4)
    const imageItemY = height * Math.floor(idx / 4)
    this.ctx.drawImage(this.cat, imageItemX, imageItemY, width, height, x, y, cellSize, cellSize)
    this.timer = setTimeout(() => {
      requestAnimationFrame(() => {
        const nextIdx = (idx + 1) % 15
        this.drawCat(nextIdx, boardProps, board)
      })
    }, 100)
  }
}
