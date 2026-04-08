import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/student/resume
// Returns all profile data needed to render a resume.
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Base profile
    const { data: baseProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, department, roll_number, semester, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (profileError || !baseProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const studentId = baseProfile.id

    // Fetch all sub-sections in parallel
    const [extRes, skillsRes, projectsRes, achievementsRes] = await Promise.all([
      supabase
        .from('student_profiles')
        .select('phone, address, photo_url, bio, college_name, degree, cgpa, linkedin_url, github_url, website_url')
        .eq('student_id', studentId)
        .maybeSingle(),
      supabase
        .from('student_skills')
        .select('id, name, category')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true }),
      supabase
        .from('student_projects')
        .select('id, title, description, tech_stack, project_url, github_url')
        .eq('student_id', studentId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('student_achievements')
        .select('id, title, issuer, date_awarded, description, cert_url')
        .eq('student_id', studentId)
        .order('sort_order', { ascending: true }),
    ])

    return NextResponse.json({
      data: {
        // Core
        name: baseProfile.name,
        email: baseProfile.email,
        department: baseProfile.department,
        roll_number: baseProfile.roll_number,
        semester: baseProfile.semester,
        // Extended
        phone: extRes.data?.phone ?? null,
        address: extRes.data?.address ?? null,
        photo_url: extRes.data?.photo_url ?? null,
        bio: extRes.data?.bio ?? null,
        college_name: extRes.data?.college_name ?? null,
        degree: extRes.data?.degree ?? null,
        cgpa: extRes.data?.cgpa ?? null,
        linkedin_url: extRes.data?.linkedin_url ?? null,
        github_url: extRes.data?.github_url ?? null,
        website_url: extRes.data?.website_url ?? null,
        // Sub-sections
        skills: skillsRes.data ?? [],
        projects: projectsRes.data ?? [],
        achievements: achievementsRes.data ?? [],
      },
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
