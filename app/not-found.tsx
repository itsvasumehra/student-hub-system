import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="bg-brand-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-brand-500/20">
          <FileQuestion className="w-12 h-12 text-brand-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-slate-700">Page not found</h2>
        
        <p className="text-slate-500">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or doesn't exist.
        </p>

        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20"
          >
            <Home className="w-4 h-4" /> Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
