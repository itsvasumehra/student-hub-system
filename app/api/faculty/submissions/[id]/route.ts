import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/faculty/submissions/[id]
// Body: { marks_obtained }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 403 })
    }

    const { marks_obtained } = await request.json()

    if (marks_obtained == null || marks_obtained < 0) {
      return NextResponse.json({ error: 'Valid marks_obtained is required' }, { status: 400 })
    }

    const { data: submission } = await supabase
      .from('submissions')
      .select('id, assignment_id')
      .eq('id', id)
      .single()

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const { data: assignment } = await supabase
      .from('assignments')
      .select('id, max_marks, faculty_id')
      .eq('id', submission.assignment_id)
      .single()

    if (!assignment || assignment.faculty_id !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (marks_obtained > assignment.max_marks) {
      return NextResponse.json(
        { error: `Marks cannot exceed ${assignment.max_marks}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('submissions')
      .update({ marks_obtained, status: 'graded' })
      .eq('id', id)
      .select('id, marks_obtained, status')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Submission graded successfully' })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
