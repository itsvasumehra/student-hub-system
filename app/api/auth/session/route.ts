import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/auth/session
// Returns the current authenticated user's session and profile.
// Uses getUser() which validates the JWT against Supabase Auth server
// (more secure than getSession() which only reads the cookie).
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ session: null, profile: null })
    }

    // Fetch the user's profile from the database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Return a session-like object for the client (user info + profile)
    return NextResponse.json({
      session: { user },
      profile: profile ?? null,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
