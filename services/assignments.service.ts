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

export async function submitAssignment(payload: {
  assignment_id: string
  file_url?: string
  notes?: string
}): Promise<ApiResponse<{ id: string; status: string; submitted_at: string }>> {
  const res = await fetch('/api/student/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export interface FacultySubmission {
  id: string
  assignment_id: string
  file_url?: string
  notes?: string
  marks_obtained?: number
  status: string
  submitted_at: string
  profiles?: { id: string; name: string; roll_number?: string }
}

export async function getFacultySubmissions(assignmentId: string): Promise<
  ApiResponse<FacultySubmission[]> & { assignment?: { id: string; title: string; max_marks: number } }
> {
  const res = await fetch(`/api/faculty/submissions?assignment_id=${assignmentId}`)
  return res.json()
}

export async function gradeSubmission(
  submissionId: string,
  marks_obtained: number
): Promise<ApiResponse<{ id: string; marks_obtained: number; status: string }>> {
  const res = await fetch(`/api/faculty/submissions/${submissionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marks_obtained }),
  })
  return res.json()
}
