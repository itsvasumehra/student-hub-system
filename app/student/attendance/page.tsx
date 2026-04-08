'use client'
import { useAttendance } from '@/hooks/useAttendance'
import { motion } from 'framer-motion'
import { CalendarCheck, Loader2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Attendance, AttendanceSummary } from '@/lib/types'

function AttendanceBar({ percentage }: { percentage: number }) {
  const color = percentage >= 75 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

export default function StudentAttendancePage() {
  const { records, summary, loading, error } = useAttendance()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
      <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
    </div>
  )

  const overallPresent = records.filter((r: Attendance) => r.status === 'present' || r.status === 'late').length
  const overallPct = records.length ? Math.round((overallPresent / records.length) * 100) : 0

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
  const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-500 mt-1">Your attendance record across all subjects.</p>
      </motion.div>

      {/* Overall card */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="glass p-6 rounded-2xl flex items-center gap-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold
          ${overallPct >= 75 ? 'bg-green-100 text-green-700' : overallPct >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {overallPct}%
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Overall Attendance</h2>
          <p className="text-sm text-slate-500">{overallPresent} present out of {records.length} classes</p>
          {overallPct < 75 && (
            <p className="text-sm text-red-600 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Below 75% threshold — at risk
            </p>
          )}
          {overallPct >= 75 && (
            <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Good standing
            </p>
          )}
        </div>
      </motion.div>

      {/* Per-subject breakdown */}
      {summary.length > 0 ? (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Subject Breakdown</h2>
          {summary.map((s: AttendanceSummary) => (
            <motion.div key={s.subject_id} variants={fadeIn} className="glass p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{s.subject_name}</h3>
                  <p className="text-xs text-slate-400">{s.subject_code}</p>
                </div>
                <span className={`text-lg font-bold ${s.percentage >= 75 ? 'text-green-600' : s.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {s.percentage}%
                </span>
              </div>
              <AttendanceBar percentage={s.percentage} />
              <div className="flex gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {s.present} Present</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {s.absent} Absent</span>
                {s.late > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> {s.late} Late</span>}
                <span className="ml-auto">{s.total} Total classes</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-slate-500">No attendance records yet</p>
          <p className="text-sm mt-1">Your faculty will mark attendance here.</p>
        </div>
      )}
    </div>
  )
}
