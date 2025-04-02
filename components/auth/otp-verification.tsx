"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus()

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Move to next input if current input is filled
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpValue = otp.join("")

    if (otpValue.length !== 4) {
      toast({
        title: "Error",
        description: "Please enter a valid OTP",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.id) {
        throw new Error("User not found")
      }

      // Get all users
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      
      // Find and update the user's verification status
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, isVerified: true }
        }
        return u
      })

      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      
      // Update current user
      localStorage.setItem("user", JSON.stringify({ ...user, isVerified: true }))

      // Initialize wallet balance if not exists
      if (!localStorage.getItem("walletBalance")) {
        localStorage.setItem("walletBalance", "10000")
      }

      toast({
        title: "Success",
        description: "Verification successful. Redirecting to game...",
      })

      // Redirect to game
      router.push("/game")
    } catch (error) {
      console.error("OTP verification error:", error)
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    try {
      // In a real app, this would call the backend API
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your phone",
      })

      // Reset countdown
      setCountdown(60)
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast({
        title: "Failed to Resend OTP",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-gradient-to-b from-[#3a1b32] to-[#522546] border border-[#ff4d4d] shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl text-white text-center">Verify OTP</CardTitle>
        <CardDescription className="text-gray-300 text-center">Enter the verification code sent to your phone</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex justify-center space-x-4 my-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-[#3a1b32] border-[#ff4d4d] text-white focus-visible:ring-[#ff4d4d]"
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000] text-white font-semibold" 
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
          <div className="text-center text-sm text-gray-300">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className={`text-[#ff4d4d] hover:text-[#ff1a1a] ${countdown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
              disabled={countdown > 0}
            >
              Resend OTP {countdown > 0 && `(${countdown}s)`}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

