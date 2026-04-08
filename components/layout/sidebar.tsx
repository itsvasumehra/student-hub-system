'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  ScrollText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

export function Sidebar({ role }: { role: 'student' | 'faculty' }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const studentLinks = [
    { name: 'Dashboard',   href: '/student/dashboard',   icon: LayoutDashboard },
    { name: 'My Profile',  href: '/student/profile',     icon: UserCircle2 },
    { name: 'Resume',      href: '/student/resume',      icon: ScrollText },
    { name: 'Marks',       href: '/student/marks',        icon: BarChart3 },
    { name: 'Assignments', href: '/student/assignments',  icon: BookOpenCheck },
    { name: 'Attendance',  href: '/student/attendance',   icon: CalendarCheck },
    { name: 'Activities',  href: '/student/activities',   icon: Trophy },
    { name: 'Mark Sheets', href: '/student/marksheets',   icon: FileText },
    { name: 'Settings',    href: '/student/settings',     icon: Settings },
  ]

  const facultyLinks = [
    { name: 'Dashboard',   href: '/faculty/dashboard',   icon: LayoutDashboard },
    { name: 'Upload Marks',href: '/faculty/marks',        icon: BarChart3 },
    { name: 'Assignments', href: '/faculty/assignments',  icon: BookOpenCheck },
    { name: 'Attendance',  href: '/faculty/attendance',   icon: CalendarCheck },
    { name: 'Students',    href: '/faculty/students',     icon: Users },
    { name: 'Activities',  href: '/faculty/activities',   icon: Trophy },
    { name: 'Settings',    href: '/faculty/settings',     icon: Settings },
  ]

  const links = role === 'student' ? studentLinks : facultyLinks


  return (
    <aside className="w-64 hidden lg:flex flex-col h-screen fixed left-0 top-0 glass-panel border-r border-white/40 z-40 bg-white/60">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-purple-800">
          Student Hub
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link key={link.name} href={link.href}>
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
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-brand-600" : "text-slate-400 group-hover:text-brand-500")} />
                <span className="relative z-10">{link.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={signOut}
          className="group flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
