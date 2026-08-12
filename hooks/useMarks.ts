'use client'
// hooks/useMarks.ts
// Custom hook for fetching marks data.
// Automatically detects role and calls the correct endpoint.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStudentMarks, getFacultyMarks } from '@/services/marks.service'
import type { Mark } from '@/lib/types'

export function useMarks(params?: { subject_id?: string; exam_type?: string }) {
  const { profile } = useAuth()
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize params to prevent unnecessary re-fetches
  const stableParams = useMemo(
    () => params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params?.subject_id, params?.exam_type]
  )

  const fetchMarks = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError(null)
    try {
      const res = profile.role === 'student'
        ? await getStudentMarks()
        : await getFacultyMarks(stableParams)
      if (res.error) setError(res.error)
      else setMarks((res.data ?? []) as Mark[])
    } catch {
      setError('Failed to load marks')
    } finally {
      setLoading(false)
    }
  }, [profile, stableParams])

  useEffect(() => { fetchMarks() }, [fetchMarks])

  return { marks, loading, error, refetch: fetchMarks }
}

