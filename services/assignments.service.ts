// services/assignments.service.ts
// Client-side service functions for the assignments API routes.

import type { Assignment, ApiResponse } from '@/lib/types'

// ── Student ───────────────────────────────────────────────────────────────────

export async function getStudentAssignments(): Promise<ApiResponse<Assignment[]>> {
  const res = await fetch('/api/student/assignments')
  return res.json()
}

// ── Faculty ───────────────────────────────────────────────────────────────────

export async function getFacultyAssignments(): Promise<ApiResponse<Assignment[]>> {
  const res = await fetch('/api/faculty/assignments')
  return res.json()
}

export async function createAssignment(payload: {
  subject_id: string
  title: string
  description?: string
  due_date: string
  max_marks?: number
  file_url?: string
}): Promise<ApiResponse<Assignment>> {
  const res = await fetch('/api/faculty/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}
