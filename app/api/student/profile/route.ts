import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// Helper: get authenticated student's profile.id
async function getStudentId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'student') return null
  return profile.id as string
}

// GET /api/student/profile
// Returns the extended student profile merged with base profile info.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch base profile
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('id, name, email, department, roll_number, semester, avatar_url')
      .eq('id', studentId)
      .single()

    // Fetch extended profile (may not exist yet)
    const { data: extProfile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    return NextResponse.json({ data: { ...baseProfile, ...extProfile } })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// PUT /api/student/profile
// Upserts extended profile data.
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const studentId = await getStudentId(supabase)
    if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { phone, address, photo_url, bio, college_name, degree, cgpa, linkedin_url, github_url, website_url } = body

    const { data, error } = await supabase
      .from('student_profiles')
      .upsert({
        student_id: studentId,
        phone: phone ?? null,
        address: address ?? null,
        photo_url: photo_url ?? null,
        bio: bio ?? null,
        college_name: college_name ?? null,
        degree: degree ?? null,
        cgpa: cgpa ?? null,
        linkedin_url: linkedin_url ?? null,
        github_url: github_url ?? null,
        website_url: website_url ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, message: 'Profile updated successfully' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
