"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react"

export default function DashboardContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalRevenue: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    const fetchStats = () => {
      try {
        // Get users from localStorage
        const storedUsers = localStorage.getItem("users")
        const users = storedUsers ? JSON.parse(storedUsers) : []
        const activeUsers = users.filter(user => user.status === "Active").length

        // Get games from localStorage
        const storedGames = localStorage.getItem("games")
        const games = storedGames ? JSON.parse(storedGames) : []
        const totalBets = games.reduce((total, game) => total + (game.bets || 0), 0)
        const totalRevenue = games.reduce((total, game) => total + (game.profit || 0), 0)

        setStats({
          totalUsers: users.length,
          totalBets,
          totalRevenue,
          activeUsers,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bets</p>
              <h3 className="text-2xl font-bold">{stats.totalBets.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">10 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="font-medium">Withdrawal request received</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">25 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-4">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="font-medium">Game round completed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">45 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

