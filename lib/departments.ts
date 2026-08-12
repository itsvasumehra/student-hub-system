// Canonical department names used across the app.
export const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Information Technology',
] as const

export type Department = (typeof DEPARTMENTS)[number]

// Maps common aliases → canonical name (lowercase keys).
const ALIASES: Record<string, Department> = {
  it: 'Information Technology',
  'information technology': 'Information Technology',
  cs: 'Computer Science',
  'computer science': 'Computer Science',
  ec: 'Electronics',
  electronics: 'Electronics',
  me: 'Mechanical',
  mechanical: 'Mechanical',
  ce: 'Civil',
  civil: 'Civil',
}

export function normalizeDepartment(dept: string): string {
  const trimmed = dept.trim()
  return ALIASES[trimmed.toLowerCase()] ?? trimmed
}

/** All strings that should match the same department in DB queries. */
export function getDepartmentVariants(dept: string): string[] {
  const canonical = normalizeDepartment(dept)
  const variants = new Set<string>([dept.trim(), canonical])

  for (const [alias, name] of Object.entries(ALIASES)) {
    if (name === canonical) variants.add(alias.toUpperCase())
    if (name === canonical) variants.add(name)
    if (alias === dept.trim().toLowerCase()) variants.add(name)
  }

  // Explicit IT variants seen in production data
  if (canonical === 'Information Technology') {
    variants.add('IT')
    variants.add('It')
    variants.add('it')
    variants.add('Information Technology')
  }

  return [...variants]
}

export function departmentsMatch(a: string, b: string): boolean {
  return normalizeDepartment(a).toLowerCase() === normalizeDepartment(b).toLowerCase()
}
