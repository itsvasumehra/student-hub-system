import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getDepartmentVariants } from '@/lib/departments'
import { NextResponse } from 'next/server'

// GET /api/faculty/students?subject_id=X
// Returns students filtered by the department+semester of a given subject.
// When subject_id is omitted, returns all students.
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')

    let department: string | null = null
    let semester: number | null = null

    // If subject_id provided, resolve its department + semester for filtering
    if (subject_id) {
      const { data: subject } = await supabase
        .from('subjects')
        .select('department, semester')
        .eq('id', subject_id)
        .single()

      if (subject) {
        department = subject.department
        semester = subject.semester
      }
    }

    let query = supabase
      .from('profiles')
      .select('id, name, roll_number, department, semester')
      .eq('role', 'student')
      .order('roll_number', { ascending: true })

    if (department) query = query.in('department', getDepartmentVariants(department))
    if (semester) query = query.eq('semester', semester)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

