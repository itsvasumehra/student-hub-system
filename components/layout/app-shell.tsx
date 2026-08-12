'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { RoleGuard } from '@/components/layout/role-guard'

export function AppShell({
  role,
  children,
}: {
  role: 'student' | 'faculty'
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <RoleGuard role={role}>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar
          role={role}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
