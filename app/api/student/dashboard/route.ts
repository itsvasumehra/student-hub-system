import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getDepartmentVariants } from '@/lib/departments'
import { getAttendanceDeficit } from '@/lib/attendance-utils'
import { NextResponse } from 'next/server'

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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deptVariants = getDepartmentVariants(profile.department)
    let pendingAssignments = 0
    let dueSoon = 0

    if (profile.semester) {
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .in('department', deptVariants)
        .eq('semester', profile.semester)

      const subjectIds = subjects?.map((s) => s.id) ?? []

      if (subjectIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, due_date')
          .in('subject_id', subjectIds)

        const { data: submissions } = await supabase
          .from('submissions')
          .select('assignment_id')
          .eq('student_id', profile.id)

        const submitted = new Set(submissions?.map((s) => s.assignment_id) ?? [])
        const now = new Date()

        for (const a of assignments ?? []) {
          if (submitted.has(a.id)) continue
          pendingAssignments++
          const days = Math.ceil((new Date(a.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (days <= 7) dueSoon++
        }
      }
    }

    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('status, subjects ( id, code, name )')
      .eq('student_id', profile.id)

    const summaryMap = new Map<
      string,
      { subject_id: string; subject_code: string; subject_name: string; total: number; present: number; late: number; percentage: number }
    >()

    for (const r of attendanceRecords ?? []) {
      const sub = r.subjects as unknown as { id: string; code: string; name: string } | null
      if (!sub) continue
      const entry = summaryMap.get(sub.id) ?? {
        subject_id: sub.id,
        subject_code: sub.code,
        subject_name: sub.name,
        total: 0,
        present: 0,
        late: 0,
        percentage: 0,
      }
      entry.total++
      if (r.status === 'present') entry.present++
      else if (r.status === 'late') entry.late++
      summaryMap.set(sub.id, entry)
    }

    const attendanceWarnings = Array.from(summaryMap.values())
      .map((s) => ({
        ...s,
        percentage: s.total > 0 ? Math.round(((s.present + s.late * 0.5) / s.total) * 100) : 0,
      }))
      .map(getAttendanceDeficit)
      .filter((d) => d.atRisk)

    return NextResponse.json({
      data: { pendingAssignments, dueSoon, attendanceWarnings },
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
