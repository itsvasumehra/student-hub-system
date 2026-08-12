import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/auth/sign-up
// Handles two cases:
//   1. New user  → creates both auth account + profile row
//   2. Existing auth user with no profile (e.g. after schema reset) → upserts profile only
export async function POST(request: Request) {
  try {
    const { email, password, role, name, additionalData = {} } = await request.json()

    if (!email || !password || !role || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // ── Step 1: Try creating the auth user ─────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

    let userId: string

    if (authError) {
      // "User already registered" — try to use the existing session instead
      if (authError.message.toLowerCase().includes('already registered')) {
        // Sign them in to get their user id
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError || !signInData.user) {
          return NextResponse.json({ error: 'Account exists. Please log in first, then complete your profile from the home page.' }, { status: 400 })
        }
        userId = signInData.user.id
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    } else {
      if (!authData.user) {
        return NextResponse.json({ error: 'No user returned from signup' }, { status: 400 })
      }
      userId = authData.user.id
    }

    // ── Step 2: Upsert profile row ──────────────────────────────────────────
    // Using upsert so this works for both new users and schema-reset recovery.
    const profileData: Record<string, any> = {
      user_id: userId,
      role,
      name,
      email,
      department: additionalData.department ?? null,
    }

    if (role === 'student') {
      profileData.roll_number = additionalData.roll_number ?? null
      profileData.semester = additionalData.semester ? parseInt(additionalData.semester) : null
    } else if (role === 'faculty') {
      profileData.employee_id = additionalData.employee_id ?? null
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // ── Step 3: If faculty, map to subjects ─────────────────────────────────
    if (role === 'faculty' && additionalData.subjects?.length > 0) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (newProfile) {
        const submittedIds: string[] = additionalData.subjects

        // Check if they look like real UUIDs or fallback codes like 'cs601'
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const areFallbackIds = submittedIds.some(id => !UUID_REGEX.test(id))

        let resolvedSubjectIds: string[] = submittedIds

        if (areFallbackIds) {
          // Map fallback IDs (e.g. 'cs601') → look up real UUIDs by code
          const codes = submittedIds.map(id => id.toUpperCase())
          const { data: realSubjects } = await supabase
            .from('subjects')
            .select('id, code')
            .in('code', codes)

          resolvedSubjectIds = (realSubjects ?? []).map(s => s.id)
        }

        if (resolvedSubjectIds.length > 0) {
          const facultySubjects = resolvedSubjectIds.map((subject_id) => ({
            faculty_id: newProfile.id,
            subject_id,
          }))
          const { error: fsError } = await supabase
            .from('faculty_subjects')
            .upsert(facultySubjects, { onConflict: 'faculty_id,subject_id' })
          if (fsError) {
            console.error('faculty_subjects upsert error:', fsError.message)
            return NextResponse.json({
              success: true,
              warning: 'Account created but subject assignment failed. Please configure subjects in Settings.'
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to confirm your account.',
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

