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

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('student_experience')
      .select('*')
      .eq('student_id', studentId)
      .order('sort_order', { ascending: true })
      .order('start_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: data ?? [] })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { company, role, start_date, end_date, description, is_current } = await req.json()
    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'company and role are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_experience')
      .insert({
        student_id: studentId,
        company: company.trim(),
        role: role.trim(),
        start_date: start_date || null,
        end_date: is_current ? null : (end_date || null),
        description: description ?? null,
        is_current: !!is_current,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, company, role, start_date, end_date, description, is_current } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'company and role are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('student_experience')
      .update({
        company,
        role,
        start_date: start_date || null,
        end_date: is_current ? null : (end_date || null),
        description: description ?? null,
        is_current: !!is_current,
      })
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase
      .from('student_experience')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Experience deleted' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
