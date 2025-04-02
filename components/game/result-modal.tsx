"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ResultModalProps {
  color: string
  outcome: string
  amount: number
  onClose: () => void
}

export default function ResultModal({ color, outcome, amount, onClose }: ResultModalProps) {
  const [totalBets, setTotalBets] = useState<number>(0)
  const [totalWins, setTotalWins] = useState<number>(0)
  const [walletBalance, setWalletBalance] = useState<number>(0)

  useEffect(() => {
    // Load totals from localStorage
    const storedTotalBets = localStorage.getItem("totalBets")
    const storedTotalWins = localStorage.getItem("totalWins")
    const storedBalance = localStorage.getItem("walletBalance")

    if (storedTotalBets) setTotalBets(Number(storedTotalBets))
    if (storedTotalWins) setTotalWins(Number(storedTotalWins))
    if (storedBalance) setWalletBalance(Number(storedBalance))

    // Add spinning animation
    const spinAnimation = document.querySelector(".spin-animation")
    if (spinAnimation) {
      spinAnimation.classList.add("animate-spin")

      // Stop the animation after 2 seconds
      setTimeout(() => {
        spinAnimation.classList.remove("animate-spin")
      }, 2000)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-red-50 rounded-lg shadow-lg p-6 max-w-sm mx-4 w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-900">Round Result</h2>
          <div className="spin-animation mb-6 flex justify-center">
            <div className="color-ball game-color-red border-2 border-red-200" style={{ "--ball-index": "0" } as React.CSSProperties}></div>
            <div className="color-ball game-color-green border-2 border-red-200" style={{ "--ball-index": "1" } as React.CSSProperties}></div>
            <div className="color-ball game-color-violet border-2 border-red-200" style={{ "--ball-index": "2" } as React.CSSProperties}></div>
          </div>
          <div className="mb-6">
            <p className="text-xl font-bold mb-2 text-red-900">
              The result is <span className={`text-game-${color}`}>{color.toUpperCase()}</span>!
            </p>
            <p className="text-lg text-red-800">
              You {outcome} ₹{amount.toLocaleString()}!
            </p>
          </div>
          <div className="mb-6 text-sm text-red-700 space-y-1">
            <p>Total Bets: ₹{totalBets.toLocaleString()}</p>
            <p>Total Wins: ₹{totalWins.toLocaleString()}</p>
            <p>Current Balance: ₹{walletBalance.toLocaleString()}</p>
          </div>
          <Button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white">OK</Button>
        </div>
      </div>
    </div>
  )
}

