import { useEffect, useRef } from 'react'
import Board from './Board'
import './App.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<Board>()

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement
    const padding = 20
    const boardSize = Math.min(window.innerWidth, window.innerHeight / 2)
    canvas.width = boardSize
    canvas.height = boardSize
    // 绘制背景色
    const board = new Board({
      size: 11,
      canvas,
      padding,
    })
    board.init()
    boardRef.current = board
    // 绘制棋盘
  }, [])

  return (
    <div className='h-screen w-screen m-auto pt-10'>
      <h2 className='text-center text-2xl mb-5'>围住神经猫</h2>
      <canvas ref={canvasRef} className='m-auto'></canvas>
      <div className='flex items-center justify-center mt-4'>
        <button
          className='m-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => boardRef.current?.init()}
        >
          重试
        </button>
      </div>
    </div>
  )
}

export default App
