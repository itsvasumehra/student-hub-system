// lib/types.ts
// Shared TypeScript types for the entire student-hub application.
// Import from either client or server code — no Supabase dependency.

// ── Auth / Profile ────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'faculty'

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  name: string
  email: string
  department: string
  roll_number?: string
  employee_id?: string
  semester?: number
  avatar_url?: string
  created_at: string
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string
  code: string
  name: string
  department: string
  semester: number
  credits: number
  created_at: string
}

export interface FacultySubject {
  id: string          // faculty_subjects row id
  faculty_id: string
  subject_id: string
  subjects: Subject // joined
}

// ── Marks ─────────────────────────────────────────────────────────────────────

export type ExamType = 'internal1' | 'internal2' | 'external' | 'practical'

export interface Mark {
  id: string
  student_id: string
  subject_id: string
  faculty_id: string
  exam_type: ExamType
  score: number
  max_score: number
  remarks?: string
  created_at: string
  subjects?: Subject  // joined
}

// ── Assignments ───────────────────────────────────────────────────────────────

export interface Assignment {
  id: string
  subject_id: string
  faculty_id: string
  title: string
  description?: string
  due_date: string        // ISO date string
  max_marks: number
  file_url?: string
  created_at: string
  subjects?: Subject      // joined
}

// ── Submissions ───────────────────────────────────────────────────────────────

export type SubmissionStatus = 'submitted' | 'graded' | 'late'

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  file_url?: string
  notes?: string
  marks_obtained?: number
  status: SubmissionStatus
  submitted_at: string
  assignments?: Assignment  // joined
}

// ── Attendance ────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface Attendance {
  id: string
  student_id: string
  subject_id: string
  faculty_id: string
  date: string            // ISO date string
  status: AttendanceStatus
  created_at: string
  subjects?: Subject      // joined
}

// Summary shape computed client-side
export interface AttendanceSummary {
  subject_id: string
  subject_code: string
  subject_name: string
  total: number
  present: number
  absent: number
  late: number
  percentage: number
}

// ── Activities ────────────────────────────────────────────────────────────────

export type ActivityCategory = 'sports' | 'cultural' | 'technical' | 'social' | 'other'
export type ActivityApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Activity {
  id: string
  student_id: string
  title: string
  category: ActivityCategory
  description?: string
  date: string            // ISO date string
  proof_url?: string
  approval_status: ActivityApprovalStatus
  approved_by?: string
  approved_at?: string
  created_at: string
  profiles?: UserProfile  // joined (student info, for faculty view)
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  sent_at: string
  sender?: UserProfile    // joined
  receiver?: UserProfile  // joined
}

// ── Mark Sheets ───────────────────────────────────────────────────────────────

export interface Marksheet {
  id: string
  student_id: string
  label: string           // e.g. 'Semester 1'
  file_url: string
  file_name?: string
  semester?: number
  created_at: string
}

// ── Student Extended Profile ─────────────────────────────────────────────────

export interface StudentExtendedProfile {
  id: string
  student_id: string
  phone?: string
  address?: string
  photo_url?: string
  bio?: string
  college_name?: string
  degree?: string
  cgpa?: number
  linkedin_url?: string
  github_url?: string
  website_url?: string
  created_at: string
  updated_at: string
}

export interface StudentSkill {
  id: string
  student_id: string
  name: string
  category: 'technical' | 'soft'
  created_at: string
}

export interface StudentProject {
  id: string
  student_id: string
  title: string
  description?: string
  tech_stack?: string[]
  project_url?: string
  github_url?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface StudentExperience {
  id: string
  student_id: string
  company: string
  role: string
  start_date?: string
  end_date?: string
  description?: string
  is_current: boolean
  sort_order: number
  created_at: string
}

export interface StudentAchievement {
  id: string
  student_id: string
  title: string
  issuer?: string
  date_awarded?: string
  description?: string
  cert_url?: string
  sort_order: number
  created_at: string
}

// ── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
