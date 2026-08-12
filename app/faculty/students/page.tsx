'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Loader2, Search, GraduationCap, Mail, Hash, Building2, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/lib/auth-context'

interface Student {
  id: string
  name: string
  roll_number: string | null
  department: string
  semester: number | null
}

export default function FacultyStudentsPage() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState<string>('all')
  const [filterSemester, setFilterSemester] = useState<string>('all')

  // Detail modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/faculty/students')
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load students')
        return
      }
      setStudents(json.data ?? [])
    } catch {
      setError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  // Derive unique departments and semesters for filter dropdowns
  const departments = useMemo(() => {
    const depts = new Set(students.map(s => s.department))
    return Array.from(depts).sort()
  }, [students])

  const semesters = useMemo(() => {
    const sems = new Set(students.filter(s => s.semester).map(s => s.semester!))
    return Array.from(sems).sort((a, b) => a - b)
  }, [students])

  // Filter + search
  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_number ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = filterDept === 'all' || s.department === filterDept
      const matchSem = filterSemester === 'all' || String(s.semester) === filterSemester
      return matchSearch && matchDept && matchSem
    })
  }, [students, searchQuery, filterDept, filterSemester])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-600" />
          Student Directory
        </h1>
        <p className="text-slate-500 mt-1">Browse and search enrolled student profiles.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{students.length}</p>
              <p className="text-xs text-slate-500">Total Students</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
              <p className="text-xs text-slate-500">Departments</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{filtered.length}</p>
              <p className="text-xs text-slate-500">Matching</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{semesters.length}</p>
              <p className="text-xs text-slate-500">Semesters</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={filterSemester}
            onChange={e => setFilterSemester(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          >
            <option value="all">All Semesters</option>
            {semesters.map(s => (
              <option key={s} value={String(s)}>Semester {s}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Student list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Roll Number</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Department</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Semester</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    onClick={() => setSelectedStudent(student)}
                    className="border-b border-slate-50 hover:bg-brand-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600 font-mono">{student.roll_number ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        <Building2 className="w-3 h-3" />
                        {student.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">
                        {student.semester ? `Sem ${student.semester}` : '—'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>

      {/* Student detail modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile"
      >
        {selectedStudent && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-sm text-slate-500">{selectedStudent.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">Roll Number</p>
                </div>
                <p className="text-sm font-semibold text-slate-700 font-mono">{selectedStudent.roll_number ?? 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">Semester</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{selectedStudent.semester ? `Semester ${selectedStudent.semester}` : 'N/A'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">Department</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{selectedStudent.department}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
