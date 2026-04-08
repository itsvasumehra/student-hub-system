'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service safely
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900">Something went wrong!</h2>
        
        <p className="text-slate-500 text-sm">
          A critical error occurred while rendering this page. If the issue persists, contact support.
        </p>
        
        <div className="p-4 bg-slate-50 rounded-lg text-left overflow-hidden border border-slate-100">
          <p className="text-xs text-slate-600 font-mono break-all line-clamp-2">
            {error.message || 'Unknown framework error'}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/20"
          >
            <RefreshCcw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    </div>
  )
}
