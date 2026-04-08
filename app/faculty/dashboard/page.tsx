'use client'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
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
  PieChart,
  BadgeCheck,
  Building2,
  Mail,
  Loader2,
  BookMarked
} from 'lucide-react'
import { FacultySubject } from '@/lib/types'

export default function FacultyDashboard() {
  const { user, profile, loading } = useAuth()
  const [mySubjects, setMySubjects] = useState<FacultySubject[]>([])
  const [pendingActivities, setPendingActivities] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (profile) {
      fetchMySubjects()
      fetchPendingActivities()
    }
  }, [profile])

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace('/login')
    } else if (!loading && profile && profile.role !== 'faculty') {
      router.replace('/student/dashboard')
    }
  }, [loading, user, profile, router])

  const fetchMySubjects = async () => {
    try {
      const res = await fetch('/api/faculty/subjects')
      const json = await res.json()
      if (res.ok && json.data) setMySubjects(json.data)
    } catch (err) {
      console.error('Error fetching faculty subjects:', err)
    }
  }

  const fetchPendingActivities = async () => {
    try {
      const res = await fetch('/api/faculty/activities-list')
      const json = await res.json()
      if (res.ok && json.data) {
        setPendingActivities(json.data.filter((a: { approval_status: string }) => a.approval_status === 'pending').length)
      }
    } catch { /* silent */ }
  }

  if (loading || !user || !profile || profile.role !== 'faculty') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    )
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  const features = [
    { icon: BarChart3,    title: 'Upload Marks',      desc: 'Enter assessment scores for your students',  bg: 'bg-brand-100',   text: 'text-brand-600',  href: '/faculty/marks'       },
    { icon: BookOpenCheck,title: 'Assignments',        desc: 'Create and grade student assignments',        bg: 'bg-purple-100',  text: 'text-purple-600', href: '/faculty/assignments' },
    { icon: CalendarCheck,title: 'Mark Attendance',   desc: 'Record daily student attendance',             bg: 'bg-blue-100',    text: 'text-blue-600',   href: '/faculty/attendance'  },
    { icon: Users,        title: 'Students',          desc: 'View and manage student profiles',            bg: 'bg-pink-100',    text: 'text-pink-600',   href: '/faculty/students'    },
    { icon: Trophy,       title: 'Approve Activities',desc: 'Verify student achievements',                 bg: 'bg-yellow-100',  text: 'text-yellow-600', href: '/faculty/activities', badge: pendingActivities },
    { icon: PieChart,     title: 'Analytics',         desc: 'View class performance metrics',              bg: 'bg-emerald-100', text: 'text-emerald-600',href: '#'                    },
  ]

  return (
    <motion.div initial="hidden" animate="show" variants={containerVars} className="space-y-8 max-w-7xl mx-auto">

      {/* Greeting */}
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile.name}! 👨‍🏫
        </h1>
        <p className="text-slate-500 mt-2">Manage your classes, students, and curriculum from your faculty hub.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Profile Overview Card */}
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

          {/* Quick Actions Grid */}
          <motion.div variants={itemVars}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feat, idx) => {
                const Icon = feat.icon
                return (
                  <motion.div key={idx} variants={itemVars}>
                    <Link href={feat.href ?? '#'}>
                      <Card className="group cursor-pointer hover:-translate-y-1 transition-all duration-300 relative">
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
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* My Subjects Panel */}
        <motion.div variants={itemVars} className="lg:col-span-1">
          <Card className="h-full bg-white/60">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>Currently assigned courses</CardDescription>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <BookMarked className="w-5 h-5" />
              </div>
            </CardHeader>
            <div className="p-6 space-y-4">
              {mySubjects.length > 0 ? (
                mySubjects.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
                    <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{item.subjects?.code}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.subjects?.name}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <BookMarked className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No subjects assigned yet.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}