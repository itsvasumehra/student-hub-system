'use client'
import { useState } from 'react'

export default function PracticePage() {
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGreeting(`Hello, ${name}! Welcome to Student Hub 👋`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Practice Component
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Greet Me!
          </button>
        </form>

        {greeting && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-center font-medium">
              {greeting}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
