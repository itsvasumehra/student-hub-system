'use client'
import { useState, useEffect, useCallback } from 'react'
import { useFacultyOverview } from '@/hooks/useFacultyData'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Loader2, CheckCircle2, AlertCircle, Users, Upload } from 'lucide-react'
import type { FacultySubject } from '@/services/faculty.service'
import type { ExamType } from '@/lib/types'

interface StudentMarkRow {
  id: string
  name: string
  roll_number: string
  score: string   // string for input control; null/empty = not entered
  error?: string
}

const EXAM_TYPES: { value: ExamType; label: string }[] = [
  { value: 'internal1', label: 'Internal 1' },
  { value: 'internal2', label: 'Internal 2' },
  { value: 'external',  label: 'External'   },
  { value: 'practical', label: 'Practical'  },
]

export default function FacultyMarksPage() {
  const { subjects } = useFacultyOverview()
  const [subjectId, setSubjectId] = useState('')
  const [examType, setExamType] = useState<ExamType>('internal1')
  const [maxScore, setMaxScore] = useState('100')
  const [students, setStudents] = useState<StudentMarkRow[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadStudents = useCallback(async (sid: string) => {
    if (!sid) { setStudents([]); return }
    setLoadingStudents(true)
    try {
      const res = await fetch(`/api/faculty/students?subject_id=${sid}`)
      const json = await res.json()
      if (res.ok && json.data) {
        setStudents(json.data.map((s: { id: string; name: string; roll_number: string }) => ({
          ...s, score: '',
        })))
      }
    } catch { showToast('Failed to load students', 'error') }
    finally { setLoadingStudents(false) }
  }, [])

  useEffect(() => { loadStudents(subjectId) }, [subjectId, loadStudents])

  const updateScore = (id: string, value: string) => {
    const max = parseFloat(maxScore) || 100
    const num = parseFloat(value)
    const error = value !== '' && (isNaN(num) || num < 0 || num > max)
      ? `Must be 0–${max}` : undefined
    setStudents(s => s.map(r => r.id === id ? { ...r, score: value, error } : r))
  }

  const handleSubmit = async () => {
    // Validate
    const hasErrors = students.some(s => s.error)
    if (hasErrors) { showToast('Fix validation errors before submitting', 'error'); return }

    const filled = students.filter(s => s.score !== '')
    if (filled.length === 0) { showToast('Enter at least one score', 'error'); return }

    if (!subjectId) { showToast('Select a subject', 'error'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/faculty/marks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectId,
          exam_type: examType,
          max_score: parseFloat(maxScore) || 100,
          rows: students.map(s => ({
            student_id: s.id,
            score: s.score !== '' ? parseFloat(s.score) : null,
          })),
        }),
      })
      const json = await res.json()
      if (res.ok) {
        showToast(json.message ?? 'Marks saved!', 'success')
        // Clear entries after save
        setStudents(s => s.map(r => ({ ...r, score: '', error: undefined })))
      } else {
        showToast(json.error ?? 'Failed to save', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally { setSubmitting(false) }
  }

  const filledCount = students.filter(s => s.score !== '').length
  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" /> Upload Marks
        </h1>
        <p className="text-slate-500 mt-1">Enter marks for all students in one screen and submit together.</p>
      </motion.div>

      {/* Controls Row */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="glass p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Subject *</label>
          <select
            value={subjectId}
            onChange={e => { setSubjectId(e.target.value); setStudents([]) }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">Select subject…</option>
            {subjects.map((s: FacultySubject) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.subjects.code} — {s.subjects.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Exam Type *</label>
          <select
            value={examType}
            onChange={e => setExamType(e.target.value as ExamType)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Max Score</label>
          <input
            type="number" min={1}
            value={maxScore}
            onChange={e => setMaxScore(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || filledCount === 0 || !subjectId}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-brand-500/20"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? 'Saving…' : `Save ${filledCount > 0 ? `(${filledCount})` : ''} Marks`}
          </button>
        </div>
      </motion.div>

      {/* Students Table */}
      {subjectId && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl overflow-hidden">
            {loadingStudents ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-slate-500">No students found for this subject</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-[2rem_1fr_140px_160px] gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="text-center">#</span>
                  <span>Student</span>
                  <span>Roll No.</span>
                  <span className="text-center">Score / {maxScore}</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {students.map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      className={`px-5 py-3 grid grid-cols-[2rem_1fr_140px_160px] items-center gap-4
                        hover:bg-slate-50/60 transition-colors ${student.error ? 'bg-red-50/50' : ''}`}
                    >
                      <span className="text-xs text-slate-400 text-center font-mono">{idx + 1}</span>
                      <span className="font-medium text-slate-900">{student.name}</span>
                      <span className="text-sm text-slate-500">{student.roll_number}</span>
                      <div>
                        <input
                          type="number"
                          min={0}
                          max={parseFloat(maxScore)}
                          step="0.5"
                          value={student.score}
                          onChange={e => updateScore(student.id, e.target.value)}
                          placeholder="—"
                          className={`w-full px-3 py-1.5 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 transition-all
                            ${student.error
                              ? 'border-red-400 focus:ring-red-400/20 bg-red-50'
                              : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                            }`}
                        />
                        {student.error && (
                          <p className="text-xs text-red-500 mt-0.5 text-center">{student.error}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Footer summary */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                  <span>{students.length} students total</span>
                  <span className="font-medium text-brand-600">{filledCount} marks entered</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {!subjectId && (
        <div className="py-20 text-center text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-500">Select a subject above to load the student list</p>
        </div>
      )}
    </div>
  )
}
