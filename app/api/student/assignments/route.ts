import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/student/assignments
// Returns all assignments for subjects the student is enrolled in (by department + semester),
// along with the student's submission status for each.
export async function GET() {
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

    // Get assignments for subjects matching the student's department + semester
    const { data: assignments, error: aError } = await supabase
      .from('assignments')
      .select(`
        id, title, description, due_date, max_marks, file_url, created_at,
        subjects ( id, code, name, semester ),
        profiles!assignments_faculty_id_fkey ( name )
      `)
      .order('due_date', { ascending: true })

    if (aError) return NextResponse.json({ error: aError.message }, { status: 400 })

    // Fetch this student's submissions
    const { data: submissions } = await supabase
      .from('submissions')
      .select('assignment_id, status, marks_obtained, submitted_at')
      .eq('student_id', profile.id)

    const submissionMap = new Map(submissions?.map(s => [s.assignment_id, s]) ?? [])

    const enriched = (assignments ?? []).map(a => ({
      ...a,
      submission: submissionMap.get(a.id) ?? null,
    }))

    return NextResponse.json({ data: enriched })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
