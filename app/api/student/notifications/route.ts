import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getDepartmentVariants } from '@/lib/departments'
import { NextResponse } from 'next/server'

export interface AppNotification {
  id: string
  type: 'assignment_due' | 'assignment_graded' | 'activity_status'
  title: string
  message: string
  href: string
  created_at: string
}

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

    const notifications: AppNotification[] = []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    if (profile.semester) {
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .in('department', getDepartmentVariants(profile.department))
        .eq('semester', profile.semester)

      const subjectIds = subjects?.map((s) => s.id) ?? []

      if (subjectIds.length > 0) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title, due_date')
          .in('subject_id', subjectIds)
          .gte('due_date', now.toISOString().slice(0, 10))

        const { data: submissions } = await supabase
          .from('submissions')
          .select('assignment_id, status, marks_obtained, submitted_at')
          .eq('student_id', profile.id)

        const submittedIds = new Set(submissions?.map((s) => s.assignment_id) ?? [])

        for (const a of assignments ?? []) {
          if (submittedIds.has(a.id)) continue
          const due = new Date(a.due_date)
          const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 7) {
            notifications.push({
              id: `due-${a.id}`,
              type: 'assignment_due',
              title: daysLeft <= 0 ? 'Assignment overdue' : 'Assignment due soon',
              message: `${a.title} — ${daysLeft <= 0 ? 'overdue' : `${daysLeft} day(s) left`}`,
              href: '/student/assignments',
              created_at: a.due_date,
            })
          }
        }

        for (const s of submissions ?? []) {
          if (s.status !== 'graded' || !s.submitted_at) continue
          const gradedAt = new Date(s.submitted_at)
          if (gradedAt >= weekAgo && s.marks_obtained != null) {
            notifications.push({
              id: `graded-${s.assignment_id}`,
              type: 'assignment_graded',
              title: 'Assignment graded',
              message: `You scored ${s.marks_obtained} on a submitted assignment`,
              href: '/student/assignments',
              created_at: s.submitted_at,
            })
          }
        }
      }
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('id, title, approval_status, approved_at, created_at')
      .eq('student_id', profile.id)
      .in('approval_status', ['approved', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(10)

    for (const act of activities ?? []) {
      const ts = act.approved_at ?? act.created_at
      if (!ts || new Date(ts) < weekAgo) continue
      notifications.push({
        id: `activity-${act.id}`,
        type: 'activity_status',
        title: act.approval_status === 'approved' ? 'Activity approved' : 'Activity rejected',
        message: act.title,
        href: '/student/activities',
        created_at: ts,
      })
    }

    notifications.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ data: notifications })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
