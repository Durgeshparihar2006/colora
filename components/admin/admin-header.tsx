"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminHeaderProps {
  toggleSidebar: () => void
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    // Remove admin authentication from localStorage
    localStorage.removeItem("adminAuth")

    // Redirect to admin login page
    router.push("/admin")

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

