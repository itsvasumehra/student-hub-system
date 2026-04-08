'use client'
// hooks/useAttendance.ts
// Custom hook for fetching attendance data.

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStudentAttendance, getFacultyAttendance } from '@/services/attendance.service'
import type { Attendance, AttendanceSummary } from '@/lib/types'

export function useAttendance(params?: { subject_id?: string; date?: string }) {
  const { profile } = useAuth()
  const [records, setRecords] = useState<Attendance[]>([])
  const [summary, setSummary] = useState<AttendanceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    setError(null)
    try {
      if (profile.role === 'student') {
        const res = await getStudentAttendance()
        if (res.error) setError(res.error)
        else {
          setRecords((res.data ?? []) as Attendance[])
          setSummary(res.summary ?? [])
        }
      } else {
        const res = await getFacultyAttendance(params)
        if (res.error) setError(res.error)
        else setRecords((res.data ?? []) as Attendance[])
      }
    } catch {
      setError('Failed to load attendance')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, params?.subject_id, params?.date])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  return { records, summary, loading, error, refetch: fetchAttendance }
}
