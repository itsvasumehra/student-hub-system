'use client'
import { useEffect, useState } from 'react'

export default function TestConnection() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState<unknown>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('Testing Server-side Connection...')
      const res = await fetch('/api/test-connection')
      const json = await res.json()

      if (res.ok && json.success) {
        setStatus('✅ Server Connection Successful!')
        setDetails(json.details)
      } else {
        setStatus('❌ Server Connection Failed: ' + json.error)
        setDetails(json)
      }
    } catch (err: unknown) {
      setStatus('❌ Network/Connection Failed: ' + (err instanceof Error ? err.message : String(err)))
      setDetails(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Supabase Connection Test
        </h1>

        <div className={`p-6 rounded-lg mb-6 text-center text-xl font-bold ${
          status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </div>

        {details !== null && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Details:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-bold mb-2">Environment Variables:</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <div className="text-sm text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set'}
              </div>
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
              <div className="text-sm text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                  ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} characters)`
                  : '❌ Not set'
                }
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={testConnection}
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Test Again
        </button>
      </div>
    </div>
  )
}