'use client'

import { Bell, Search, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function Header() {
  const { profile } = useAuth()

  return (
    <header className="h-16 lg:h-20 lg:ml-64 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-slate-200/50 gap-4">
      <div className="hidden md:flex items-center gap-2 bg-white/50 hover:bg-white/80 transition-colors px-4 py-2.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 flex-1 max-w-md shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
        />
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden flex-1" />

      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-brand-600"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{profile?.name || 'Loading...'}</span>
            <span className="text-xs text-slate-500 capitalize">{profile?.role || 'User'} • {profile?.department || ''}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-md border-2 border-white">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
