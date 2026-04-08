'use client'
// hooks/useAssignments.ts
// Custom hook for fetching assignments data.

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStudentAssignments, getFacultyAssignments } from '@/services/assignments.service'
import type { Assignment } from '@/lib/types'

export function useAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError(null)
    try {
      const res = profile.role === 'student'
        ? await getStudentAssignments()
        : await getFacultyAssignments()
      if (res.error) setError(res.error)
      else setAssignments((res.data ?? []) as Assignment[])
    } catch {
      setError('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  return { assignments, loading, error, refetch: fetchAssignments }
}
