"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowDownLeft, LayoutDashboard, Users, Gamepad2, History, Settings, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard />
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users />
  },
  {
    label: "Games",
    href: "/admin/games",
    icon: <Gamepad2 />
  },
  {
    label: "Add Money",
    href: "/admin/add-money",
    icon: <Wallet />
  },
  {
    label: "Withdrawals",
    href: "/admin/withdrawals",
    icon: <ArrowDownLeft />
  },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: <History />
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings />
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gray-900/95 text-white border-r border-gray-800">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 ${
                pathname === item.href 
                ? 'bg-gray-800 text-white hover:bg-gray-800/90' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-900/95">
        {children}
      </main>
    </div>
  )
} 