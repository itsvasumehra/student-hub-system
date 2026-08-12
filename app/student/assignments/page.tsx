'use client'

import { useState } from 'react'
import { useAssignments } from '@/hooks/useAssignments'
import { submitAssignment } from '@/services/assignments.service'
import { supabase } from '@/lib/supabase-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  UploadCloud,
  ExternalLink,
  X,
} from 'lucide-react'
import type { Assignment, Submission } from '@/lib/types'

interface AssignmentWithSubmission extends Assignment {
  submission?: Submission | null
}

function getDaysLeft(dueDateStr: string) {
  const due = new Date(dueDateStr)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  submitted: { label: 'Submitted', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  graded: { label: 'Graded', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  late: { label: 'Late', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function StudentAssignmentsPage() {
  const { assignments, loading, error, refetch } = useAssignments()
  const [submitTarget, setSubmitTarget] = useState<AssignmentWithSubmission | null>(null)
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const openSubmit = (assignment: AssignmentWithSubmission) => {
    setSubmitTarget(assignment)
    setNotes('')
    setFile(null)
    setSubmitError(null)
  }

  const closeSubmit = () => {
    if (submitting) return
    setSubmitTarget(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submitTarget) return

    if (!file && !notes.trim()) {
      setSubmitError('Upload a file or add notes before submitting')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      let fileUrl: string | undefined

      if (file) {
        const ext = file.name.split('.').pop()
        const fileName = `${submitTarget.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('assignments')
          .upload(fileName, file)

        if (uploadError) throw new Error(uploadError.message)

        const { data: publicUrlData } = supabase.storage
          .from('assignments')
          .getPublicUrl(fileName)

        fileUrl = publicUrlData.publicUrl
      }

      const res = await submitAssignment({
        assignment_id: submitTarget.id,
        file_url: fileUrl,
        notes: notes.trim() || undefined,
      })

      if (res.error) {
        setSubmitError(res.error)
        return
      }

      setSubmitTarget(null)
      refetch()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

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

  const pending = assignments.filter((a: AssignmentWithSubmission) => !a.submission)
  const submitted = assignments.filter((a: AssignmentWithSubmission) => a.submission)

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
  const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-500 mt-1">
          {pending.length} pending · {submitted.length} submitted
        </p>
      </motion.div>

      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Pending</h2>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {pending.map((a: AssignmentWithSubmission) => {
              const days = getDaysLeft(a.due_date)
              const urgency =
                days <= 1
                  ? 'border-red-300 bg-red-50'
                  : days <= 3
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-slate-200 bg-white'
              const daysColor =
                days <= 1 ? 'text-red-600' : days <= 3 ? 'text-yellow-600' : 'text-slate-500'
              const subject = a.subjects as { code: string; name: string } | undefined

              return (
                <motion.div
                  key={a.id}
                  variants={fadeIn}
                  className={`glass p-5 rounded-2xl border ${urgency} flex flex-col sm:flex-row sm:items-start justify-between gap-4`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpenCheck className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {subject?.code} — {subject?.name}
                      </p>
                      {a.description && <p className="text-sm text-slate-600 mt-1">{a.description}</p>}
                      {a.file_url && (
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View assignment file
                        </a>
                      )}
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due:{' '}
                        {new Date(a.due_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${daysColor}`}>
                        {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Max: {a.max_marks} marks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openSubmit(a)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Submitted</h2>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {submitted.map((a: AssignmentWithSubmission) => {
              const status = a.submission?.status ?? 'submitted'
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted
              const subject = a.subjects as { code: string; name: string } | undefined

              return (
                <motion.div
                  key={a.id}
                  variants={fadeIn}
                  className="glass p-5 rounded-2xl flex items-start justify-between gap-4 opacity-90"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {subject?.code} — {subject?.name}
                      </p>
                      {a.submission?.marks_obtained != null && (
                        <p className="text-sm font-medium text-brand-600 mt-1">
                          Score: {a.submission.marks_obtained} / {a.max_marks}
                        </p>
                      )}
                      {a.submission?.file_url && (
                        <a
                          href={a.submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View your submission
                        </a>
                      )}
                      {a.submission?.submitted_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted{' '}
                          {new Date(a.submission.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                  >
                    <cfg.icon className="w-3.5 h-3.5" />
                    {cfg.label}
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

      <AnimatePresence>
        {submitTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeSubmit()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submit Assignment</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{submitTarget.title}</p>
                </div>
                <button
                  type="button"
                  onClick={closeSubmit}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any comments for your faculty…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Upload file</label>
                  <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {file ? file.name : 'Click to upload PDF, DOC, or ZIP'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Assignment'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
