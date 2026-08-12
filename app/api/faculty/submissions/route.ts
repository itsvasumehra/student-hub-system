import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/faculty/submissions?assignment_id=X
export async function GET(request: Request) {
  try {
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

    const assignment_id = new URL(request.url).searchParams.get('assignment_id')
    if (!assignment_id) {
      return NextResponse.json({ error: 'assignment_id is required' }, { status: 400 })
    }

    const { data: assignment } = await supabase
      .from('assignments')
      .select('id, title, max_marks, faculty_id')
      .eq('id', assignment_id)
      .single()

    if (!assignment || assignment.faculty_id !== profile.id) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id, assignment_id, file_url, notes, marks_obtained, status, submitted_at,
        profiles!submissions_student_id_fkey ( id, name, roll_number )
      `)
      .eq('assignment_id', assignment_id)
      .order('submitted_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      data: data ?? [],
      assignment: { id: assignment.id, title: assignment.title, max_marks: assignment.max_marks },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
