'use client'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  BarChart3, 
  BookOpenCheck, 
  CalendarCheck, 
  Calendar, 
  Trophy, 
  MessageSquare,
  Hash,
  Building2,
  Mail,
  Loader2,
  UserCircle2
} from 'lucide-react'

export default function StudentDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace('/login')
    } else if (!loading && profile && profile.role !== 'student') {
      router.replace('/faculty/dashboard')
    }
  }, [loading, user, profile, router])

  if (loading || !user || !profile || profile.role !== 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const features = [
    { icon: UserCircle2, title: 'My Profile', desc: 'Edit your profile, skills & projects', bg: 'bg-brand-100', text: 'text-brand-600', href: '/student/profile' },
    { icon: BarChart3, title: 'View Marks', desc: 'Check your scores and performance', bg: 'bg-indigo-100', text: 'text-indigo-600', href: '/student/marks' },
    { icon: BookOpenCheck, title: 'Assignments', desc: 'Submit assignments and track deadlines', bg: 'bg-purple-100', text: 'text-purple-600', href: '/student/assignments' },
    { icon: CalendarCheck, title: 'Attendance', desc: 'View your attendance record', bg: 'bg-blue-100', text: 'text-blue-600', href: '/student/attendance' },
    { icon: Trophy, title: 'Activities', desc: 'Add and track your achievements', bg: 'bg-yellow-100', text: 'text-yellow-600', href: '/student/activities' },
    { icon: MessageSquare, title: 'Mark Sheets', desc: 'Upload and manage semester mark sheets', bg: 'bg-emerald-100', text: 'text-emerald-600', href: '/student/marksheets' },
  ]

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVars}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Greeting */}
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile.name}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Here's what's happening with your academic life today.
        </p>
      </motion.div>

      {/* Profile Overview Card */}
      <motion.div variants={itemVars}>
        <Card glass={false} className="bg-gradient-to-br from-brand-600 to-purple-800 text-white overflow-hidden relative border-none shadow-xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 p-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <Hash className="w-4 h-4" /> Roll Number
              </div>
              <span className="text-xl font-bold">{profile.roll_number}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <Building2 className="w-4 h-4" /> Department
              </div>
              <span className="text-xl font-bold">{profile.department}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <CalendarCheck className="w-4 h-4" /> Semester
              </div>
              <span className="text-xl font-bold">{profile.semester}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <Mail className="w-4 h-4" /> Email
              </div>
              <span className="text-lg font-semibold truncate">{profile.email}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Features Staggered Grid */}
      <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon
          return (
            <motion.div key={idx} variants={itemVars}>
              <Link href={feat.href ?? '#'}>
                <Card className="group cursor-pointer hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardHeader className="!mb-0 !space-y-2">
                    <CardTitle>{feat.title}</CardTitle>
                    <CardDescription>{feat.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
