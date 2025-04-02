import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, History, Wallet } from "lucide-react"

interface BottomNavigationProps {
  currentPath: string
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const tabs = [
    { name: "Game", path: "/game", icon: Home },
    { name: "History", path: "/history", icon: History },
    { name: "Wallet", path: "/game/wallet", icon: Wallet },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t" style={{ backgroundColor: "#522546" }}>
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center p-2 ${
                currentPath === tab.path ? "text-white" : "text-gray-300"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

