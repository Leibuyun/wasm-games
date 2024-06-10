import { useEffect, useRef } from 'react'
import Game from './Game'
import './App.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game>()

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement
    const game = new Game(canvas, 11)
    gameRef.current = game
    game.start()
  }, [])

  return (
    <div className='h-screen w-screen m-auto pt-10'>
      <h2 className='text-center text-2xl mb-5'>围住神经猫</h2>
      <canvas ref={canvasRef} className='m-auto'></canvas>
      <div className='flex items-center justify-center mt-4'>
        <button
          className='m-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => gameRef.current?.start()}
        >
          重试
        </button>
      </div>
    </div>
  )
}

export default App
