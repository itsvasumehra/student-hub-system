'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  Trophy,
  Users,
  Settings,
  LogOut,
  Sparkles,
  FileText,
  UserCircle2,
  ScrollText,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const studentLinks = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/student/profile', icon: UserCircle2 },
  { name: 'Resume', href: '/student/resume', icon: ScrollText },
  { name: 'Marks', href: '/student/marks', icon: BarChart3 },
  { name: 'Assignments', href: '/student/assignments', icon: BookOpenCheck },
  { name: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
  { name: 'Activities', href: '/student/activities', icon: Trophy },
  { name: 'Mark Sheets', href: '/student/marksheets', icon: FileText },
  { name: 'Settings', href: '/student/settings', icon: Settings },
]

const facultyLinks = [
  { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Upload Marks', href: '/faculty/marks', icon: BarChart3 },
  { name: 'Assignments', href: '/faculty/assignments', icon: BookOpenCheck },
  { name: 'Attendance', href: '/faculty/attendance', icon: CalendarCheck },
  { name: 'Students', href: '/faculty/students', icon: Users },
  { name: 'Activities', href: '/faculty/activities', icon: Trophy },
  { name: 'Settings', href: '/faculty/settings', icon: Settings },
]

function NavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: typeof studentLinks
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href
        const Icon = link.icon

        return (
          <Link key={link.name} href={link.href} onClick={onNavigate}>
            <div
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 group',
                isActive
                  ? 'text-brand-700'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-white/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-white/60 pointer-events-none"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 relative z-10',
                  isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'
                )}
              />
              <span className="relative z-10">{link.name}</span>
            </div>
          </Link>
        )
      })}
    </>
  )
}

export function Sidebar({
  role,
  mobileOpen = false,
  onMobileClose,
}: {
  role: 'student' | 'faculty'
  mobileOpen?: boolean
  onMobileClose?: () => void
}) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const links = role === 'student' ? studentLinks : facultyLinks

  const handleSignOut = () => {
    onMobileClose?.()
    signOut()
  }

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-purple-800">
            Student Hub
          </span>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavLinks links={links} pathname={pathname} onNavigate={onMobileClose} />
      </nav>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 hidden lg:flex flex-col h-screen fixed left-0 top-0 glass-panel border-r border-white/40 z-40 bg-white/60">
        {sidebarContent}
      </aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 w-72 h-screen flex flex-col glass-panel border-r border-white/40 z-50 bg-white/95 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
