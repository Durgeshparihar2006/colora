"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, GamepadIcon, Receipt, Settings } from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Games", path: "/admin/games", icon: GamepadIcon },
    { name: "Transactions", path: "/admin/transactions", icon: Receipt },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-16",
      )}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={cn("font-bold text-primary", isOpen ? "text-xl" : "text-xs text-center")}>
            {isOpen ? "Admin Panel" : "AP"}
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center p-2 rounded-md transition-colors",
                      pathname === item.path ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

