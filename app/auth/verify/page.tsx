"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Mail, Gamepad2, AlertCircle, Timer } from "lucide-react"

export default function VerifyPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user exists
    const pendingVerification = localStorage.getItem("pendingVerification")
    if (!pendingVerification) {
      router.push("/auth/login")
      return
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // In a real app, you would verify the OTP with your backend
      // For demo purposes, we'll just check if it's 6 digits
      if (!/^\d{6}$/.test(otp)) {
        throw new Error("Please enter a valid 6-digit OTP")
      }

      // Get pending verification data
      const pendingVerification = JSON.parse(localStorage.getItem("pendingVerification") || "{}")
      
      // Get users array
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : []

      // Update user verification status
      const updatedUsers = users.map((user: any) => {
        if (user.email === pendingVerification.email) {
          return { ...user, isVerified: true }
        }
        return user
      })

      // Save updated users
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      
      // Store verified user session
      const verifiedUser = updatedUsers.find((u: any) => u.email === pendingVerification.email)
      localStorage.setItem("user", JSON.stringify(verifiedUser))
      localStorage.setItem("walletBalance", verifiedUser.balance?.toString() || "0")
      
      // Clear pending verification
      localStorage.removeItem("pendingVerification")

      toast({
        title: "Success",
        description: "Account verified successfully!",
      })

      router.push("/game")
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = () => {
    setTimeLeft(60)
    setError("")
    // In a real app, you would request a new OTP from your backend
    toast({
      title: "OTP Sent",
      description: "A new OTP has been sent to your email",
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#522546] to-[#3a1b32]">
      {/* Logo and Title */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Verify Your Account</h1>
        <p className="text-gray-300">Enter the OTP sent to your email</p>
      </div>

      <Card className="w-full max-w-md bg-gradient-to-b from-[#3a1b32] to-[#522546] border border-[#ff4d4d] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">OTP Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="text-center text-sm text-gray-300 flex items-center justify-center gap-2">
              <Timer className="h-4 w-4" />
              {timeLeft > 0 ? (
                <p>Resend OTP in {timeLeft}s</p>
              ) : (
                <Button
                  variant="link"
                  className="text-[#ff4d4d] hover:text-[#ff1a1a] p-0 h-auto"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </Button>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000] text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[#ff4d4d] hover:text-[#ff1a1a]"
                onClick={() => router.push("/auth/login")}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 