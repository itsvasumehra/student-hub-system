import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/faculty/attendance?subject_id=X&date=YYYY-MM-DD
// Returns attendance records for a subject on a given date (to review/edit).
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
    const date = searchParams.get('date')

    let query = supabase
      .from('attendance')
      .select(`
        id, date, status, created_at,
        profiles!attendance_student_id_fkey ( id, name, roll_number ),
        subjects ( id, code, name )
      `)
      .eq('faculty_id', profile.id)
      .order('date', { ascending: false })

    if (subject_id) query = query.eq('subject_id', subject_id)
    if (date) query = query.eq('date', date)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/faculty/attendance
// Body: { records: Array<{ student_id, subject_id, date, status }> }
// Bulk upserts attendance for a class session.
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

    const { records } = await request.json() as { records: Array<{ student_id: string; subject_id: string; date: string; status: string }> }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'records array is required' }, { status: 400 })
    }

    const rowsToUpsert = records.map((r) => ({
      student_id: r.student_id,
      subject_id: r.subject_id,
      faculty_id: profile.id,
      date: r.date,
      status: r.status,
    }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(rowsToUpsert, { onConflict: 'student_id,subject_id,date' })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data, message: `${data?.length ?? 0} attendance records saved` })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
