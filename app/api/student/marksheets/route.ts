import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/student/marksheets
// Returns the authenticated student's uploaded mark sheets.
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

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('marksheets')
      .select('id, label, file_url, file_name, semester, created_at')
      .eq('student_id', profile.id)
      .order('semester', { ascending: true, nullsFirst: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/student/marksheets
// Body: { label, file_url, file_name, semester? }
// Creates a marksheet record after the file has been uploaded to Supabase Storage.
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

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 403 })
    }

    const { label, file_url, file_name, semester } = await request.json() as {
      label: string
      file_url: string
      file_name?: string
      semester?: number
    }

    if (!label || !file_url) {
      return NextResponse.json({ error: 'label and file_url are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('marksheets')
      .insert({
        student_id: profile.id,
        label,
        file_url,
        file_name: file_name ?? null,
        semester: semester ?? null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/student/marksheets?id=X
// Deletes a marksheet record. The caller is responsible for removing the storage file.
export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

    // Verify ownership before deleting
    const { error } = await supabase
      .from('marksheets')
      .delete()
      .eq('id', id)
      .eq('student_id', profile.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ message: 'Marksheet deleted' })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
