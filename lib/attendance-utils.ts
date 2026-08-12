const THRESHOLD = 75

export interface AttendanceDeficit {
  subjectId: string
  subjectCode: string
  subjectName: string
  percentage: number
  classesNeeded: number
  atRisk: boolean
}

/**
 * How many consecutive present classes needed to reach the threshold.
 * Uses present + late*0.5 for effective attendance (matches API summary).
 */
export function classesNeededForThreshold(
  total: number,
  present: number,
  late: number,
  threshold = THRESHOLD
): number {
  if (total === 0) return 0
  const effective = present + late * 0.5
  const pct = (effective / total) * 100
  if (pct >= threshold) return 0

  const needed = Math.ceil((threshold / 100) * total - effective) / (1 - threshold / 100)
  return Math.max(0, Math.ceil(needed))
}

export function getAttendanceDeficit(summary: {
  subject_id: string
  subject_code: string
  subject_name: string
  total: number
  present: number
  late: number
  percentage: number
}): AttendanceDeficit {
  const classesNeeded = classesNeededForThreshold(
    summary.total,
    summary.present,
    summary.late
  )
  return {
    subjectId: summary.subject_id,
    subjectCode: summary.subject_code,
    subjectName: summary.subject_name,
    percentage: summary.percentage,
    classesNeeded,
    atRisk: summary.percentage < THRESHOLD,
  }
}
