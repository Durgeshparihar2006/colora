"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import UPIQRCode from "@/components/payment/upi-qr"
import { Label } from "@/components/ui/label"

// Extend the Window interface to include countdownInterval
declare global {
  interface Window {
    countdownInterval: ReturnType<typeof setInterval> | undefined;
  }
}

interface GameResult {
  period: string;
  number: number;
  color: string;
  price: number;
  isWin: boolean;
  winAmount?: number;
  totalBets?: number;
  totalWins?: number;
}

interface User {
  id: string;
  balance: number;
  totalBets: number;
  totalWins: number;
}

// Add these constants at the top of the file
const MIN_BET_AMOUNT = 10
const MAX_BET_AMOUNT = 10000
const MIN_WALLET_BALANCE = 10

// Color mapping for numbers
const numberColors: Record<number, string | string[]> = {
  0: ["violet", "red"],
  1: "green",
  2: "red",
  3: "green",
  4: "red",
  5: ["violet", "green"],
  6: "red",
  7: "green",
  8: "red",
  9: "green"
}

export default function GameContent() {
  // Game state
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [gamePeriod, setGamePeriod] = useState<string>("")
  const [countdown, setCountdown] = useState<number>(60)
  const [recentResults, setRecentResults] = useState<GameResult[]>([])
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [gameSettings, setGameSettings] = useState({
    roundDuration: 60,
    resultMode: "automatic",
    lastUpdated: 0
  })
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const resultsPerPage = 10
  const [showResult, setShowResult] = useState<boolean>(false)
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null)
  const [showBetDialog, setShowBetDialog] = useState<boolean>(false)
  const [currentSelection, setCurrentSelection] = useState<{
    type: "color" | "number";
    value: string | number;
  } | null>(null)
  const [showRecharge, setShowRecharge] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState(0)
  const [isGameActive, setIsGameActive] = useState<boolean>(false)
  const [totalBets, setTotalBets] = useState<number>(0)
  const [totalWins, setTotalWins] = useState<number>(0)

  // Helper function to get color for a number
  const getColorForNumber = (number: number): string | string[] => {
    return numberColors[number] || ["red"]
  }

  // Update the result display to use the new colors
  const renderResultColors = (number: number) => {
    const colors = getColorForNumber(number)
    if (Array.isArray(colors)) {
      return (
        <>
          <div className="w-4 h-4 rounded-full bg-violet-500 mx-0.5"></div>
          {colors[1] === "red" ? (
            <div className="w-4 h-4 rounded-full bg-red-500 mx-0.5"></div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-green-500 mx-0.5"></div>
          )}
        </>
      )
    }
    return (
      <div 
        className={`w-4 h-4 rounded-full mx-0.5 ${
          colors === "red" 
            ? "bg-red-500" 
            : colors === "green"
            ? "bg-green-500"
            : "bg-violet-500"
        }`}
      ></div>
    )
  }

  // Update the number buttons to use the new colors
  const renderNumberButton = (number: number) => {
    const colors = getColorForNumber(number)
    const isSelected = selectedNumber === number
    
    return (
      <Button
        key={number}
        variant={isSelected ? "default" : "outline"}
        className={`w-full h-12 text-lg font-bold ${
          Array.isArray(colors)
            ? "bg-gradient-to-r from-violet-500 to-red-500"
            : colors === "red"
            ? "bg-red-500 hover:bg-red-600"
            : colors === "green"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-violet-500 hover:bg-violet-600"
        } ${isSelected ? "ring-2 ring-white" : ""} text-white`}
        onClick={() => handleNumberSelect(number)}
      >
        {number}
      </Button>
    )
  }

  // Update the result dialog to use the helper function
  const renderResultDialog = () => {
    if (!currentResult) return null

    return (
      <div className="text-center space-y-4">
        <p className="text-xl">Period: {currentResult.period}</p>
        <div className="flex justify-center items-center gap-4">
          <div className="text-3xl font-bold">
            Number: {currentResult.number}
          </div>
          <div className="flex items-center gap-2">
            {renderResultColors(currentResult.number)}
          </div>
        </div>
        {(selectedColor || selectedNumber !== null) && (
          <p className={`text-2xl font-bold ${
            currentResult.isWin ? "text-green-600" : "text-red-600"
          }`}>
            {currentResult.isWin 
              ? `Won ₹${currentResult.winAmount}` 
              : `Lost ₹${currentResult.price}`}
          </p>
        )}
        <div className="mt-4 text-sm text-gray-600">
          <p>Total Bets: ₹{totalBets}</p>
          <p>Total Wins: ₹{totalWins}</p>
          <p>Net Balance: ₹{walletBalance}</p>
        </div>
      </div>
    )
  }

  // Initialize game on mount
  useEffect(() => {
    loadGameData()
    initializeGame()

    return () => {
      if (window.countdownInterval) {
        clearInterval(window.countdownInterval)
      }
    }
  }, [])

  // Load saved game data
  const loadGameData = () => {
    const storedBalance = localStorage.getItem("walletBalance")
    const storedTotalBets = localStorage.getItem("totalBets")
    const storedTotalWins = localStorage.getItem("totalWins")
    const storedResults = localStorage.getItem("gameResults")

    if (storedBalance) setWalletBalance(Number(storedBalance))
    if (storedTotalBets) setTotalBets(Number(storedTotalBets))
    if (storedTotalWins) setTotalWins(Number(storedTotalWins))
    if (storedResults) setRecentResults(JSON.parse(storedResults))
  }

  // Initialize game
  const initializeGame = () => {
    const period = generatePeriod()
    setGamePeriod(period)
    localStorage.setItem("currentGamePeriod", period)
    startCountdown(60)
  }

  // Generate period number (YYMMDDXXX)
  const generatePeriod = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const datePrefix = `${year}${month}${day}`
    
    const currentPeriod = localStorage.getItem("currentGamePeriod")
    
    if (!currentPeriod || currentPeriod.slice(0, 6) !== datePrefix) {
      return `${datePrefix}001`
    }

    const currentSequence = parseInt(currentPeriod.slice(-3))
    const nextSequence = (currentSequence + 1).toString().padStart(3, '0')
    return `${datePrefix}${nextSequence}`
  }

  // Start countdown timer
  const startCountdown = (seconds: number) => {
    setCountdown(seconds)
    
    if (window.countdownInterval) {
      clearInterval(window.countdownInterval)
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    window.countdownInterval = interval
  }

  // End current game
  const endGame = () => {
    const result = generateResult()
    setCurrentResult(result)
    setShowResult(true)
    processBets(result)
    updateGameHistory(result)
    resetGameState()

    const nextPeriod = generatePeriod()
    setGamePeriod(nextPeriod)
    localStorage.setItem("currentGamePeriod", nextPeriod)

    setTimeout(() => {
      setShowResult(false)
      startCountdown(60)
    }, 3000)
  }

  // Generate game result
  const generateResult = () => {
    const number = Math.floor(Math.random() * 10)
    const color = Array.isArray(numberColors[number])
      ? numberColors[number][Math.floor(Math.random() * 2)]
      : numberColors[number]

    return {
      period: gamePeriod,
      number,
      color,
      price: betAmount,
      isWin: false
    }
  }

  // Process bets
  const processBets = (result: any) => {
    if (!selectedColor && selectedNumber === null) return

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) return

    let isWin = false
    let multiplier = 1

    if (selectedNumber !== null) {
      isWin = selectedNumber === result.number
      multiplier = 9
    } else if (selectedColor) {
      isWin = selectedColor === result.color
      multiplier = selectedColor === "violet" ? 5 : 2
    }

    const winAmount = isWin ? betAmount * multiplier : 0

    if (isWin) {
      const newTotalWins = totalWins + winAmount
      const newBalance = walletBalance + winAmount
      
      setTotalWins(newTotalWins)
      setWalletBalance(newBalance)
      
      localStorage.setItem("totalWins", newTotalWins.toString())
      localStorage.setItem("walletBalance", newBalance.toString())

      updateUserData(user.id, {
        balance: newBalance,
        totalWins: newTotalWins
      })
    }

    updateBetHistory(gamePeriod, result.color, isWin, result.number, winAmount)
  }

  // Update game history
  const updateGameHistory = (result: any) => {
    const updatedResults = [result, ...recentResults].slice(0, 50)
    setRecentResults(updatedResults)
    localStorage.setItem("gameResults", JSON.stringify(updatedResults))
  }

  // Update bet history
  const updateBetHistory = (
    period: string,
    result: string,
    isWin: boolean,
    number: number,
    winAmount: number
  ) => {
    const existingBets = localStorage.getItem("betHistory")
    if (!existingBets) return

    const bets = JSON.parse(existingBets)
    const updatedBets = bets.map((bet: any) => {
      if (bet.period === period) {
        return {
          ...bet,
          result: bet.betType === "number" ? number.toString() : result,
          winningNumber: number,
          winningColor: result,
          winAmount,
          status: isWin ? "Won" : "Lost"
        }
      }
      return bet
    })

    localStorage.setItem("betHistory", JSON.stringify(updatedBets))
  }

  // Add bet to history
  const addBetHistory = (period: string, selection: string, amount: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) return

    const bet = {
      period,
      time: new Date().toLocaleTimeString(),
      selection,
      amount,
      result: null,
      status: "Pending",
      betType: selection.startsWith("Number") ? "number" : "color",
      userId: user.id
    }

    const existingBets = JSON.parse(localStorage.getItem("betHistory") || "[]")
    const updatedBets = [bet, ...existingBets]
    localStorage.setItem("betHistory", JSON.stringify(updatedBets))
  }

  // Update user data
  const updateUserData = (userId: string, updates: any) => {
    const storedUsers = localStorage.getItem("users")
    if (!storedUsers) return

    const users = JSON.parse(storedUsers)
    const updatedUsers = users.map((user: any) => {
      if (user.id === userId) {
        return { ...user, ...updates }
      }
      return user
    })

    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  // Reset game state
  const resetGameState = () => {
    setSelectedColor(null)
    setSelectedNumber(null)
    setBetAmount(0)
    setCustomAmount("")
  }

  // Format time display
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  // Handle color selection
  const handleColorSelect = (color: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) {
      toast({
        title: "Login Required",
        description: "Please login to place bets",
        variant: "destructive",
      })
      return
    }

    if (countdown <= 0) {
      toast({
        title: "Game Ended",
        description: "Please wait for the next game to start",
        variant: "destructive",
      })
      return
    }

    setSelectedColor(color)
    setSelectedNumber(null)
    setCurrentSelection({ type: "color", value: color })
    setBetAmount(0)
    setCustomAmount("")
    setShowBetDialog(true)
  }

  // Handle number selection
  const handleNumberSelect = (number: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) {
      toast({
        title: "Login Required",
        description: "Please login to place bets",
        variant: "destructive",
      })
      return
    }

    if (countdown <= 0) {
      toast({
        title: "Game Ended",
        description: "Please wait for the next game to start",
        variant: "destructive",
      })
      return
    }

    setSelectedNumber(number)
    setSelectedColor(null)
    setCurrentSelection({ type: "number", value: number })
    setBetAmount(0)
    setCustomAmount("")
    setShowBetDialog(true)
  }

  // Handle bet amount selection
  const handleBetAmountSelect = (amount: number) => {
    if (amount < MIN_BET_AMOUNT) {
      toast({
        title: "Invalid Amount",
        description: `Minimum bet amount is ₹${MIN_BET_AMOUNT}`,
        variant: "destructive",
      })
      return
    }

    if (amount > MAX_BET_AMOUNT) {
      toast({
        title: "Invalid Amount",
        description: `Maximum bet amount is ₹${MAX_BET_AMOUNT}`,
        variant: "destructive",
      })
      return
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please recharge your wallet",
        variant: "destructive",
      })
      return
    }

    setBetAmount(amount)
    setCustomAmount(amount.toString())
  }

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)
    
    if (value === "") {
      setBetAmount(0)
      return
    }

    const amount = Number(value)
    if (!isNaN(amount)) {
      setBetAmount(amount)
    }
  }

  // Handle bet placement
  const handlePlaceBet = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.id) {
      toast({
        title: "Login Required",
        description: "Please login to place bets",
        variant: "destructive",
      })
      return
    }

    if (countdown <= 0) {
      toast({
        title: "Game Ended",
        description: "Please wait for the next game to start",
        variant: "destructive",
      })
      return
    }

    if (!selectedColor && selectedNumber === null) {
      toast({
        title: "Invalid Selection",
        description: "Please select a color or number to bet on",
        variant: "destructive",
      })
      return
    }

    if (!betAmount || betAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select a valid bet amount",
        variant: "destructive",
      })
      return
    }

    if (betAmount < MIN_BET_AMOUNT) {
      toast({
        title: "Invalid Amount",
        description: `Minimum bet amount is ₹${MIN_BET_AMOUNT}`,
        variant: "destructive",
      })
      return
    }

    if (betAmount > MAX_BET_AMOUNT) {
      toast({
        title: "Invalid Amount",
        description: `Maximum bet amount is ₹${MAX_BET_AMOUNT}`,
        variant: "destructive",
      })
      return
    }

    if (betAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please recharge your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      // Deduct bet amount
      const newBalance = walletBalance - betAmount
      setWalletBalance(newBalance)
      localStorage.setItem("walletBalance", newBalance.toString())

      // Update total bets
      const newTotalBets = totalBets + betAmount
      setTotalBets(newTotalBets)
      localStorage.setItem("totalBets", newTotalBets.toString())

      // Update user data
      updateUserData(user.id, {
        balance: newBalance,
        totalBets: newTotalBets
      })

      // Record bet
      const selection = selectedNumber !== null 
        ? `Number ${selectedNumber}` 
        : selectedColor || ""
      addBetHistory(gamePeriod, selection, betAmount)

      toast({
        title: "Bet Placed Successfully",
        description: `You bet ₹${betAmount} on ${selection}`,
      })

      // Close dialog
      handleBetDialogClose()
    } catch (error) {
      console.error("Place bet error:", error)
      toast({
        title: "Failed to Place Bet",
        description: "Something went wrong while placing your bet",
        variant: "destructive",
      })
    }
  }

  // Dialog handlers
  const handleBetDialogClose = () => {
    setShowBetDialog(false)
    setSelectedColor(null)
    setSelectedNumber(null)
    setCurrentSelection(null)
    setBetAmount(0)
    setCustomAmount("")
  }

  const handleRechargeClick = () => setShowRecharge(true)
  const handleCloseRecharge = () => setShowRecharge(false)
  const handleAmountChange = (amount: number) => setRechargeAmount(amount)

  // Add pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  // Get current page results
  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * resultsPerPage
    const endIndex = startIndex + resultsPerPage
    return recentResults?.slice(startIndex, endIndex) || []
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#522546" }}>
      <div className="max-w-4xl mx-auto space-y-4 p-4">
        {/* Header with balance */}
        <Card className="bg-gradient-to-r from-red-700 to-red-600 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-center w-full sm:text-left">
                <p className="text-red-100">Available balance:</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">₹{walletBalance.toFixed(2)}</p>
              </div>
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 sm:w-auto bg-red-800/20 text-white border-red-400/30 hover:bg-red-800/30 text-sm sm:text-base"
                  onClick={handleRechargeClick}
                >
                  Recharge
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:w-auto bg-red-800/20 text-white border-red-400/30 hover:bg-red-800/30 text-sm sm:text-base"
                >
                  Read Rule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Period and Timer */}
        <Card className="bg-gradient-to-b from-red-900 to-red-800 shadow-xl border-red-700">
          <CardHeader className="p-4">
            <div className="flex flex-row justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-red-300 text-sm">Period</p>
                <CardTitle className="text-xl sm:text-2xl text-white">{gamePeriod}</CardTitle>
              </div>
              <div className="text-center flex-1">
                <p className="text-red-300 text-sm">Count Down</p>
                <CardTitle className="text-xl sm:text-2xl text-white">{formatTime(countdown)}</CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Color Selection Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-red-100/50 p-4 rounded-lg">
          <Button
            variant={selectedColor === "green" ? "default" : "outline"}
            className={`h-12 sm:h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-lg shadow-lg ${selectedColor === "green" ? "ring-2 ring-green-400" : ""}`}
            onClick={() => handleColorSelect("green")}
          >
            Join Green
          </Button>
          <Button
            variant={selectedColor === "violet" ? "default" : "outline"}
            className={`h-12 sm:h-14 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-bold text-base sm:text-lg shadow-lg ${selectedColor === "violet" ? "ring-2 ring-violet-400" : ""}`}
            onClick={() => handleColorSelect("violet")}
          >
            Join Violet
          </Button>
          <Button
            variant={selectedColor === "red" ? "default" : "outline"}
            className={`h-12 sm:h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-base sm:text-lg shadow-lg ${selectedColor === "red" ? "ring-2 ring-red-400" : ""}`}
            onClick={() => handleColorSelect("red")}
          >
            Join Red
          </Button>
        </div>

        {/* Number Selection Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-red-100/50 p-4 rounded-lg">
          {Array.from({ length: 10 }, (_, i) => (
            <Button
              key={i}
              variant={selectedNumber === i ? "default" : "outline"}
              className={`h-12 sm:h-14 text-lg font-bold shadow-lg ${
                Array.isArray(numberColors[i])
                  ? "bg-gradient-to-r from-violet-500 to-red-500 hover:from-violet-600 hover:to-red-600"
                  : numberColors[i] === "red"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : numberColors[i] === "green"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
              } ${selectedNumber === i ? "ring-2 ring-white" : ""} text-white`}
              onClick={() => handleNumberSelect(i)}
            >
              {i}
            </Button>
          ))}
        </div>

        {/* Bet Dialog */}
        <Dialog open={showBetDialog} onOpenChange={(open) => {
          if (!open) handleBetDialogClose()
          setShowBetDialog(open)
        }}>
          <DialogContent className="sm:max-w-md bg-gradient-to-b from-red-100 to-red-50">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-red-900">
                Place Your Bet on{" "}
                {currentSelection?.type === "number" 
                  ? `Number ${currentSelection.value}`
                  : `${currentSelection?.value}`}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[10, 100, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    variant={betAmount === amount ? "default" : "outline"}
                    className={`w-full shadow-sm ${
                      betAmount === amount
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "hover:bg-red-100 border-red-300 text-red-900"
                    }`}
                    onClick={() => handleBetAmountSelect(amount)}
                    disabled={amount > walletBalance}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="flex-1 bg-white/80 border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
                  min={MIN_BET_AMOUNT}
                  max={Math.min(MAX_BET_AMOUNT, walletBalance)}
                />
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (customAmount) {
                      handleBetAmountSelect(Number(customAmount))
                    }
                  }}
                  className="whitespace-nowrap border-red-300 text-red-900 hover:bg-red-100"
                  disabled={!customAmount || Number(customAmount) <= 0}
                >
                  Set Amount
                </Button>
              </div>

              {/* Selected Amount Display */}
              {betAmount > 0 && (
                <div className="text-center text-lg font-bold text-red-900">
                  Selected Amount: ₹{betAmount}
                </div>
              )}

              {/* Validation Messages */}
              {betAmount > 0 && betAmount < MIN_BET_AMOUNT && (
                <div className="text-center text-red-600">
                  Minimum bet amount is ₹{MIN_BET_AMOUNT}
                </div>
              )}
              {betAmount > MAX_BET_AMOUNT && (
                <div className="text-center text-red-600">
                  Maximum bet amount is ₹{MAX_BET_AMOUNT}
                </div>
              )}
              {betAmount > walletBalance && (
                <div className="text-center text-red-600">
                  Insufficient balance. Please recharge.
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-900 hover:bg-red-100"
                  onClick={handleBetDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={
                    !betAmount || 
                    betAmount <= 0 || 
                    betAmount < MIN_BET_AMOUNT || 
                    betAmount > MAX_BET_AMOUNT || 
                    betAmount > walletBalance
                  }
                  onClick={handlePlaceBet}
                >
                  Place Bet
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={showResult} onOpenChange={setShowResult}>
          <DialogContent className="sm:max-w-md bg-gradient-to-b from-red-100 to-red-50">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-red-900">
                Game Result
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              {currentResult && (
                <div className="text-center space-y-4">
                  <p className="text-xl">Period: {currentResult.period}</p>
                  <div className="flex justify-center items-center gap-4">
                    <div className="text-3xl font-bold">
                      Number: {currentResult.number}
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.isArray(numberColors[currentResult.number]) ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-violet-500"></div>
                          <div className={`w-4 h-4 rounded-full ${
                            numberColors[currentResult.number][1] === "red" 
                              ? "bg-red-500" 
                              : "bg-green-500"
                          }`}></div>
                        </>
                      ) : (
                        <div className={`w-4 h-4 rounded-full ${
                          numberColors[currentResult.number] === "red"
                            ? "bg-red-500"
                            : numberColors[currentResult.number] === "green"
                            ? "bg-green-500"
                            : "bg-violet-500"
                        }`}></div>
                      )}
                    </div>
                  </div>
                  {(selectedColor || selectedNumber !== null) && (
                    <p className={`text-2xl font-bold ${
                      currentResult.isWin ? "text-green-600" : "text-red-600"
                    }`}>
                      {currentResult.isWin 
                        ? `Won ₹${currentResult.winAmount}` 
                        : `Lost ₹${currentResult.price}`}
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Total Bets: ₹{totalBets}</p>
                    <p>Total Wins: ₹{totalWins}</p>
                    <p>Net Balance: ₹{walletBalance}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Recharge Dialog */}
        {showRecharge && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
              <div className="fixed inset-0 bg-red-900/50 backdrop-blur-sm" onClick={handleCloseRecharge} />
              <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-gradient-to-b from-red-100 to-red-50 shadow-xl rounded-2xl">
                <div className="relative">
                  <button
                    onClick={handleCloseRecharge}
                    className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-red-800 text-red-100 hover:text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                  <UPIQRCode amount={rechargeAmount} onAmountChange={handleAmountChange} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}