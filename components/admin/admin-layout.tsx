"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminHeader from "./admin-header"
import AdminSidebar from "./admin-sidebar"
import { useToast } from "@/hooks/use-toast"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if admin is authenticated
  useEffect(() => {
    const checkAdminAuth = () => {
      const isAdmin = localStorage.getItem("adminAuth") === "true"

      if (!isAdmin) {
        // Redirect to admin login if not authenticated
        router.push("/admin")
        toast({
          title: "Authentication Required",
          description: "Please login as admin to continue",
          variant: "destructive",
        })
      }
    }

    checkAdminAuth()
  }, [router, toast])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <AdminHeader toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}

