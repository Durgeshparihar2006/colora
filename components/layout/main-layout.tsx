"use client"

import BottomNav from "./bottom-nav"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
} 