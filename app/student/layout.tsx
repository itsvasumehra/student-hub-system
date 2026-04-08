// app/student/layout.tsx
// Shared layout for ALL /student/* pages.
// Renders the Sidebar (student role) + Header so individual pages don't repeat it.
// This is a Client Component wrapper because Sidebar + Header both use useAuth / usePathname.

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role="student" />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
