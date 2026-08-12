'use client'

import { useState } from 'react'
import { useAssignments } from '@/hooks/useAssignments'
import { useFacultyOverview } from '@/hooks/useFacultyData'
import {
  createAssignment,
  getFacultySubmissions,
  gradeSubmission,
  type FacultySubmission,
} from '@/services/assignments.service'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpenCheck,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Users,
  ExternalLink,
} from 'lucide-react'
import type { Assignment } from '@/lib/types'

export default function FacultyAssignmentsPage() {
  const { assignments, loading, refetch } = useAssignments()
  const { subjects } = useFacultyOverview()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: '10',
  })

  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<FacultySubmission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({})

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject_id || !form.title || !form.due_date) {
      showToast('Subject, title, and due date are required', 'error')
      return
    }
    setSubmitting(true)
    const res = await createAssignment({
      subject_id: form.subject_id,
      title: form.title,
      description: form.description || undefined,
      due_date: form.due_date,
      max_marks: parseInt(form.max_marks),
    })
    setSubmitting(false)
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    showToast('Assignment created!', 'success')
    setShowForm(false)
    setForm({ subject_id: '', title: '', description: '', due_date: '', max_marks: '10' })
    refetch()
  }

  const openSubmissions = async (assignment: Assignment) => {
    setViewAssignment(assignment)
    setSubmissionsLoading(true)
    setSubmissions([])
    const res = await getFacultySubmissions(assignment.id)
    setSubmissionsLoading(false)
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    setSubmissions(res.data ?? [])
    const inputs: Record<string, string> = {}
    for (const s of res.data ?? []) {
      if (s.marks_obtained != null) inputs[s.id] = String(s.marks_obtained)
    }
    setGradeInputs(inputs)
  }

  const handleGrade = async (submissionId: string) => {
    const marks = parseFloat(gradeInputs[submissionId] ?? '')
    if (isNaN(marks) || marks < 0) {
      showToast('Enter valid marks', 'error')
      return
    }
    setGradingId(submissionId)
    const res = await gradeSubmission(submissionId, marks)
    setGradingId(null)
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    showToast('Submission graded!', 'success')
    if (viewAssignment) openSubmissions(viewAssignment)
  }

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Create assignments and grade student submissions.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create Assignment</h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Subject *</label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    {subjects.map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subjects.code} — {s.subjects.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Lab Report 3 — SQL Joins"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Assignment details…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Due Date *</label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Max Marks</label>
                    <input
                      type="number"
                      value={form.max_marks}
                      onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    'Create Assignment'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submissions modal */}
      <AnimatePresence>
        {viewAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setViewAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submissions</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{viewAssignment.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewAssignment(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {submissionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-slate-500">No submissions yet</p>
                  </div>
                ) : (
                  submissions.map((s) => {
                    const student = s.profiles as { name: string; roll_number?: string } | undefined
                    const isGraded = s.status === 'graded'

                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{student?.name ?? 'Student'}</p>
                            {student?.roll_number && (
                              <p className="text-xs text-slate-500">Roll: {student.roll_number}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              Submitted{' '}
                              {new Date(s.submitted_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {s.status === 'late' && (
                                <span className="ml-2 text-red-600 font-medium">Late</span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isGraded
                                ? 'bg-blue-100 text-blue-700'
                                : s.status === 'late'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isGraded ? 'Graded' : s.status === 'late' ? 'Late' : 'Submitted'}
                          </span>
                        </div>

                        {s.notes && (
                          <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                            {s.notes}
                          </p>
                        )}

                        {s.file_url && (
                          <a
                            href={s.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View submitted file
                          </a>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <input
                            type="number"
                            min={0}
                            max={viewAssignment.max_marks}
                            step={0.5}
                            value={gradeInputs[s.id] ?? ''}
                            onChange={(e) =>
                              setGradeInputs({ ...gradeInputs, [s.id]: e.target.value })
                            }
                            placeholder={`Marks / ${viewAssignment.max_marks}`}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleGrade(s.id)}
                            disabled={gradingId === s.id}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            {gradingId === s.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isGraded ? (
                              'Update'
                            ) : (
                              'Grade'
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <BookOpenCheck className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-slate-500">No assignments yet</p>
          <p className="text-sm mt-1">Click &apos;New Assignment&apos; to create your first one.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="space-y-3"
        >
          {assignments.map((a) => {
            const due = new Date(a.due_date)
            const isPast = due < new Date()
            const subject = a.subjects as { code: string; name: string } | undefined

            return (
              <motion.div
                key={a.id}
                variants={fadeIn}
                className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpenCheck className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <p className="text-sm text-slate-500">
                      {subject?.code} — {subject?.name}
                    </p>
                    {a.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <p
                      className={`text-xs mt-2 flex items-center gap-1 ${isPast ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      <Calendar className="w-3 h-3" />
                      Due:{' '}
                      {due.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {isPast && ' (Closed)'}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">{a.max_marks} marks</p>
                  <button
                    type="button"
                    onClick={() => openSubmissions(a)}
                    className="flex items-center gap-2 px-4 py-2 border border-brand-200 text-brand-700 hover:bg-brand-50 text-sm font-medium rounded-xl transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Submissions
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
