import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/faculty/assignments
// Returns all assignments created by this faculty.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id, role').eq('user_id', user.id).single()
    if (!profile || profile.role !== 'faculty') {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id, title, description, due_date, max_marks, file_url, created_at,
        subjects ( id, code, name )
      `)
      .eq('faculty_id', profile.id)
      .order('due_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/faculty/assignments
// Body: { subject_id, title, description?, due_date, max_marks?, file_url? }
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

    const { subject_id, title, description, due_date, max_marks = 10, file_url } = await request.json()

    if (!subject_id || !title || !due_date) {
      return NextResponse.json({ error: 'subject_id, title, and due_date are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        subject_id,
        faculty_id: profile.id,
        title,
        description: description ?? null,
        due_date,
        max_marks,
        file_url: file_url ?? null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: 'Assignment created successfully' }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
