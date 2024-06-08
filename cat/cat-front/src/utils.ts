export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface Point {
  x: number
  y: number
  parent?: Point
}

export function bfs(board: boolean[][], x: number, y: number, boardSize: number) {
  const queue: Point[] = [{ x, y }]
  const map = new Map<string, boolean>()
  while (queue.length > 0) {
    const current = queue.shift()!
    const { x, y } = current
    map.set(`${x}:${y}`, true)
    if (x === 0 || x === boardSize - 1 || y === 0 || y === boardSize - 1) {
      let p = current
      let last = p
      const paths = []
      while (p.parent) {
        last = p
        paths.push(last)
        p = p.parent
      }
      console.log(paths)
      return last
    }
    const v = y % 2 === 1 ? 1 : -1
    const directions = [
      [-1, 0],
      [-1, v],
      [0, -1],
      [0, 1],
      [1, 0],
      [1, v],
    ]
    for (const dir of directions) {
      const dy = y + dir[0]
      const dx = x + dir[1]
      if (0 <= dy && dy < boardSize && 0 <= dx && dx < boardSize && !board[dy][dx] && !map.get(`${dx}:${dy}`)) {
        queue.push({ x: dx, y: dy, parent: current })
      }
    }
  }
}
