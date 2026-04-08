'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, BookMarked, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, BookOpen, BadgeCheck } from 'lucide-react'

interface Subject {
  id: string
  code: string
  name: string
  department: string
  semester: number
}

interface FacultySubjectRow {
  id: string
  subject_id: string
  subjects: Subject
}

export default function FacultySettingsPage() {
  const [mySubjects, setMySubjects] = useState<FacultySubjectRow[]>([])
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [department, setDepartment] = useState('')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchMySubjects = useCallback(async () => {
    const res = await fetch('/api/faculty/subjects')
    const json = await res.json()
    if (res.ok && json.data) setMySubjects(json.data)
  }, [])

  const fetchAllSubjects = useCallback(async (dept: string) => {
    if (!dept) { setAllSubjects([]); return }
    const res = await fetch(`/api/public/subjects?department=${encodeURIComponent(dept)}`)
    const json = await res.json()
    if (res.ok && json.data) setAllSubjects(json.data)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchMySubjects().finally(() => setLoading(false))
  }, [fetchMySubjects])

  useEffect(() => { fetchAllSubjects(department) }, [department, fetchAllSubjects])

  const assignedIds = new Set(mySubjects.map(s => s.subject_id))

  const addSubject = async (subjectId: string) => {
    setSaving(subjectId)
    try {
      const res = await fetch('/api/faculty/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: subjectId }),
      })
      const json = await res.json()
      if (res.ok) {
        showToast('Subject added!', 'success')
        await fetchMySubjects()
      } else {
        showToast(json.error ?? 'Failed to add', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally { setSaving(null) }
  }

  const removeSubject = async (subjectId: string) => {
    setRemoving(subjectId)
    try {
      const res = await fetch(`/api/faculty/subjects?subject_id=${subjectId}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok) {
        showToast('Subject removed', 'success')
        await fetchMySubjects()
      } else {
        showToast(json.error ?? 'Failed to remove', 'error')
      }
    } catch { showToast('Network error', 'error') }
    finally { setRemoving(null) }
  }

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology']
  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
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
          <Settings className="w-6 h-6 text-brand-600" /> Faculty Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage the subjects you teach. These appear in attendance and marks forms.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Subjects */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-semibold text-slate-900">
              My Assigned Subjects
            </h2>
            <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full font-medium">
              {mySubjects.length}
            </span>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : mySubjects.length === 0 ? (
            <div className="py-10 text-center glass rounded-2xl">
              <BookMarked className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 text-sm">No subjects assigned yet.</p>
              <p className="text-slate-400 text-xs mt-1">Add subjects from the panel on the right.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mySubjects.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 glass rounded-xl group hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {item.subjects.code}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.subjects.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sem {item.subjects.semester} · {item.subjects.department}</p>
                  </div>
                  <button
                    onClick={() => removeSubject(item.subject_id)}
                    disabled={removing === item.subject_id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove subject"
                  >
                    {removing === item.subject_id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Subjects */}
        <motion.div initial="hidden" animate="visible" variants={{ ...fadeIn, visible: { opacity: 1, y: 0, transition: { delay: 0.1 } } }} className="space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">Add Subjects</h2>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Filter by Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="">Select a department…</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {department && (
            <div className="space-y-2">
              {allSubjects.length === 0 ? (
                <div className="py-8 text-center glass rounded-xl">
                  <p className="text-slate-400 text-sm">No subjects found for this department.</p>
                </div>
              ) : (
                allSubjects.map((subject) => {
                  const isAssigned = assignedIds.has(subject.id)
                  return (
                    <div key={subject.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all
                        ${isAssigned ? 'bg-brand-50 border-brand-200' : 'bg-white border-slate-200 hover:border-brand-300'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{subject.code}</p>
                        <p className="text-xs text-slate-500 truncate">{subject.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Semester {subject.semester}</p>
                      </div>
                      {isAssigned ? (
                        <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                          <BadgeCheck className="w-4 h-4" /> Assigned
                        </span>
                      ) : (
                        <button
                          onClick={() => addSubject(subject.id)}
                          disabled={saving === subject.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-all"
                        >
                          {saving === subject.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Plus className="w-3.5 h-3.5" />}
                          Add
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
