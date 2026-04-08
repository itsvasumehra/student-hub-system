'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Student Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-5 max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
          <p className="text-slate-500 text-sm mt-1">
            An error occurred on this page. Your dashboard and other pages are unaffected.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-100">
            <p className="text-xs text-slate-500 font-mono break-all line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-brand-500/20"
          >
            <RefreshCcw className="w-4 h-4" /> Try again
          </button>
          <Link
            href="/student/dashboard"
            className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-sm transition-colors border border-slate-200"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
