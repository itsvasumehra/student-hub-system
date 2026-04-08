import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/student/attendance
// Returns attendance records for the authenticated student,
// grouped with a per-subject summary (present/absent/late counts + percentage).
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('id, role').eq('user_id', user.id).single()
    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 403 })
    }

    const { data: records, error } = await supabase
      .from('attendance')
      .select(`
        id, date, status, created_at,
        subjects ( id, code, name, semester )
      `)
      .eq('student_id', profile.id)
      .order('date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Build per-subject summary
    const summaryMap = new Map<string, {
      subject_id: string, subject_code: string, subject_name: string,
      total: number, present: number, absent: number, late: number
    }>()

    for (const r of records ?? []) {
      const sub = r.subjects as any
      if (!sub) continue
      const key = sub.id
      if (!summaryMap.has(key)) {
        summaryMap.set(key, { subject_id: sub.id, subject_code: sub.code, subject_name: sub.name, total: 0, present: 0, absent: 0, late: 0 })
      }
      const entry = summaryMap.get(key)!
      entry.total++
      if (r.status === 'present') entry.present++
      else if (r.status === 'absent') entry.absent++
      else if (r.status === 'late') entry.late++
    }

    const summary = Array.from(summaryMap.values()).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round(((s.present + s.late * 0.5) / s.total) * 100) : 0,
    }))

    return NextResponse.json({ data: records ?? [], summary })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
