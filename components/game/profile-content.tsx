"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Key } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  phone: string
  joinDate: string
  walletBalance: number
}

export default function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setIsLoading(true)

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        
        // Get wallet balance from localStorage
        const storedBalance = localStorage.getItem("walletBalance")
        const balance = storedBalance ? Number(storedBalance) : 0

        setProfile({
          name: user.name || "User",
          email: user.email || "",
          phone: user.phone || "",
          joinDate: user.joinDate || new Date().toISOString().split('T')[0],
          walletBalance: balance
        })

        setEditedName(user.name || "User")
      }
    } catch (error) {
      console.error("Fetch profile data error:", error)
      toast({
        title: "Failed to Load Profile",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = () => {
    try {
      // Get current user data
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        
        // Update name
        user.name = editedName
        
        // Save updated user data
        localStorage.setItem("user", JSON.stringify(user))
        
        // Update profile state
        if (profile) {
          setProfile({
            ...profile,
            name: editedName
          })
        }
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        })
      }
    } catch (error) {
      console.error("Save profile error:", error)
      toast({
        title: "Failed to Update Profile",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset edited name to current profile name
    if (profile) {
      setEditedName(profile.name)
    }
    setIsEditing(false)
  }

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm)
    // Reset password fields
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleChangePassword = () => {
    // Validate password fields
    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password",
        variant: "destructive",
      })
      return
    }

    if (!newPassword) {
      toast({
        title: "New Password Required",
        description: "Please enter a new password",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would send this to an API
    // For this demo, we'll just show a success message
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    })

    // Reset form and hide it
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowPasswordForm(false)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-8">No profile data found</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-xs text-center text-xl font-bold"
                />
              ) : (
                <h2 className="text-2xl font-bold">{profile.name}</h2>
              )}
              <p className="text-gray-500 dark:text-gray-400 mt-1">Member since {profile.joinDate}</p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fas fa-wallet text-primary"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
                  <p className="font-medium">₹{profile.walletBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} className="flex-1">Save Changes</Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="flex-1">Cancel</Button>
                </>
              ) : (
                <Button onClick={handleEditProfile} className="flex-1">Edit Profile</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10"
                  />
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                  />
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={handleChangePassword} className="flex-1">Update Password</Button>
                <Button onClick={togglePasswordForm} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">Change your password to keep your account secure.</p>
              <Button onClick={togglePasswordForm} className="w-full sm:w-auto">
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}