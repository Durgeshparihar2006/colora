"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  phone: string
  email: string
  balance: number
  joined: string
  status: "active" | "blocked"
  lastActive?: string
  totalBets?: number
  totalWins?: number
  totalLosses?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load users from localStorage
    const loadUsers = () => {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        
        // Get bet history for each user
        const betHistory = JSON.parse(localStorage.getItem("betHistory") || "[]")
        
        // Update user stats
        const updatedUsers = parsedUsers.map((user: User) => {
          const userBets = betHistory.filter((bet: any) => bet.userId === user.id)
          const wins = userBets.filter((bet: any) => bet.status === "Won").length
          const losses = userBets.filter((bet: any) => bet.status === "Lost").length
          
          return {
            ...user,
            lastActive: new Date().toISOString(),
            totalBets: userBets.length,
            totalWins: wins,
            totalLosses: losses
          }
        })
        
        setUsers(updatedUsers)
      } else {
        // If no users exist, set empty array
        setUsers([])
      }
    }

    loadUsers()

    // Set up interval to refresh user data
    const interval = setInterval(loadUsers, 2000)

    return () => clearInterval(interval)
  }, [])

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleBlockUser = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === "active" ? "blocked" : "active" }
      }
      return user
    })
    
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
    
    toast({
      title: "User Status Updated",
      description: `User ${userId} has been ${updatedUsers.find(u => u.id === userId)?.status}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <div className="bg-gray-900 text-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Users</h3>
          <Input 
            placeholder="Search users..." 
            className="max-w-xs bg-gray-800 border-gray-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">PHONE</th>
                <th className="px-4 py-3">EMAIL</th>
                <th className="px-4 py-3">BALANCE</th>
                <th className="px-4 py-3">JOINED</th>
                <th className="px-4 py-3">LAST ACTIVE</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No users found. Users will appear here when they sign up.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">₹{user.balance}</td>
                    <td className="px-4 py-3">{user.joined}</td>
                    <td className="px-4 py-3">{new Date(user.lastActive || "").toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "active" 
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleBlockUser(user.id)}
                      >
                        {user.status === "active" ? "Block" : "Unblock"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Basic Information</h4>
                <p>ID: {selectedUser.id}</p>
                <p>Phone: {selectedUser.phone}</p>
                <p>Email: {selectedUser.email}</p>
                <p>Balance: ₹{selectedUser.balance}</p>
                <p>Joined: {selectedUser.joined}</p>
                <p>Last Active: {new Date(selectedUser.lastActive || "").toLocaleString()}</p>
                <p>Status: {selectedUser.status}</p>
              </div>
              <div>
                <h4 className="font-semibold">Game Statistics</h4>
                <p>Total Bets: {selectedUser.totalBets}</p>
                <p>Total Wins: {selectedUser.totalWins}</p>
                <p>Total Losses: {selectedUser.totalLosses}</p>
                <p>Win Rate: {selectedUser.totalBets ? ((selectedUser.totalWins || 0) / selectedUser.totalBets * 100).toFixed(2) : 0}%</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

