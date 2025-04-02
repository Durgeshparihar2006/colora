import type { Metadata } from "next"
import AdminLayout from "@/components/admin/admin-layout"
import DashboardContent from "@/components/admin/dashboard-content"

export const metadata: Metadata = {
  title: "Admin - Dashboard",
  description: "Admin dashboard for Color Prediction Game",
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  )
}

