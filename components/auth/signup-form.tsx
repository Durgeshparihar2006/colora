"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      if (existingUsers.some((user: any) => user.email === formData.email)) {
        toast({
          title: "Error",
          description: "Email already registered",
          variant: "destructive",
        })
        return
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        balance: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      }

      // Save user
      localStorage.setItem("users", JSON.stringify([...existingUsers, newUser]))

      // Set current user
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("walletBalance", "0")

      toast({
        title: "Success",
        description: "Account created successfully! Please verify your account.",
      })

      router.push("/verify")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <Card className="bg-gradient-to-b from-[#3a1b32] to-[#522546] border border-[#ff4d4d] shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl text-white text-center">Sign Up</CardTitle>
        <CardDescription className="text-gray-300 text-center">Create your account to start playing</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className={`pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] ${errors.username ? "border-red-500" : ""}`}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className={`pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] ${errors.phone ? "border-red-500" : ""}`}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`pl-10 bg-[#3a1b32] border-[#ff4d4d] text-white placeholder:text-gray-300 focus-visible:ring-[#ff4d4d] ${errors.confirmPassword ? "border-red-500" : ""}`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000] text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link href="/" className="text-[#ff4d4d] hover:text-[#ff1a1a] hover:underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

