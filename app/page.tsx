"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const user = Cookies.get('user')
    if (user) {
      router.replace('/game')
    } else {
      router.replace('/login')
    }
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#522546] to-[#3a1b32]">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
} 