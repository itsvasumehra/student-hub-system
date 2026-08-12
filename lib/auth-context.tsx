'use client'

// AuthContext — manages user authentication state across the app.
// Architecture:
//   - All data fetching goes through /api/auth/* (server-side Supabase)
//   - supabase-client.ts is used ONLY for onAuthStateChange listener
//   - No direct Supabase DB calls from the browser

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase-client'
import { UserProfile, UserRole } from './types'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

interface SignResult {
  success: boolean
  error?: string
  message?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, name: string, additionalData: Record<string, unknown>) => Promise<SignResult>
  signIn: (email: string, password: string) => Promise<SignResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// Safe JSON parser — gracefully handles HTML error pages from Next.js.
interface SafeJsonResult {
  session?: { user: User } | null
  profile?: UserProfile | null
  success?: boolean
  error?: string
  message?: string
  warning?: string
}

async function safeJson(response: Response): Promise<SafeJsonResult> {
  const ct = response.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return response.json() as Promise<SafeJsonResult>
  // Server returned HTML (e.g. Next.js error page) — don't crash
  return { error: `Server error (${response.status})` }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  //
  // fetchSession — single source of truth for auth state.
  // Calls the server API route which validates the session server-side.
  // Returns the data so callers (signIn) can act on it immediately.
  //
  async function fetchSession(): Promise<SafeJsonResult | null> {
    try {
      const res = await fetch('/api/auth/session')
      const data = await safeJson(res)

      if (!res.ok || data.error) {
        setUser(null)
        setProfile(null)
        return null
      }

      setUser(data.session?.user ?? null)
      setProfile(data.profile ?? null)
      return data
    } catch (err) {
      console.error('fetchSession failed:', err)
      setUser(null)
      setProfile(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  //
  // On mount: fetch session once. Also listen for auth state changes.
  //
  // We only react to TOKEN_REFRESHED (re-fetch to keep state fresh) and
  // SIGNED_OUT (clear state). We do NOT react to SIGNED_IN or
  // INITIAL_SESSION because:
  //   - signIn() already calls fetchSession() and redirects
  //   - INITIAL_SESSION fires synchronously with null before our async
  //     fetchSession() completes, causing a race condition
  //
  useEffect(() => {
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'TOKEN_REFRESHED') {
          fetchSession()
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    additionalData: Record<string, unknown>
  ): Promise<SignResult> => {
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name, additionalData }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(data.error || 'Signup failed')
      return { success: true, message: data.message }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<SignResult> => {
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await safeJson(res)
      if (!res.ok) throw new Error(data.error || 'Signin failed')

      // Fetch session to update React state and get the user's role
      const session = await fetchSession()
      const role = session?.profile?.role

      if (role) {
        // Redirect to the correct dashboard based on role
        const path = role === 'student' ? '/student/dashboard' : '/faculty/dashboard'
        router.push(path)
      } else if (session?.session?.user) {
        // Auth succeeded but no profile yet — go to home, middleware will handle it
        router.push('/')
      }

      return { success: true }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
    } catch (err) {
      console.error('signOut error:', err)
    } finally {
      setUser(null)
      setProfile(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}