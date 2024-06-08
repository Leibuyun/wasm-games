import { getRandomInt, bfs } from './utils'
import IconCat from '@/assets/cat.png'

export type Props = {
  size: number
  canvas: HTMLCanvasElement
  padding: number
}

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

export default class Board {
  private size: number
  private board: boolean[][] = []
  private catPos: { x: number; y: number } = { x: 0, y: 0 }
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private padding: number
  private cellSize: number
  private xGap: number
  private yGap: number
  private cat: HTMLImageElement
  private timer: NodeJS.Timeout = null as any

  constructor({ size, canvas, padding }: Props) {
    this.size = size
    this.canvas = canvas
    this.padding = padding
    this.xGap = 3
    const cellSize = (this.canvas.width - this.padding * 2 - this.xGap * (this.size - 1)) / (this.size + 0.5)
    const yGap = (this.canvas.width - this.padding * 2 - this.size * cellSize) / (this.size - 1)
    this.cellSize = cellSize
    this.yGap = yGap
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.addEventListener()
    const cat = new Image()
    cat.src = IconCat
    this.cat = cat
  }

  public init() {
    clearTimeout(this.timer)
    this.drawBackground()
    this.generateBoard()
    this.drawBoard()
    this.drawCat(0)
  }

  private addEventListener() {
    this.handleMousemove = this.handleMousemove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.canvas.addEventListener('mousemove', this.handleMousemove)
    this.canvas.addEventListener('click', this.handleClick)
  }

  private getCatRectStartXY() {
    const extraX = this.catPos.y % 2 === 1 ? this.cellSize / 2 : 0
    const x = this.padding + this.catPos.x * this.cellSize + this.xGap * this.catPos.x + extraX
    const y = this.padding + this.catPos.y * this.cellSize + this.yGap * this.catPos.y
    return { x, y }
  }

  private clearCatRect(x: number, y: number) {
    this.ctx.fillStyle = BoardColor.Background
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize)
  }

  private drawCat(idx: number) {
    const { x, y } = this.getCatRectStartXY()
    this.clearCatRect(x, y)
    this.drawCell(this.catPos.x, this.catPos.y, BoardColor.ChessEmpty)
    const { width, height } = imageItem
    const imageItemX = width * (idx % 4)
    const imageItemY = height * Math.floor(idx / 4)
    this.ctx.drawImage(this.cat, imageItemX, imageItemY, width, height, x, y, this.cellSize, this.cellSize)
    this.timer = setTimeout(() => {
      requestAnimationFrame(() => {
        this.drawCat((idx + 1) % 15)
      })
    }, 100)
  }

  private handleMousemove(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const result = this.calcPosIndex(x, y)
    if (result) {
      const { x, y } = result
      if (this.board[y][x] || (x === this.catPos.x && y === this.catPos.y)) {
        canvas.style.cursor = 'not-allowed'
      } else {
        canvas.style.cursor = 'pointer'
      }
    } else {
      canvas.style.cursor = 'default'
    }
  }

  private handleClick(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const result = this.calcPosIndex(x, y)
    if (result) {
      const { x, y } = result
      if (!(x === this.catPos.x && y === this.catPos.y) && !this.board[y][x]) {
        this.board[y][x] = true
        const next = bfs(this.board, this.catPos.x, this.catPos.y, this.size)
        if (next) {
          const { x, y } = this.getCatRectStartXY()
          this.clearCatRect(x, y)
          this.drawCell(this.catPos.x, this.catPos.y, BoardColor.ChessEmpty)
          this.catPos = {
            x: next.x,
            y: next.y,
          }
          requestAnimationFrame(() => {
            if (next.x === 0 || next.x === this.size - 1 || next.y === 0 || next.y === this.size - 1) {
              setTimeout(() => alert('你输了...'), 100)
            }
          })
        } else {
          requestAnimationFrame(() => {
            setTimeout(() => alert('你赢了...'), 100)
            console.log('你赢了...')
          })
        }
        this.drawCell(x, y, BoardColor.ChessDone)
      }
    }
  }

  private calcPosIndex(x: number, y: number): undefined | { x: number; y: number } {
    const numberY1 = Math.floor((y - this.padding) / (this.cellSize + this.yGap))
    const numberY2 = Math.ceil((y - this.padding - this.cellSize) / (this.cellSize + this.yGap))
    if (numberY1 === numberY2 && numberY1 >= 0 && numberY1 < this.size) {
      const isOdd = numberY1 % 2 === 1
      const extraX = isOdd ? this.cellSize / 2 : 0
      const numberX1 = Math.floor((x - this.padding - extraX) / (this.cellSize + this.xGap))
      const numberX2 = Math.ceil((x - this.padding - this.cellSize - extraX) / (this.cellSize + this.xGap))
      if (numberX1 === numberX2 && numberX1 >= 0 && numberX1 < this.size) {
        return { x: numberX1, y: numberY1 }
      }
    }
  }

  private drawBackground() {
    this.ctx.fillStyle = BoardColor.Background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private generateBoard() {
    const size = this.size
    this.board = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
    const catPos = Math.floor(size / 2)
    this.catPos = {
      x: catPos,
      y: catPos,
    }
    for (let i = 0; i < size + getRandomInt(0, 5); i++) {
      while (true) {
        const x = getRandomInt(0, size - 1)
        const y = getRandomInt(0, size - 1)
        if (x === catPos && y === catPos) {
          continue
        }
        this.board[y][x] = true
        break
      }
    }
  }

  private drawCell(x: number, y: number, color: string) {
    this.ctx.beginPath()
    this.ctx.fillStyle = color
    const x1 = (x + 0.5) * this.cellSize + this.padding + (y % 2 === 1 ? this.cellSize / 2 : 0) + x * this.xGap
    const y1 = (y + 0.5) * this.cellSize + this.padding + y * this.yGap
    const r = this.cellSize / 2
    this.ctx.arc(x1, y1, r, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  private drawBoard() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const color = this.board[i][j] ? BoardColor.ChessDone : BoardColor.ChessEmpty
        this.drawCell(j, i, color)
      }
    }
  }
}
