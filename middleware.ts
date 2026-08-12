import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Middleware — lightweight auth gate for PAGE routes only.
//
// IMPORTANT DESIGN DECISION:
// Middleware does NOT query the `profiles` table. Why?
//   1. RLS policies on profiles can cause "infinite recursion" errors
//   2. Middleware runs on EVERY page request — a DB query per request is slow
//   3. Role-based routing is handled client-side by auth-context instead
//
// Middleware only does two things:
//   1. Refreshes the Supabase session cookie (via getUser)
//   2. Redirects based on auth status:
//      - Not logged in → can only see /login, /register, /
//      - Logged in → cannot see /login, /register (sent to /)

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Attempt to validate session server-side.
  // Falls back to reading the local cookie if Supabase auth server is unreachable
  // (e.g. intermittent ISP blocks in some regions).
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error) user = data.user
  } catch {
    // Network failure — fall back to checking for a session cookie.
    // This is less secure (no JWT validation) but keeps the app usable.
    const hasSessionCookie = request.cookies.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )
    if (hasSessionCookie) {
      // Treat as authenticated — client will validate on the page level.
      return supabaseResponse
    }
  }

  const pathname = request.nextUrl.pathname
// Public auth pages — no login required
  const isPublicPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p))

  // Not logged in → protect everything except public pages and home
  if (!user && !isPublicPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in → redirect away from login/register
  if (user && isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}