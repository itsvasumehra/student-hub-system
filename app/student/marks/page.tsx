'use client'
import { useMarks } from '@/hooks/useMarks'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { BarChart3, BookOpen, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import type { Mark } from '@/lib/types'

const EXAM_LABELS: Record<string, string> = {
  internal1: 'Internal 1',
  internal2: 'Internal 2',
  external: 'External',
  practical: 'Practical',
}

const EXAM_COLORS: Record<string, string> = {
  internal1: 'bg-blue-100 text-blue-700',
  internal2: 'bg-purple-100 text-purple-700',
  external: 'bg-orange-100 text-orange-700',
  practical: 'bg-green-100 text-green-700',
}

export default function StudentMarksPage() {
  const { profile } = useAuth()
  const { marks, loading, error } = useMarks()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  // Calculate summary stats
  const totalSubjects = new Set(marks.map((m: Mark) => m.subjects?.id)).size
  const avgPercentage = marks.length
    ? Math.round(marks.reduce((acc: number, m: Mark) => acc + (m.score / m.max_score) * 100, 0) / marks.length)
    : 0
  const highestScore = marks.length
    ? Math.max(...marks.map((m: Mark) => (m.score / m.max_score) * 100))
    : 0

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900">My Marks</h1>
        <p className="text-slate-500 mt-1">View all your exam scores and performance.</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Subjects Tracked', value: totalSubjects, icon: BookOpen, color: 'text-brand-600 bg-brand-50' },
          { label: 'Average Score', value: `${avgPercentage}%`, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
          { label: 'Best Performance', value: `${Math.round(highestScore)}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
        ].map(stat => (
          <motion.div key={stat.label} variants={fadeIn} className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Marks Table */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">All Exam Scores</h2>
        </div>
        {marks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No marks uploaded yet</p>
            <p className="text-sm mt-1">Your faculty will upload scores here after exams.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Subject</th>
                  <th className="px-6 py-3 text-left">Exam Type</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3 text-center">Percentage</th>
                  <th className="px-6 py-3 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.map((mark: Mark) => {
                  const pct = Math.round((mark.score / mark.max_score) * 100)
                  const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
                  return (
                    <tr key={mark.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{mark.subjects?.name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{mark.subjects?.code}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EXAM_COLORS[mark.exam_type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {EXAM_LABELS[mark.exam_type] ?? mark.exam_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">
                        {mark.score} / {mark.max_score}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-base ${color}`}>{pct}%</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{mark.remarks ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
