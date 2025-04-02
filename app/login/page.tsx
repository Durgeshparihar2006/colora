"use client"

import React, { useState } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Mail, Lock, Gamepad2 } from "lucide-react"
import Cookies from 'js-cookie'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      // पहले चेक करें कि रिस्पॉन्स JSON है
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("ईमेल या पासवर्ड गलत है। कृपया फिर से प्रयास करें।");
          } else {
            throw new Error(result.message || "Something went wrong");
          }
        }
        
        // Set user session in cookies
        Cookies.set('user', JSON.stringify(result), { expires: 7 });
        
        // Initialize wallet if not exists
        if (!localStorage.getItem("walletBalance")) {
          localStorage.setItem("walletBalance", result.balance?.toString() || "0");
        }

        // Redirect to game page after successful login
        router.push("/game");
        
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        // JSON नहीं है, तो टेक्स्ट के रूप में पढ़ें
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }
    } catch (error: any) {
      console.error("Error details:", error);
      
      // सर्वर कनेक्शन एरर के लिए विशेष मैसेज
      if (error.message.includes("server") || error.message.includes("connect")) {
        toast({
          title: "Server Connection Error",
          description: "Could not connect to the authentication server. Please make sure the server is running.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to login",
          variant: "destructive",
        });
      }
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
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back!</h1>
        <p className="text-gray-300">Login to continue playing</p>
      </div>

      <Card className="w-full max-w-md bg-[#3a1b32] border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#ff4d4d] to-[#ff1a1a] hover:from-[#ff3333] hover:to-[#ff0000]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[#ff4d4d] hover:text-[#ff1a1a]"
                onClick={() => router.push("/signup")}
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
} 