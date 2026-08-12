'use client'
// hooks/useFacultyData.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { getFacultySubjects, getFacultyStudents, type FacultySubject, type StudentProfile } from '@/services/faculty.service'

export function useFacultyOverview() {
  const [subjects, setSubjects] = useState<FacultySubject[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [subjRes, stuRes] = await Promise.all([
        getFacultySubjects(),
        getFacultyStudents()
      ])
      if (!subjRes.error) setSubjects(subjRes.data ?? [])
      if (!stuRes.error) setStudents(stuRes.data ?? [])
    } catch (e) {
      console.error('Failed to load faculty overview data', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchData()
    }
  }, [fetchData])

  return { subjects, students, loading, refetch: fetchData }
}
