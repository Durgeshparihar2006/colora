"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Home, History, Wallet, Settings } from "lucide-react"

interface BetDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedOption: string
  onPlaceBet: (amount: number) => void
}

interface GameResult {
  period: string
  number: number
  color: string
  timestamp: string
}

const PRESET_AMOUNTS = [10, 20, 50, 100, 500, 1000, 2000, 5000]

const BetDialog = ({ isOpen, onClose, selectedOption, onPlaceBet }: BetDialogProps) => {
  const [betAmount, setBetAmount] = useState<number>(0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place Bet on {selectedOption}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => setBetAmount(amount)}
              className={`${betAmount === amount ? "bg-primary text-white" : ""}`}
            >
              ₹{amount}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Custom Amount</label>
          <Input
            type="number"
            className="input-field w-full"
            value={betAmount || ""}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={0}
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onPlaceBet(betAmount)
              onClose()
            }}
            disabled={betAmount <= 0}
          >
            Place Bet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function GamePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState("1000.00")
  const [isProcessing, setIsProcessing] = useState(false)
  const [balance, setBalance] = useState("0.00")

  // Reintroduce period and countdown state
  const [currentPeriod, setCurrentPeriod] = useState("001")
  const [countdown, setCountdown] = useState(60)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [recentResults, setRecentResults] = useState<GameResult[]>([
    {
      period: "001",
      number: 5,
      color: "Green",
      timestamp: "12:00",
    },
  ])

  // Use refs to prevent issues with stale state in effects
  const periodRef = useRef("001")
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check authentication and set initial data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userCookie = Cookies.get("user")
        if (!userCookie) {
          router.replace("/login")
          return
        }

        const userData = JSON.parse(userCookie)
        if (!userData.isVerified) {
          router.replace("/signup")
          return
        }

        // Fetch wallet balance or any other data if needed
        const balance = localStorage.getItem("walletBalance") || "1000"
        setWalletBalance(balance)
        setBalance(balance)
        setUser(userData)
      } catch (error) {
        console.error("Auth error:", error)
        Cookies.remove("user")
        router.replace("/login")
      }
    }

    checkAuth()

    return () => {
      // Clean up interval on unmount
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [router])

  // Set up the game timer
  useEffect(() => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    // Start a new countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        // When countdown reaches 0
        if (prevCount <= 1) {
          // Generate result for current period
          const number = Math.floor(Math.random() * 10)
          let color = number % 2 === 0 ? "Red" : "Green"
          if (number === 0) color = "Violet & Red"

          const result: GameResult = {
            period: periodRef.current,
            number,
            color,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
          }

          // Add to recent results
          setRecentResults((prev) => [result, ...prev.slice(0, 4)])

          // Increment period by exactly 1
          const currentNum = Number.parseInt(periodRef.current, 10)
          const nextNum = currentNum + 1
          const nextPeriod = nextNum.toString().padStart(3, "0")

          // Update both state and ref
          setCurrentPeriod(nextPeriod)
          periodRef.current = nextPeriod

          // Reset selections
          setSelectedOption("")
          setSelectedNumber(null)

          return 60 // Reset countdown
        }

        // Play sound in last 5 seconds
        if (prevCount <= 5) {
          try {
            const audio = new Audio("/timer-beep.mp3")
            audio.play().catch((e) => console.error("Audio error:", e))
          } catch (e) {
            console.error("Audio error:", e)
          }
        }

        return prevCount - 1
      })
    }, 1000)

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, []) // Empty dependency array to run only once

  const handleOptionClick = (option: string | number) => {
    if (countdown <= 5) {
      toast({
        title: "Betting Locked",
        description: "Cannot place bets in last 5 seconds",
        variant: "destructive",
      })
      return
    }

    if (typeof option === "number") {
      setSelectedNumber(option)
      setSelectedOption(`Number ${option}`)
    } else {
      setSelectedNumber(null)
      setSelectedOption(option)
    }
    setIsDialogOpen(true)
  }

  const handlePlaceBet = (amount: number) => {
    if (countdown <= 5) {
      toast({
        title: "Betting Locked",
        description: "Cannot place bets in last 5 seconds",
        variant: "destructive",
      })
      return
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      })
      return
    }

    if (amount > Number(walletBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      })
      return
    }

    // Process bet
    setIsProcessing(true)

    try {
      const newBalance = Number(walletBalance) - amount
      setWalletBalance(newBalance.toString())
      setBalance(newBalance.toString())

      // Save bet in history
      const bets = JSON.parse(localStorage.getItem("bets") || "[]")
      bets.unshift({
        option: selectedOption,
        amount: amount,
        period: currentPeriod,
        time: new Date().toISOString(),
        userId: user?.id,
      })
      localStorage.setItem("bets", JSON.stringify(bets.slice(0, 50)))
      localStorage.setItem("walletBalance", newBalance.toString())

      toast({
        title: "Bet Placed Successfully",
        description: `₹${amount} on ${selectedOption}`,
      })
    } catch (error) {
      console.error("Bet error:", error)
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabChange = (tab: string) => {
    if (isProcessing) {
      toast({
        title: "Please Wait",
        description: "Cannot switch tabs while bet is processing",
        variant: "destructive",
      })
      return
    }

    if (tab !== "game") {
      router.push(`/${tab}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#2D1B2E] flex justify-center">
      {/* Mobile Container */}
      <div className="w-full max-w-md relative min-h-screen pb-20 border-x border-gray-800">
        {/* Top Bar */}
        <div className="bg-[#3a1b32] p-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-white truncate">{user?.username || "Player"}</h1>
            <div className="text-white font-semibold text-sm">₹{walletBalance}</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-3">
          {/* Balance Card */}
          <div className="bg-red-600 mt-3 rounded-lg p-4">
            <p className="text-white text-center text-sm">Available balance:</p>
            <p className="text-white text-center text-2xl font-bold">₹{balance}</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button className="bg-red-700 text-white py-2 rounded-lg text-sm">Recharge</button>
              <button className="bg-red-700 text-white py-2 rounded-lg text-sm">Read Rule</button>
            </div>
          </div>

          {/* Period and Countdown */}
          <div className="bg-red-800 mt-3 rounded-lg p-3">
            <div className="grid grid-cols-2 text-white text-center">
              <div>
                <p className="text-sm">Period</p>
                <p className="text-lg font-bold">{currentPeriod}</p>
              </div>
              <div>
                <p className="text-sm">Countdown</p>
                <p
                  className={`text-lg font-bold countdown-animation
                  ${countdown <= 10 ? "text-red-400" : ""}
                  ${countdown <= 5 ? "animate-pulse" : ""}`}
                >
                  00:{String(countdown).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* Color Buttons */}
          <div className="mt-3">
            <h3 className="text-white mb-2">Select Color</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <button
                  className={`w-full bg-green-500 text-white py-2 rounded-lg text-sm
                    ${selectedOption === "Green" ? "ring-2 ring-white" : ""}`}
                  onClick={() => handleOptionClick("Green")}
                  disabled={countdown <= 5}
                >
                  Join Green
                </button>
              </div>
              <div>
                <button
                  className={`w-full bg-violet-500 text-white py-2 rounded-lg text-sm
                    ${selectedOption === "Violet" ? "ring-2 ring-white" : ""}`}
                  onClick={() => handleOptionClick("Violet")}
                  disabled={countdown <= 5}
                >
                  Join Violet
                </button>
              </div>
              <div>
                <button
                  className={`w-full bg-red-500 text-white py-2 rounded-lg text-sm
                    ${selectedOption === "Red" ? "ring-2 ring-white" : ""}`}
                  onClick={() => handleOptionClick("Red")}
                  disabled={countdown <= 5}
                >
                  Join Red
                </button>
              </div>
            </div>
          </div>

          {/* Number Grid */}
          <div className="mt-6">
            <h3 className="text-white mb-2">Select Number</h3>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i}>
                  <button
                    onClick={() => handleOptionClick(i)}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center 
                      text-white text-lg font-bold
                      ${
                        i === 0
                          ? "bg-gradient-to-br from-violet-500 to-red-500"
                          : i % 2 === 0
                            ? "bg-red-500"
                            : "bg-green-500"
                      }
                      ${selectedNumber === i ? "ring-2 ring-white" : ""}`}
                    disabled={countdown <= 5}
                  >
                    {i}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white">Recent Results</h3>
              <button onClick={() => router.push("/history")} className="text-red-400 text-sm">
                View All
              </button>
            </div>

            <div className="bg-[#3D2A3F] rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 text-sm text-gray-300 bg-[#2D1B2E] p-2">
                <div>Period</div>
                <div>Time</div>
                <div>Number</div>
                <div>Color</div>
              </div>

              <div className="divide-y divide-[#2D1B2E]">
                {recentResults.map((result, index) => (
                  <div key={`${result.period}-${index}`} className="grid grid-cols-4 p-2 text-sm items-center">
                    <div className="text-gray-300">{result.period}</div>
                    <div className="text-gray-300">{result.timestamp}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white
                          ${
                            result.number === 0
                              ? "bg-gradient-to-br from-violet-500 to-red-500"
                              : result.number % 2 === 0
                                ? "bg-red-500"
                                : "bg-green-500"
                          }
                        `}
                      >
                        {result.number}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs text-white
                          ${
                            result.color.includes("Violet")
                              ? "bg-violet-500"
                              : result.color.includes("Red")
                                ? "bg-red-500"
                                : "bg-green-500"
                          }`}
                      >
                        {result.color}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-[#3D2A3F] p-2 rounded-lg">
                <div className="text-xs text-gray-300">Red</div>
                <div className="text-lg font-bold text-red-500">
                  {recentResults.filter((r) => r.color.includes("Red")).length}
                </div>
              </div>
              <div className="bg-[#3D2A3F] p-2 rounded-lg">
                <div className="text-xs text-gray-300">Green</div>
                <div className="text-lg font-bold text-green-500">
                  {recentResults.filter((r) => r.color.includes("Green")).length}
                </div>
              </div>
              <div className="bg-[#3D2A3F] p-2 rounded-lg">
                <div className="text-xs text-gray-300">Violet</div>
                <div className="text-lg font-bold text-violet-500">
                  {recentResults.filter((r) => r.color.includes("Violet")).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 max-w-md mx-auto">
          <div className="grid grid-cols-4 text-gray-400">
            <button onClick={() => handleTabChange("game")} className="flex flex-col items-center p-2">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Game</span>
            </button>
            <button onClick={() => handleTabChange("history")} className="flex flex-col items-center p-2">
              <History className="h-5 w-5" />
              <span className="text-xs mt-1">History</span>
            </button>
            <button onClick={() => handleTabChange("wallet")} className="flex flex-col items-center p-2">
              <Wallet className="h-5 w-5" />
              <span className="text-xs mt-1">Wallet</span>
            </button>
            <button onClick={() => handleTabChange("settings")} className="flex flex-col items-center p-2">
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      </div>

      <BetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedOption={selectedOption}
        onPlaceBet={handlePlaceBet}
      />
    </div>
  )
}

