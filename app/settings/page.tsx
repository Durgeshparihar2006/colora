"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/contexts/theme-context"
import { 
  User, 
  Settings, 
  Bell, 
  Moon, 
  Shield, 
  LogOut, 
  Smartphone,
  Language,
  HelpCircle,
  Lock,
  UserPlus,
  Gift,
  AlertTriangle,
  Sun,
  Globe
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("English")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  })
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load user profile from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar,
      })
      setTempProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar,
      })
    }

    // Load notifications setting from localStorage
    const settings = localStorage.getItem("userSettings")
    if (settings) {
      const { notifications: savedNotifications, language: savedLanguage } = JSON.parse(settings)
      setNotifications(savedNotifications)
      if (savedLanguage) setLanguage(savedLanguage)
    }
  }, [])

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value)
    handleSettingChange("notifications", value)
    if (value) {
      // Request notification permission
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            toast({
              title: "Notifications Enabled",
              description: "You will now receive push notifications",
            })
          }
        })
      }
    }
  }

  const handleChangePassword = () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    // Update password in localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.password !== passwordData.currentPassword) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        })
        return
      }

      user.password = passwordData.newPassword
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Success",
        description: "Password updated successfully",
      })

      setShowChangePassword(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }

  const handleReferAndEarn = () => {
    const referralCode = generateReferralCode()
    setShowReferral(true)
    // Save referral code to user data
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.referralCode = referralCode
      localStorage.setItem("user", JSON.stringify(user))
    }
  }

  const generateReferralCode = () => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      return `${user.name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    }
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleViewRewards = () => {
    setShowRewards(true)
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleSaveProfile = () => {
    // Validate fields
    if (!tempProfile.name || !tempProfile.email || !tempProfile.phone) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(tempProfile.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(tempProfile.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    // Update profile
    setProfile(tempProfile)

    // Update localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      const updatedUser = { ...user, ...tempProfile }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    })

    setShowEditProfile(false)
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    if (setting === "notifications") {
      setNotifications(value)
      
      // Save settings to localStorage
      const currentSettings = localStorage.getItem("userSettings")
      const settings = currentSettings ? JSON.parse(currentSettings) : {}
      settings[setting] = value
      localStorage.setItem("userSettings", JSON.stringify(settings))

      toast({
        title: "Settings Updated",
        description: `${setting} has been ${value ? "enabled" : "disabled"}`,
      })
    }
  }

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("user")
    localStorage.removeItem("userSettings")
    localStorage.removeItem("walletBalance")
    localStorage.removeItem("transactions")
    localStorage.removeItem("betHistory")
    localStorage.removeItem("gameResults")
    localStorage.removeItem("currentGamePeriod")
    localStorage.removeItem("countdownTime")
    localStorage.removeItem("lastUpdateTime")

    // Redirect to login page
    window.location.href = "/login"
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)

    // Save settings to localStorage
    const currentSettings = localStorage.getItem("userSettings")
    const settings = currentSettings ? JSON.parse(currentSettings) : {}
    settings.language = newLanguage
    localStorage.setItem("userSettings", JSON.stringify(settings))

    toast({
      title: "Language Updated",
      description: `Language has been changed to ${e.target.options[e.target.selectedIndex].text}`,
    })
  }

  const handleSaveSettings = () => {
    // Save settings
    localStorage.setItem("userSettings", JSON.stringify({
      notifications,
      language
    }))

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    })
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "rgb(82,37,70)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-4">
              <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white">
                  {profile.name || "User Name"}
                </h3>
                <p className="text-white/70">
                  {profile.email || "email@example.com"}
                </p>
                <p className="text-white/70">
                  {profile.phone || "Phone Number"}
                </p>
              </div>
              <Button
                onClick={handleEditProfile}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-white/70" />
                  ) : (
                    <Sun className="w-5 h-5 text-white/70" />
                  )}
                  <Label className="text-white/70">Dark Mode</Label>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-white/70" />
                  <Label className="text-white/70">Language</Label>
                </div>
                <select 
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="English" className="bg-red-900/30 text-white">English</option>
                  <option value="Hindi" className="bg-red-900/30 text-white">हिंदी</option>
                  <option value="Marathi" className="bg-red-900/30 text-white">मराठी</option>
                  <option value="Gujarati" className="bg-red-900/30 text-white">ગુજરાતી</option>
                  <option value="Bengali" className="bg-red-900/30 text-white">বাংলা</option>
                  <option value="Telugu" className="bg-red-900/30 text-white">తెలుగు</option>
                  <option value="Tamil" className="bg-red-900/30 text-white">தமிழ்</option>
                </select>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-white/70" />
                  <Label className="text-white/70">Push Notifications</Label>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Security
              </h3>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
                  onClick={() => setShowChangePassword(true)}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                More
              </h3>
              <div className="grid gap-2">
                <Link href="/refer">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Refer & Earn
                  </Button>
                </Link>
                <Link href="/rewards">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Rewards
                  </Button>
                </Link>
                <Link href="/help">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-red-900/30 border-red-700/30 text-red-100 hover:bg-red-800/30"
                  >
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Help & Support
                  </Button>
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-100">
                Danger Zone
              </h3>
              <Button
                variant="destructive"
                className="w-full justify-start bg-red-900/30 border-red-700/30 text-red-100 hover:bg-red-800/30"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-red-200/70">Name</Label>
              <Input
                placeholder="Enter your name"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                className="w-full bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-200/70">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                className="w-full bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-200/70">Phone</Label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={tempProfile.phone}
                onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                className="w-full bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditProfile(false)}
              className="bg-red-900/30 border-red-700/30 text-red-100 hover:bg-red-800/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-red-200/70">Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-200/70">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-200/70">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-red-900/30 border-red-700/30 text-red-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(false)}
              className="bg-red-900/30 border-red-700/30 text-red-100 hover:bg-red-800/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={showReferral} onOpenChange={setShowReferral}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">
              Refer & Earn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-red-200/70">
                Share your referral code with friends and earn rewards!
              </p>
              <div className="mt-4 p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {profile.name ? generateReferralCode() : "LOGIN TO GET CODE"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-red-200/70">
                • Get ₹100 for each friend who joins
              </p>
              <p className="text-red-200/70">
                • Your friend gets ₹50 bonus
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowReferral(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rewards Dialog */}
      <Dialog open={showRewards} onOpenChange={setShowRewards}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">
              Your Rewards
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mt-4 text-red-100">
                0 Points
              </h3>
              <p className="text-red-200/70">
                Play more to earn rewards!
              </p>
            </div>
            <div className="space-y-2">
              <div className="p-4 rounded-lg bg-red-900/30">
                <p className="text-red-200/70">
                  • Win games to earn points
                </p>
                <p className="text-red-200/70">
                  • Redeem points for cash rewards
                </p>
                <p className="text-red-200/70">
                  • Special rewards on weekends
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowRewards(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 