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
  Users,
  Trophy,
  BadgeCheck,
  Building2,
  Mail,
  Loader2,
  BookMarked,
  Megaphone,
  Plus,
  Trash2,
} from 'lucide-react'
import type { FacultySubject } from '@/lib/types'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  subject_id?: string
  subjects?: { code: string; name: string } | null
}

export default function FacultyDashboard() {
  const { profile } = useAuth()
  const [mySubjects, setMySubjects] = useState<FacultySubject[]>([])
  const [pendingActivities, setPendingActivities] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', subject_id: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchMySubjects()
    fetchPendingActivities()
    fetchAnnouncements()
  }, [profile])

  const fetchMySubjects = async () => {
    const res = await fetch('/api/faculty/subjects')
    const json = await res.json()
    if (res.ok && json.data) setMySubjects(json.data)
  }

  const fetchPendingActivities = async () => {
    const res = await fetch('/api/faculty/activities-list')
    const json = await res.json()
    if (res.ok && json.data) {
      setPendingActivities(json.data.filter((a: { approval_status: string }) => a.approval_status === 'pending').length)
    }
  }

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/faculty/announcements')
    const json = await res.json()
    if (res.ok && json.data) setAnnouncements(json.data)
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/faculty/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        subject_id: form.subject_id || undefined,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setForm({ title: '', content: '', subject_id: '' })
      setShowForm(false)
      fetchAnnouncements()
    }
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/faculty/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAnnouncements()
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    )
  }

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  const features = [
    { icon: BarChart3, title: 'Upload Marks', desc: 'Enter assessment scores', bg: 'bg-brand-100', text: 'text-brand-600', href: '/faculty/marks' },
    { icon: BookOpenCheck, title: 'Assignments', desc: 'Create and grade assignments', bg: 'bg-purple-100', text: 'text-purple-600', href: '/faculty/assignments' },
    { icon: CalendarCheck, title: 'Mark Attendance', desc: 'Record daily attendance', bg: 'bg-blue-100', text: 'text-blue-600', href: '/faculty/attendance' },
    { icon: Users, title: 'Students', desc: 'Browse student profiles', bg: 'bg-pink-100', text: 'text-pink-600', href: '/faculty/students' },
    { icon: Trophy, title: 'Approve Activities', desc: 'Verify achievements', bg: 'bg-yellow-100', text: 'text-yellow-600', href: '/faculty/activities', badge: pendingActivities },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={containerVars} className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-slate-500 mt-2">Manage your classes, students, and announcements.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVars}>
            <Card glass={false} className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white overflow-hidden relative border-none shadow-xl shadow-purple-900/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><BadgeCheck className="w-4 h-4" /> Employee ID</div>
                  <span className="text-xl font-bold">{profile.employee_id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><Building2 className="w-4 h-4" /> Department</div>
                  <span className="text-xl font-bold">{profile.department}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><BookMarked className="w-4 h-4" /> Subjects</div>
                  <span className="text-xl font-bold">{mySubjects.length} Assigned</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium"><Mail className="w-4 h-4" /> Email</div>
                  <span className="text-lg font-semibold truncate">{profile.email}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVars}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feat) => {
                const Icon = feat.icon
                return (
                  <Link key={feat.href} href={feat.href}>
                    <Card className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative h-full">
                      {feat.badge! > 0 && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow">
                          {feat.badge}
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-xl ${feat.bg} ${feat.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardHeader className="!p-0 !pb-2 !mb-0 !space-y-1">
                        <CardTitle className="text-base">{feat.title}</CardTitle>
                        <CardDescription className="text-xs">{feat.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVars} className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>Currently assigned</CardDescription>
              </div>
              <BookMarked className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <div className="p-6 space-y-3">
              {mySubjects.length > 0 ? (
                mySubjects.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                    <p className="font-bold text-slate-900 text-sm">{item.subjects?.code}</p>
                    <p className="text-xs text-slate-500">{item.subjects?.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No subjects assigned.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-600" />
                  <CardTitle className="text-base">Announcements</CardTitle>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <div className="p-4 space-y-4">
              {showForm && (
                <form onSubmit={handlePost} className="space-y-3 p-4 rounded-xl bg-brand-50/50 border border-brand-100">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Message for students…"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    required
                  />
                  <select
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">All department students</option>
                    {mySubjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subjects?.code} — {s.subjects?.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-brand-600 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                  >
                    {submitting ? 'Posting…' : 'Post Announcement'}
                  </button>
                </form>
              )}
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No announcements posted.</p>
              ) : (
                announcements.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-3 rounded-xl border border-slate-100 flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{a.content}</p>
                    </div>
                    <button type="button" onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
