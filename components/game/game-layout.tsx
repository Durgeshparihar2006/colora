"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import BottomNavigation from "./bottom-navigation"
import ResultModal from "./result-modal"
import { useToast } from "@/hooks/use-toast"

interface GameLayoutProps {
  children: React.ReactNode
}

export default function GameLayout({ children }: GameLayoutProps) {
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultData, setResultData] = useState({
    color: "green",
    outcome: "won",
    amount: 0,
    totalBets: 0,
    totalWins: 0,
    walletBalance: 0
  })
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!user.isLoggedIn || !user.isVerified) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    checkAuth()

    // Listen for game results
    const handleGameResult = (event: CustomEvent<{
      color: string;
      outcome: string;
      amount: number;
      totalBets: number;
      totalWins: number;
      walletBalance: number;
    }>) => {
      const { color, outcome, amount, totalBets, totalWins, walletBalance } = event.detail

      setResultData({
        color,
        outcome,
        amount,
        totalBets,
        totalWins,
        walletBalance
      })

      setShowResultModal(true)
    }

    window.addEventListener("gameResult" as any, handleGameResult as any)

    return () => {
      window.removeEventListener("gameResult" as any, handleGameResult as any)
    }
  }, [router, toast])

  const handleCloseResultModal = () => {
    setShowResultModal(false)
  }

  return (
    <div className="min-h-screen bg-[#522546]">
      <main className="container mx-auto px-4 pb-20 pt-4">{children}</main>

      <BottomNavigation currentPath={pathname} />

      {showResultModal && (
        <ResultModal
          color={resultData.color}
          outcome={resultData.outcome}
          amount={resultData.amount}
          onClose={handleCloseResultModal}
        />
      )}
    </div>
  )
}

