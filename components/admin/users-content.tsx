"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  phone: string
  email: string
  balance: number
  joined: string
  status: "Active" | "Inactive" | "Blocked"
}

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load users on component mount
  useEffect(() => {
    fetchUsers()

    // Listen for user registration events
    window.addEventListener("storage", handleStorageChange)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Handle storage changes for new user registrations
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "user") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          addNewUser(userData)
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }
  }

  // Add a new user to the system
  const addNewUser = (userData: any) => {
    setUsers(prevUsers => {
      // Check if user already exists
      const userExists = prevUsers.some(u => u.email === userData.email)
      if (userExists) return prevUsers

      // Create new user object
      const newUser = {
        id: generateUserId(prevUsers.length + 1),
        phone: userData.phone || "",
        email: userData.email || "",
        balance: 0,
        joined: new Date().toISOString().split("T")[0],
        status: "Active" as const
      }

      // Update users array and localStorage
      const updatedUsers = [...prevUsers, newUser]
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return updatedUsers
    })
  }

  // Generate unique user ID
  const generateUserId = (index: number): string => {
    return `USR${String(index).padStart(3, '0')}`
  }

  // Fetch all users from storage
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const storedUsers = localStorage.getItem("users")
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers)
        if (Array.isArray(parsedUsers)) {
          // Validate and format each user object
          const validUsers = parsedUsers
            .map((user: any) => validateAndFormatUser(user))
            .filter((user): user is User => user !== null)
          setUsers(validUsers)
        } else {
          initializeUsers()
        }
      } else {
        initializeUsers()
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Failed to Load Users",
        description: "There was an error loading the user data",
        variant: "destructive",
      })
      initializeUsers()
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize empty users array
  const initializeUsers = () => {
    setUsers([])
    localStorage.setItem("users", JSON.stringify([]))
  }

  // Validate and format user data
  const validateAndFormatUser = (user: any): User | null => {
    if (!user || typeof user !== 'object') return null

    return {
      id: user.id || generateUserId(Math.random()),
      phone: String(user.phone || ""),
      email: String(user.email || ""),
      balance: Number(user.balance || 0),
      joined: user.joined || new Date().toISOString().split("T")[0],
      status: validateStatus(user.status)
    }
  }

  // Validate user status
  const validateStatus = (status: any): "Active" | "Inactive" | "Blocked" => {
    const validStatuses = ["Active", "Inactive", "Blocked"]
    return validStatuses.includes(status) ? status : "Active"
  }

  // Handle user search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.trim())
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.phone.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    )
  })

  // Handle user actions (Block/Activate/Edit/View)
  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case "Block":
      case "Activate":
        updateUserStatus(userId, action === "Block" ? "Blocked" : "Active")
        break
      case "Edit":
        handleEditUser(userId)
        break
      case "View":
        handleViewUser(userId)
        break
      default:
        toast({
          title: "Invalid Action",
          description: "The requested action is not supported",
          variant: "destructive",
        })
    }
  }

  // Update user status
  const updateUserStatus = (userId: string, newStatus: "Active" | "Blocked") => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return updatedUsers
    })

    toast({
      title: "Status Updated",
      description: `User ${userId} has been ${newStatus.toLowerCase()}`,
    })
  }

  // Handle edit user action
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) {
      toast({
        title: "User Not Found",
        description: "Could not find the specified user",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Edit User",
      description: `Editing user ${userId}`,
    })
    // Add your edit user logic here
  }

  // Handle view user action
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) {
      toast({
        title: "User Not Found",
        description: "Could not find the specified user",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "View User",
      description: `Viewing user ${userId}`,
    })
    // Add your view user logic here
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <CardTitle>All Users</CardTitle>
          <div className="w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{user.balance.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.joined}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : user.status === "Inactive"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleUserAction("View", user.id)}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUserAction("Edit", user.id)}>
                            Edit
                          </Button>
                          {user.status !== "Blocked" ? (
                            <Button size="sm" variant="destructive" onClick={() => handleUserAction("Block", user.id)}>
                              Block
                            </Button>
                          ) : (
                            <Button size="sm" variant="default" onClick={() => handleUserAction("Activate", user.id)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

