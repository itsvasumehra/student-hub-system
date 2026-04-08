import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/faculty/marks?subject_id=X&exam_type=Y
// Returns marks uploaded by this faculty, optionally filtered by subject and exam type.
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id, role').eq('user_id', user.id).single()
    if (!profile || profile.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')
    const exam_type = searchParams.get('exam_type')

    let query = supabase
      .from('marks')
      .select(`
        id, exam_type, score, max_score, remarks, created_at,
        subjects ( id, code, name ),
        profiles!marks_student_id_fkey ( id, name, roll_number )
      `)
      .eq('faculty_id', profile.id)
      .order('created_at', { ascending: false })

    if (subject_id) query = query.eq('subject_id', subject_id)
    if (exam_type) query = query.eq('exam_type', exam_type)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/faculty/marks
// Body: { student_id, subject_id, exam_type, score, max_score, remarks? }
// Upserts a mark record (one per student+subject+exam_type).
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id, role').eq('user_id', user.id).single()
    if (!profile || profile.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 403 })
    }

    const body = await request.json()
    const { student_id, subject_id, exam_type, score, max_score = 100, remarks } = body

    if (!student_id || !subject_id || !exam_type || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('marks')
      .upsert({
        student_id,
        subject_id,
        faculty_id: profile.id,
        exam_type,
        score,
        max_score,
        remarks: remarks ?? null,
      }, { onConflict: 'student_id,subject_id,exam_type' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Mark saved successfully' })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
