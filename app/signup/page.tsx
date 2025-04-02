"use client"

import React, { useState } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Mail, Lock, User, Gamepad2 } from "lucide-react"
import Cookies from 'js-cookie'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // पासवर्ड वैलिडेशन
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      })

      // पहले चेक करें कि रिस्पॉन्स JSON है
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || "Something went wrong");
        }
        
        // सफल रिस्पॉन्स प्रोसेस करें
        Cookies.set('user', JSON.stringify(result), { expires: 7 });
        localStorage.setItem("walletBalance", result.balance?.toString() || "100");
        router.push("/game");
        
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      } else {
        // JSON नहीं है, तो टेक्स्ट के रूप में पढ़ें
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }
    } catch (error: any) {
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#522546] to-[#3a1b32]">
      {/* Logo and Title */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] flex items-center justify-center mx-auto mb-4">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Join the Game!</h1>
        <p className="text-gray-300">Create an account to start playing</p>
      </div>

      <Card className="w-full max-w-md bg-[#3a1b32] border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#2a1422] border-gray-600 text-white"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-[#2a1422] border-gray-600 text-white"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#2a1422] border-gray-600 text-white"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-[#2a1422] border-gray-600 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000]"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[#ff4d4d] hover:text-[#ff1a1a]"
                onClick={() => router.push("/login")}
              >
                Already have an account? Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
} 