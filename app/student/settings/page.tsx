'use client'

import { motion } from 'framer-motion'
import { Settings, UserCircle2, Mail, Building2, GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function StudentSettingsPage() {
  const { profile, user, signOut } = useAuth()
  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your account details and session.</p>
      </motion.div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ ...fadeIn, visible: { opacity: 1, y: 0, transition: { delay: 0.08 } } }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-base font-semibold text-slate-900">Account Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-2">
              <UserCircle2 className="w-4 h-4" />
              Full Name
            </p>
            <p className="text-sm font-medium text-slate-900">{profile?.name ?? 'Not available'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </p>
            <p className="text-sm font-medium text-slate-900 break-all">{user?.email ?? 'Not available'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Department
            </p>
            <p className="text-sm font-medium text-slate-900">{profile?.department ?? 'Not available'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Role
            </p>
            <p className="text-sm font-medium text-slate-900 capitalize">{profile?.role ?? 'Student'}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </motion.section>
    </div>
  )
}
