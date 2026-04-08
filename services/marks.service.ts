// services/marks.service.ts
// Client-side service functions for the marks API routes.
// Import in hooks or components — never import server-only code here.

import type { Mark, ApiResponse } from '@/lib/types'

// ── Student ───────────────────────────────────────────────────────────────────

export async function getStudentMarks(): Promise<ApiResponse<Mark[]>> {
  const res = await fetch('/api/student/marks')
  return res.json()
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export async function getFacultyMarks(params?: {
  subject_id?: string
  exam_type?: string
}): Promise<ApiResponse<Mark[]>> {
  const query = new URLSearchParams()
  if (params?.subject_id) query.set('subject_id', params.subject_id)
  if (params?.exam_type) query.set('exam_type', params.exam_type)
  const res = await fetch(`/api/faculty/marks?${query.toString()}`)
  return res.json()
}

export async function uploadMark(payload: {
  student_id: string
  subject_id: string
  exam_type: 'internal1' | 'internal2' | 'external' | 'practical'
  score: number
  max_score?: number
  remarks?: string
}): Promise<ApiResponse<Mark>> {
  const res = await fetch('/api/faculty/marks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}
