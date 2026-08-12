import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getDepartmentVariants } from '@/lib/departments'
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
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id')
      .in('department', deptVariants)
      .eq('semester', profile.semester ?? 0)

    const subjectIds = subjects?.map((s) => s.id) ?? []

    const { data: bySubject } = subjectIds.length
      ? await supabase
          .from('announcements')
          .select(`
            id, title, content, created_at, subject_id,
            profiles!announcements_faculty_id_fkey ( name ),
            subjects ( code, name )
          `)
          .in('subject_id', subjectIds)
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [] }

    const { data: deptWide } = await supabase
      .from('announcements')
      .select(`
        id, title, content, created_at, subject_id,
        profiles!announcements_faculty_id_fkey ( name, department ),
        subjects ( code, name )
      `)
      .is('subject_id', null)
      .order('created_at', { ascending: false })
      .limit(20)

    const filteredDept = (deptWide ?? []).filter((a) => {
      const faculty = a.profiles as { department?: string } | null
      return faculty?.department && deptVariants.includes(faculty.department)
    })

    const merged = [...(bySubject ?? []), ...filteredDept]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    return NextResponse.json({ data: merged })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
