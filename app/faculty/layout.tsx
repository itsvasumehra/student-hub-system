// app/faculty/layout.tsx
// Shared layout for ALL /faculty/* pages.
// Renders the Sidebar (faculty role) + Header so individual pages don't repeat it.

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role="faculty" />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
