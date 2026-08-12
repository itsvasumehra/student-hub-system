'use client'

import { NotificationsPanel } from '@/components/layout/notifications-panel'
import { Menu, Search, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile } = useAuth()

  return (
    <header className="h-16 lg:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-slate-200/50 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 bg-white/50 hover:bg-white/80 transition-colors px-4 py-2.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500/50 flex-1 max-w-md shadow-sm cursor-not-allowed opacity-50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            readOnly
            tabIndex={-1}
            placeholder="Search (coming soon)..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
        <NotificationsPanel />

        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{profile?.name || 'Loading...'}</span>
            <span className="text-xs text-slate-500 capitalize">
              {profile?.role || 'User'} • {profile?.department || ''}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-md border-2 border-white">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  )
}
