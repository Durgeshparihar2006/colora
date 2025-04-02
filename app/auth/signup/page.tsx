"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, Gamepad2, AlertCircle } from "lucide-react"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate password match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      // Validate phone number
      if (!/^\d{10}$/.test(phone)) {
        throw new Error("Please enter a valid 10-digit phone number")
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Get existing users or initialize empty array
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : []

      // Check if email already exists
      if (users.some((user: any) => user.email === email)) {
        throw new Error("Email already registered")
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        password,
        balance: 0,
        isVerified: false,
        createdAt: new Date().toISOString()
      }

      // Add to users array
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Store user session in localStorage
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("walletBalance", "0")

      toast({
        title: "Success",
        description: "Account created successfully! Please verify your account.",
      })

      router.push("/auth/verify")
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
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
        <p className="text-gray-300">Create your account</p>
      </div>

      <Card className="w-full max-w-md bg-gradient-to-b from-[#3a1b32] to-[#522546] border border-[#ff4d4d] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d]"
                required
              />
            </div>

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
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[#ff4d4d] hover:text-[#ff1a1a]"
                onClick={() => router.push("/auth/login")}
              >
                Already have an account? Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 