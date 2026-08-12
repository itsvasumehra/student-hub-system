'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  ArrowRight, 
  BarChart3, 
  BookOpenCheck, 
  CalendarCheck,
  Sparkles,
  Loader2,
  LayoutDashboard
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user && profile) {
      const path = profile.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'
      router.replace(path)
    }
  }, [user, profile, loading, router])

  // Show spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  // ── CASE 1: User is authenticated AND has a profile → go to dashboard ──────
  if (user && profile) {
    const dashPath = profile.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.name}!</h1>
          <p className="text-slate-500 mt-1">Taking you to your dashboard…</p>
        </div>
        <Link href={dashPath}>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-all shadow-md">
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </button>
        </Link>
      </div>
    )
  }

  // ── CASE 2: User is authenticated but has NO profile ─────────────────────
  // This happens when the profiles table was recreated (e.g. after a schema reset).
  // The auth account still exists but the profile row was deleted.
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center shadow-md">
          <GraduationCap className="text-yellow-600 w-8 h-8" />
        </div>
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Your login is valid but your profile record is missing. 
            Please complete registration to set up your account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register">
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-all shadow-md">
              Complete Registration
            </button>
          </Link>
          <button
            onClick={async (e) => {
              e.preventDefault()
              await signOut()
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl transition-all shadow-sm hover:bg-slate-50"
          >
            Sign out & re-login
          </button>
        </div>
      </div>
    )
  }

  // ── CASE 3: Not logged in → show full landing page ────────────────────────

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
  const stagger = { visible: { transition: { staggerChildren: 0.2 } } }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative selection:bg-brand-200 selection:text-brand-900">
      
      {/* ── Navbar ── */}
      <nav className="absolute top-0 w-full z-50 p-6 flex items-center justify-between max-w-7xl mx-auto inset-x-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Student Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link href="/register">
            <button className="px-5 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-300/30 blur-[120px] pointer-events-none animate-float" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl flex flex-col items-center">
          
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-100 shadow-sm text-brand-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>The modern operating system for education</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Manage your academic life <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-purple-600 to-blue-600">
              beautifully.
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
            Student Hub bridges the gap between students and faculty. Track attendance, grade assignments, and manage courses in one unified, blazing-fast workspace.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/register">
              <button className="h-14 px-8 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 group w-full sm:w-auto">
                <span>Start for free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button className="h-14 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-lg flex items-center justify-center transition-all border border-slate-200 shadow-sm hover:shadow-md w-full sm:w-auto">
                Sign in to workspace
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Feature Grid ── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          <motion.div variants={fadeIn} className="glass p-8 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Marks & Analytics</h3>
            <p className="text-slate-500 leading-relaxed">
              Real-time performance tracking with detailed analytics. Visualize progress across all semesters instantly.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass p-8 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Assignments</h3>
            <p className="text-slate-500 leading-relaxed">
              Submit, review, and grade assignments in a paperless environment. Automated deadlines and feedbacks.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass p-8 rounded-3xl group hover:-translate-y-1 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Attendance</h3>
            <p className="text-slate-500 leading-relaxed">
              Frictionless attendance logging for faculty and clear visibility for students to ensure they meet requirements.
            </p>
          </motion.div>
        </motion.div>

      </main>
    </div>
  )
}
