import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

interface BulkMarkRow {
  student_id: string
  score: number | null
  max_score?: number
  remarks?: string
}

// POST /api/faculty/marks/bulk
// Body: { subject_id, exam_type, max_score, rows: BulkMarkRow[] }
// Upserts marks for all provided students in a single transaction.
export async function POST(request: Request) {
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { subject_id, exam_type, max_score, rows } = await request.json() as {
      subject_id: string
      exam_type: string
      max_score: number
      rows: BulkMarkRow[]
    }

    if (!subject_id || !exam_type || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'subject_id, exam_type, and rows are required' }, { status: 400 })
    }

    // Filter to only rows that have a score entered
    const rowsToSave = rows.filter(r => r.score !== null && r.score !== undefined)

    if (rowsToSave.length === 0) {
      return NextResponse.json({ error: 'No marks to save — enter at least one score' }, { status: 400 })
    }

    const upsertData = rowsToSave.map(r => ({
      student_id: r.student_id,
      subject_id,
      faculty_id: profile.id,
      exam_type,
      score: r.score as number,
      max_score: max_score ?? r.max_score ?? 100,
      remarks: r.remarks ?? null,
    }))

    const { data, error } = await supabase
      .from('marks')
      .upsert(upsertData, { onConflict: 'student_id,subject_id,exam_type' })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      data,
      message: `${data?.length ?? 0} marks saved successfully`,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
