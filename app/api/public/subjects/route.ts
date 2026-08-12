import { createClient } from '@supabase/supabase-js'
import { getDepartmentVariants } from '@/lib/departments'
import { NextResponse } from 'next/server'

// GET /api/public/subjects?department=X&semester=Y
// Fully public endpoint — no auth required.
// Uses a stateless anon client (no cookies) because the register page
// calls this route before the user is logged in.
// Semester is optional; omitting it returns all subjects for the department.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const semester = searchParams.get('semester')

    if (!department) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      )
    }

    // Stateless anon client — no cookie handling, safe for public routes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const deptVariants = getDepartmentVariants(department)

    let query = supabase
      .from('subjects')
      .select('id, code, name, semester, department')
      .in('department', deptVariants)
      .order('semester')
      .order('code')

    if (semester) {
      query = query.eq('semester', parseInt(semester))
    }

    const { data, error } = await query

    if (error) {
      console.error('Subjects query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (error: any) {
    console.error('Public subjects route crashed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
