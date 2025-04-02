import { Card } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-white">3</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path><path d="M12 18V6"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">₹0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Bets</p>
              <h3 className="text-2xl font-bold text-white">0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold text-white">1</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <p className="font-medium text-white">New user registered</p>
              <p className="text-sm text-gray-400">10 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="p-2 bg-green-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path></svg>
            </div>
            <div>
              <p className="font-medium text-white">Withdrawal request received</p>
              <p className="text-sm text-gray-400">25 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="p-2 bg-purple-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
            </div>
            <div>
              <p className="font-medium text-white">Game round completed</p>
              <p className="text-sm text-gray-400">45 minutes ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

