import { Board } from 'wasm-cat'
import Painter from './Painter'

export default class Game {
  private painter: Painter
  private board: Board

  constructor(canvas: HTMLCanvasElement, boardSize: number) {
    const canvas_width = Math.min(window.innerWidth, window.innerHeight / 2)
    canvas.width = canvas_width
    canvas.height = canvas_width
    const padding = 20
    const xGap = 3
    this.painter = new Painter(canvas)
    this.addEventListener(canvas)
    this.board = Board.new(canvas_width, boardSize, padding, xGap)
  }

  public start() {
    this.painter.clearTimer()
    this.board.init()
    this.painter.drawBackground()
    const cellsPrt = this.board.cells()
    const boardProps = this.board.get_props()
    this.painter.drawBoard(cellsPrt, boardProps)
    this.painter.drawCat(0, boardProps, this.board)
  }

  private addEventListener(canvas: HTMLCanvasElement) {
    this.handleMousemove = this.handleMousemove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    canvas.addEventListener('mousemove', this.handleMousemove)
    canvas.addEventListener('click', this.handleClick)
  }

  private getClickPoint(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const point = this.board.calc_pos_index(x, y)
    return point
  }

  private handleMousemove(e: MouseEvent) {
    const canvas = e.target as HTMLCanvasElement
    const point = this.getClickPoint(e)
    if (point) {
      const { x, y } = point
      if (!this.board.check_hindrance_ok(x, y)) {
        canvas.style.cursor = 'not-allowed'
      } else {
        canvas.style.cursor = 'pointer'
      }
    } else {
      canvas.style.cursor = 'default'
    }
  }

  private handleClick(e: MouseEvent) {
    const point = this.getClickPoint(e)
    if (point) {
      const { x, y } = point
      if (this.board.check_hindrance_ok(x, y)) {
        this.board.put_hindrance(x, y)
        const next = this.board.bfs()
        const boardProps = this.board.get_props()
        if (next) {
          const { x, y, cat_x, cat_y } = Object.fromEntries(this.board.get_cat_rect_start_xy())
          this.painter.drawChess(x, y, cat_x, cat_y, boardProps, true)
          this.board.set_cat(next.x, next.y)
          const { col, row } = boardProps
          if (next.x === 0 || next.x === col - 1 || next.y === 0 || next.y === row - 1) {
            setTimeout(() => alert('你输了...'), 100)
          }
        } else {
          setTimeout(() => {
            alert('你赢了！')
          }, 100)
        }
        const { x: x1, y: y1, cat_x, cat_y } = Object.fromEntries(this.board.get_rect_xy(x, y))
        this.painter.drawChess(x1, y1, cat_x, cat_y, boardProps, false)
      }
    }
  }
}
