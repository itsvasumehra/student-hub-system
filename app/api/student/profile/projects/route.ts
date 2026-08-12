import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

async function getStudentId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('profiles').select('id, role').eq('user_id', user.id).single()
  if (!profile || profile.role !== 'student') return null
  return profile.id as string
}

// GET /api/student/profile/projects
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('student_projects')
      .select('*')
      .eq('student_id', studentId)
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: data ?? [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/student/profile/projects — add a project
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, tech_stack, project_url, github_url } = await req.json()
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

    const { data, error } = await supabase
      .from('student_projects')
      .insert({
        student_id: studentId,
        title: title.trim(),
        description: description ?? null,
        tech_stack: tech_stack ?? [],
        project_url: project_url ?? null,
        github_url: github_url ?? null,
      })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// PUT /api/student/profile/projects — update a project
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, title, description, tech_stack, project_url, github_url } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required and cannot be empty' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_projects')
      .update({
        title, description, tech_stack, project_url, github_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('student_id', studentId)
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/student/profile/projects
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase
      .from('student_projects')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Project deleted' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
