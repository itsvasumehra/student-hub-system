'use client'
import { useState, useEffect, useCallback } from 'react'
import { useFacultyOverview } from '@/hooks/useFacultyData'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Loader2, CheckCircle2, AlertCircle, Users, UserCheck, UserX, Clock } from 'lucide-react'
import type { FacultySubject } from '@/services/faculty.service'

type AttendanceStatus = 'present' | 'absent' | 'late'

interface StudentRow {
  id: string
  name: string
  roll_number: string
  status: AttendanceStatus
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; icon: typeof UserCheck; classes: string; active: string }> = {
  present: { label: 'Present', icon: UserCheck, classes: 'border-slate-200 hover:border-green-400', active: 'bg-green-500 text-white border-green-500' },
  absent:  { label: 'Absent',  icon: UserX,    classes: 'border-slate-200 hover:border-red-400',   active: 'bg-red-500 text-white border-red-500' },
  late:    { label: 'Late',    icon: Clock,    classes: 'border-slate-200 hover:border-yellow-400', active: 'bg-yellow-500 text-white border-yellow-500' },
}

export default function FacultyAttendancePage() {
  const { subjects } = useFacultyOverview()
  const [subjectId, setSubjectId] = useState('')
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<StudentRow[]>([])
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
          ...s,
          status: 'present' as AttendanceStatus,
        })))
      }
    } catch { showToast('Failed to load students', 'error') }
    finally { setLoadingStudents(false) }
  }, [])

  useEffect(() => { loadStudents(subjectId) }, [subjectId, loadStudents])

  const setStatus = (id: string, status: AttendanceStatus) =>
    setStudents(s => s.map(r => r.id === id ? { ...r, status } : r))

  const markAll = (status: AttendanceStatus) =>
    setStudents(s => s.map(r => ({ ...r, status })))

  const handleSave = async () => {
    if (!subjectId || students.length === 0) {
      showToast('Select a subject and ensure students are loaded', 'error'); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: students.map(s => ({
            student_id: s.id,
            subject_id: subjectId,
            date: classDate,
            status: s.status,
          })),
        }),
      })
      const json = await res.json()
      if (res.ok) showToast(`${students.length} attendance records saved!`, 'success')
      else showToast(json.error ?? 'Save failed', 'error')
    } catch { showToast('Network error', 'error') }
    finally { setSubmitting(false) }
  }

  const selectedSubject = subjects.find(s => s.subject_id === subjectId)
  const presentCount = students.filter(s => s.status === 'present').length
  const absentCount  = students.filter(s => s.status === 'absent').length
  const lateCount    = students.filter(s => s.status === 'late').length

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
          <CalendarCheck className="w-6 h-6 text-brand-600" /> Mark Attendance
        </h1>
        <p className="text-slate-500 mt-1">Select a subject and mark attendance for all enrolled students at once.</p>
      </motion.div>

      {/* Controls */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}
        className="glass p-5 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium text-slate-700">Subject *</label>
          <select
            value={subjectId}
            onChange={e => { setSubjectId(e.target.value); setStudents([]) }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">Select a subject…</option>
            {subjects.map((s: FacultySubject) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.subjects.code} — {s.subjects.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-48 space-y-1">
          <label className="text-sm font-medium text-slate-700">Date *</label>
          <input
            type="date"
            value={classDate}
            onChange={e => setClassDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </motion.div>

      {/* Student Roster */}
      {subjectId && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Stats + Bulk Actions */}
          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> {presentCount} Present
                </span>
                <span className="flex items-center gap-1.5 text-red-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> {absentCount} Absent
                </span>
                {lateCount > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> {lateCount} Late
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Mark all:</span>
                {(['present', 'absent', 'late'] as AttendanceStatus[]).map(s => (
                  <button key={s} onClick={() => markAll(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize
                      ${STATUS_CONFIG[s].active}`}>
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Roster Table */}
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
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 hidden sm:grid grid-cols-[1fr_140px_auto] gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Student</span>
                  <span>Roll No.</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {students.map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="px-5 py-3 flex flex-col sm:grid sm:grid-cols-[1fr_140px_auto] sm:items-center gap-2 hover:bg-slate-50/60 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{student.name}</span>
                      <span className="text-sm text-slate-500">{student.roll_number}</span>
                      <div className="flex items-center gap-1.5">
                        {(['present', 'absent', 'late'] as AttendanceStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setStatus(student.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize
                              ${student.status === s ? STATUS_CONFIG[s].active : `bg-white text-slate-500 ${STATUS_CONFIG[s].classes}`}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          {students.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-500/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                {submitting ? 'Saving…' : `Save Attendance (${students.length} students)`}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {!subjectId && (
        <div className="py-20 text-center text-slate-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-500">Select a subject above to load the student roster</p>
        </div>
      )}
    </div>
  )
}
