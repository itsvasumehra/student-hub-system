import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getDepartmentVariants, departmentsMatch } from '@/lib/departments'
import { NextResponse } from 'next/server'

// POST /api/student/submissions
// Body: { assignment_id, file_url?, notes? }
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, department, semester')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 403 })
    }

    const { assignment_id, file_url, notes } = await request.json()

    if (!assignment_id) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 })
    }

    if (!file_url && !notes?.trim()) {
      return NextResponse.json({ error: 'Upload a file or add notes before submitting' }, { status: 400 })
    }

    const { data: assignment, error: aError } = await supabase
      .from('assignments')
      .select('id, due_date, subject_id')
      .eq('id', assignment_id)
      .single()

    if (aError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const { data: subject } = await supabase
      .from('subjects')
      .select('department, semester')
      .eq('id', assignment.subject_id)
      .single()

    if (
      !subject ||
      !departmentsMatch(subject.department, profile.department) ||
      subject.semester !== profile.semester
    ) {
      return NextResponse.json({ error: 'You are not enrolled in this subject' }, { status: 403 })
    }

    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignment_id)
      .eq('student_id', profile.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted this assignment' }, { status: 409 })
    }

    const dueDate = new Date(assignment.due_date)
    dueDate.setHours(23, 59, 59, 999)
    const status = new Date() > dueDate ? 'late' : 'submitted'

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id,
        student_id: profile.id,
        file_url: file_url ?? null,
        notes: notes?.trim() || null,
        status,
      })
      .select('id, assignment_id, status, submitted_at, file_url, notes')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Assignment submitted successfully' }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
