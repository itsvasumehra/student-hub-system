import { AppShell } from '@/components/layout/app-shell'

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="faculty">{children}</AppShell>
}
