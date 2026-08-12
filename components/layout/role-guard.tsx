'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function RoleGuard({
  role,
  children,
}: {
  role: 'student' | 'faculty'
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user || !profile) {
      router.replace('/login')
      return
    }
    if (profile.role !== role) {
      router.replace(profile.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')
    }
  }, [loading, user, profile, role, router])

  if (loading || !user || !profile || profile.role !== role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    )
  }

  return <>{children}</>
}
