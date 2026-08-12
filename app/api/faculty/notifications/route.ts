import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export interface AppNotification {
  id: string
  type: 'new_submission' | 'activity_pending'
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
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'faculty') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const notifications: AppNotification[] = []
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title')
      .eq('faculty_id', profile.id)

    const assignmentIds = assignments?.map((a) => a.id) ?? []
    const assignmentTitles = new Map(assignments?.map((a) => [a.id, a.title]) ?? [])

    if (assignmentIds.length > 0) {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('id, assignment_id, submitted_at, status')
        .in('assignment_id', assignmentIds)
        .gte('submitted_at', weekAgo)
        .order('submitted_at', { ascending: false })
        .limit(15)

      for (const s of submissions ?? []) {
        if (s.status === 'graded') continue
        notifications.push({
          id: `sub-${s.id}`,
          type: 'new_submission',
          title: 'New submission',
          message: assignmentTitles.get(s.assignment_id) ?? 'Assignment',
          href: '/faculty/assignments',
          created_at: s.submitted_at,
        })
      }
    }

    const { data: pendingActivities } = await supabase
      .from('activities')
      .select('id, title, created_at')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    for (const act of pendingActivities ?? []) {
      notifications.push({
        id: `act-${act.id}`,
        type: 'activity_pending',
        title: 'Activity pending review',
        message: act.title,
        href: '/faculty/activities',
        created_at: act.created_at,
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
