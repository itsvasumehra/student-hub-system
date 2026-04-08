// services/attendance.service.ts
// Client-side service functions for the attendance API routes.

import type { Attendance, AttendanceSummary, ApiResponse } from '@/lib/types'

// ── Student ───────────────────────────────────────────────────────────────────

export async function getStudentAttendance(): Promise<
  ApiResponse<Attendance[]> & { summary?: AttendanceSummary[] }
> {
  const res = await fetch('/api/student/attendance')
  return res.json()
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export async function getFacultyAttendance(params?: {
  subject_id?: string
  date?: string
}): Promise<ApiResponse<Attendance[]>> {
  const query = new URLSearchParams()
  if (params?.subject_id) query.set('subject_id', params.subject_id)
  if (params?.date) query.set('date', params.date)
  const res = await fetch(`/api/faculty/attendance?${query.toString()}`)
  return res.json()
}

export async function submitAttendance(
  records: Array<{
    student_id: string
    subject_id: string
    date: string
    status: 'present' | 'absent' | 'late'
  }>
): Promise<ApiResponse<Attendance[]>> {
  const res = await fetch('/api/faculty/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  })
  return res.json()
}
