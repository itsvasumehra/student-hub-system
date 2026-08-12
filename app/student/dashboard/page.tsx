'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  Trophy,
  FileText,
  Hash,
  Building2,
  Mail,
  Loader2,
  UserCircle2,
  AlertTriangle,
  Megaphone,
  ScrollText,
} from 'lucide-react'
import type { AttendanceDeficit } from '@/lib/attendance-utils'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  profiles?: { name: string }
  subjects?: { code: string; name: string } | null
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<{
    pendingAssignments: number
    dueSoon: number
    attendanceWarnings: AttendanceDeficit[]
  } | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      fetch('/api/student/dashboard').then((r) => r.json()),
      fetch('/api/student/announcements').then((r) => r.json()),
    ]).then(([dash, ann]) => {
      if (dash.data) setStats(dash.data)
      if (ann.data) setAnnouncements(ann.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [profile])

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  const features = [
    { icon: UserCircle2, title: 'My Profile', desc: 'Edit your profile, skills & experience', bg: 'bg-brand-100', text: 'text-brand-600', href: '/student/profile' },
    { icon: ScrollText, title: 'Resume', desc: 'Build and print your resume', bg: 'bg-violet-100', text: 'text-violet-600', href: '/student/resume' },
    { icon: BarChart3, title: 'View Marks', desc: 'Check SGPA and exam scores', bg: 'bg-indigo-100', text: 'text-indigo-600', href: '/student/marks' },
    { icon: BookOpenCheck, title: 'Assignments', desc: 'Submit assignments and track deadlines', bg: 'bg-purple-100', text: 'text-purple-600', href: '/student/assignments' },
    { icon: CalendarCheck, title: 'Attendance', desc: 'View attendance and deficit warnings', bg: 'bg-blue-100', text: 'text-blue-600', href: '/student/attendance' },
    { icon: Trophy, title: 'Activities', desc: 'Add and track your achievements', bg: 'bg-yellow-100', text: 'text-yellow-600', href: '/student/activities' },
    { icon: FileText, title: 'Mark Sheets', desc: 'Upload semester mark sheets', bg: 'bg-emerald-100', text: 'text-emerald-600', href: '/student/marksheets' },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={containerVars} className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-slate-500 mt-2">Here&apos;s what needs your attention today.</p>
      </motion.div>

      {!loading && stats && (stats.pendingAssignments > 0 || stats.attendanceWarnings.length > 0) && (
        <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingAssignments > 0 && (
            <Link href="/student/assignments" className="glass p-5 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpenCheck className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-bold text-slate-900">{stats.pendingAssignments} pending assignment{stats.pendingAssignments > 1 ? 's' : ''}</p>
                  {stats.dueSoon > 0 && (
                    <p className="text-sm text-red-600 font-medium">{stats.dueSoon} due within 7 days</p>
                  )}
                </div>
              </div>
            </Link>
          )}
          {stats.attendanceWarnings.length > 0 && (
            <Link href="/student/attendance" className="glass p-5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="font-bold text-slate-900">Attendance alert</p>
                  <p className="text-sm text-amber-700">
                    {stats.attendanceWarnings.length} subject{stats.attendanceWarnings.length > 1 ? 's' : ''} below 75%
                  </p>
                </div>
              </div>
            </Link>
          )}
        </motion.div>
      )}

      <motion.div variants={itemVars}>
        <Card glass={false} className="bg-gradient-to-br from-brand-600 to-purple-800 text-white overflow-hidden relative border-none shadow-xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 p-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><Hash className="w-4 h-4" /> Roll Number</div>
              <span className="text-xl font-bold">{profile.roll_number}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><Building2 className="w-4 h-4" /> Department</div>
              <span className="text-xl font-bold">{profile.department}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><CalendarCheck className="w-4 h-4" /> Semester</div>
              <span className="text-xl font-bold">{profile.semester}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><Mail className="w-4 h-4" /> Email</div>
              <span className="text-lg font-semibold truncate">{profile.email}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVars} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <Link key={feat.href} href={feat.href}>
                <Card className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardHeader className="!mb-0 !space-y-2">
                    <CardTitle>{feat.title}</CardTitle>
                    <CardDescription>{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </motion.div>

        <motion.div variants={itemVars}>
          <Card className="h-full">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-600" />
                <CardTitle>Announcements</CardTitle>
              </div>
              <CardDescription>Updates from your faculty</CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
              ) : announcements.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No announcements yet.</p>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                    {(a.subjects as { code: string } | null)?.code && (
                      <p className="text-xs text-brand-600 mt-0.5">{(a.subjects as { code: string }).code}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3">{a.content}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {(a.profiles as { name: string })?.name} ·{' '}
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
