"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Mail, Lock, Gamepad2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Get users from localStorage
      const storedUsers = localStorage.getItem("users")
      if (!storedUsers) {
        throw new Error("No users found. Please sign up first.")
      }

      const users = JSON.parse(storedUsers)
      const user = users.find((u: any) => u.email === email)

      if (!user) {
        throw new Error("User not found. Please sign up first.")
      }

      if (user.password !== password) {
        throw new Error("Invalid password")
      }

      // Check if user is verified
      if (!user.isVerified) {
        // Store user data for verification
        localStorage.setItem("pendingVerification", JSON.stringify(user))
        router.push("/auth/verify")
        return
      }

      // Store user session
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("walletBalance", user.balance?.toString() || "0")

      toast({
        title: "Success",
        description: "Login successful!",
      })

      router.push("/game")
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#522546] to-[#3a1b32]">
      {/* Logo and Title */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Color Prediction</h1>
        <p className="text-gray-300">Welcome back!</p>
      </div>

      <Card className="w-full max-w-md bg-gradient-to-b from-[#3a1b32] to-[#522546] border border-[#ff4d4d] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d]"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[#ff4d4d] hover:text-[#ff1a1a]"
                onClick={() => router.push("/auth/signup")}
              >
                Don't have an account? Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 