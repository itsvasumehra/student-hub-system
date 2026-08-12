import type { Mark } from '@/lib/types'

export interface SubjectGPA {
  subjectId: string
  subjectCode: string
  subjectName: string
  credits: number
  percentage: number
  gradePoint: number
}

/** Weighted SGPA on a 10-point scale using subject credits. */
export function calculateSGPA(marks: Mark[]): { sgpa: number; subjects: SubjectGPA[] } {
  const bySubject = new Map<
    string,
    { code: string; name: string; credits: number; totalScore: number; totalMax: number }
  >()

  for (const m of marks) {
    const sub = m.subjects
    if (!sub?.id) continue
    const entry = bySubject.get(sub.id) ?? {
      code: sub.code,
      name: sub.name,
      credits: sub.credits ?? 3,
      totalScore: 0,
      totalMax: 0,
    }
    entry.totalScore += Number(m.score)
    entry.totalMax += Number(m.max_score)
    bySubject.set(sub.id, entry)
  }

  const subjects: SubjectGPA[] = []
  let weightedSum = 0
  let totalCredits = 0

  for (const [subjectId, v] of bySubject) {
    const percentage = v.totalMax > 0 ? (v.totalScore / v.totalMax) * 100 : 0
    const gradePoint = (v.totalScore / v.totalMax) * 10
    subjects.push({
      subjectId,
      subjectCode: v.code,
      subjectName: v.name,
      credits: v.credits,
      percentage: Math.round(percentage * 10) / 10,
      gradePoint: Math.round(gradePoint * 100) / 100,
    })
    weightedSum += gradePoint * v.credits
    totalCredits += v.credits
  }

  const sgpa = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0
  return { sgpa, subjects: subjects.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode)) }
}
