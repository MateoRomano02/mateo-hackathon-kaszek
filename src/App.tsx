import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Hackathon Scaffold</h1>
        <p className="text-zinc-400 max-w-lg">
          Vite + React + Tailwind v4 + Zod + Zustand + Anthropic SDK
        </p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
