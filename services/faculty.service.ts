// services/faculty.service.ts
import type { ApiResponse } from '@/lib/types'

export interface FacultySubject {
  subject_id: string
  subjects: {
    id: string
    code: string
    name: string
    department: string
    semester: number
  }
}

export interface StudentProfile {
  id: string
  name: string
  roll_number: string
  department: string
  semester: number
}

export async function getFacultySubjects(): Promise<ApiResponse<FacultySubject[]>> {
  const res = await fetch('/api/faculty/subjects')
  return res.json()
}

export async function getFacultyStudents(): Promise<ApiResponse<StudentProfile[]>> {
  const res = await fetch('/api/faculty/students')
  return res.json()
}
