'use client'
import { useAssignments } from '@/hooks/useAssignments'
import { motion } from 'framer-motion'
import { BookOpenCheck, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Calendar } from 'lucide-react'
import type { Assignment, Submission } from '@/lib/types'

// Assignment joined with its submitted submission (if any) from useAssignments hook
interface AssignmentWithSubmission extends Assignment {
  submission?: Submission | null
}

function getDaysLeft(dueDateStr: string) {
  const due = new Date(dueDateStr)
  const now = new Date()
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  submitted: { label: 'Submitted', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  graded: { label: 'Graded', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  late: { label: 'Late', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function StudentAssignmentsPage() {
  const { assignments, loading, error } = useAssignments()

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

  const pending = assignments.filter((a: AssignmentWithSubmission) => !a.submission)
  const submitted = assignments.filter((a: AssignmentWithSubmission) => a.submission)

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
  const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-500 mt-1">{pending.length} pending · {submitted.length} submitted</p>
      </motion.div>

      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Pending</h2>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {pending.map((a: AssignmentWithSubmission) => {
              const days = getDaysLeft(a.due_date)
              const urgency = days <= 1 ? 'border-red-300 bg-red-50' : days <= 3 ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200 bg-white'
              const daysColor = days <= 1 ? 'text-red-600' : days <= 3 ? 'text-yellow-600' : 'text-slate-500'
              return (
                <motion.div key={a.id} variants={fadeIn}
                  className={`glass p-5 rounded-2xl border ${urgency} flex items-start justify-between gap-4`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpenCheck className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{(a.subjects as { code: string; name: string })?.code} — {(a.subjects as { code: string; name: string })?.name}</p>
                      {a.description && <p className="text-sm text-slate-600 mt-1">{a.description}</p>}
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(a.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${daysColor}`}>
                      {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Max: {a.max_marks} marks</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {/* Submitted */}
      {submitted.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Submitted</h2>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {submitted.map((a: AssignmentWithSubmission) => {
              const status = a.submission?.status ?? 'submitted'
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted
              return (
                <motion.div key={a.id} variants={fadeIn} className="glass p-5 rounded-2xl flex items-start justify-between gap-4 opacity-80">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{(a.subjects as { code: string; name: string })?.code} — {(a.subjects as { code: string; name: string })?.name}</p>
                      {a.submission?.marks_obtained != null && (
                        <p className="text-sm font-medium text-brand-600 mt-1">
                          Score: {a.submission.marks_obtained} / {a.max_marks}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                    <cfg.icon className="w-3.5 h-3.5" />{cfg.label}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {assignments.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <BookOpenCheck className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-slate-500">No assignments yet</p>
          <p className="text-sm mt-1">Your faculty will post assignments here.</p>
        </div>
      )}
    </div>
  )
}
