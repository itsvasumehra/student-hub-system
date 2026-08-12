'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { safeFormatDate } from '@/lib/utils'
import { Bell, BookOpenCheck, Trophy, ClipboardList, Loader2 } from 'lucide-react'

interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  href: string
  created_at: string
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  assignment_due: BookOpenCheck,
  assignment_graded: BookOpenCheck,
  activity_status: Trophy,
  new_submission: ClipboardList,
  activity_pending: Trophy,
}

export function NotificationsPanel() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  const endpoint =
    profile?.role === 'faculty'
      ? '/api/faculty/notifications'
      : profile?.role === 'student'
        ? '/api/student/notifications'
        : null

  const fetchNotifications = async () => {
    if (!endpoint) return
    setLoading(true)
    try {
      const res = await fetch(endpoint)
      const json = await res.json()
      if (res.ok) setItems(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile && endpoint) fetchNotifications()
  }, [profile, endpoint])

  useEffect(() => {
    if (!open) return
    fetchNotifications()
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!profile) return null

  const count = items.length

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="View notifications"
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-brand-600"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {count > 0 && (
              <span className="text-xs text-slate-500">{count} new</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 px-4">
                You&apos;re all caught up!
              </p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {items.map((n) => {
                  const Icon = TYPE_ICONS[n.type] ?? Bell
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 truncate">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {safeFormatDate(n.created_at)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
