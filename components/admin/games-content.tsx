"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Game {
  period: string
  time: string
  result: string
  bets: number
  profit: number
}

export default function GamesContent() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customPeriod, setCustomPeriod] = useState("")
  const [customColor, setCustomColor] = useState("red")
  const [currentGamePeriod, setCurrentGamePeriod] = useState("")
  const [timeLeft, setTimeLeft] = useState("01:00")
  const [totalBets, setTotalBets] = useState(45)
  const [totalAmount, setTotalAmount] = useState(12500)
  const [roundDuration, setRoundDuration] = useState("3")
  const [resultMode, setResultMode] = useState("manual")
  const { toast } = useToast()

  useEffect(() => {
    fetchGames()

    // Generate current game period
    const generateGamePeriod = () => {
      const date = new Date()
      const year = date.getFullYear().toString().substr(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const datePrefix = `${year}${month}${day}`
      
      // Get the current period number from localStorage or start from 001
      const currentPeriod = localStorage.getItem("currentGamePeriod")
      const lastPeriod = localStorage.getItem("lastGamePeriod")
      
      if (currentPeriod && currentPeriod.length === 9) {
        // Check if it's a new day
        if (!currentPeriod.startsWith(datePrefix)) {
          // If it's a new day, start from 001
          return `${datePrefix}001`
        }
        return currentPeriod
      }
      
      if (lastPeriod && lastPeriod.length === 9) {
        // Check if it's a new day
        if (lastPeriod.startsWith(datePrefix)) {
          // Same day, increment the last number
          const lastSequence = parseInt(lastPeriod.slice(-3))
          if (!isNaN(lastSequence)) {
            return `${datePrefix}${(lastSequence + 1).toString().padStart(3, "0")}`
          }
        }
      }
      
      // If no valid period exists or it's a new day, start from 001
      return `${datePrefix}001`
    }

    const initialPeriod = generateGamePeriod()
    setCurrentGamePeriod(initialPeriod)

    // Function to update countdown
    const updateCountdown = () => {
      const lastUpdate = parseInt(localStorage.getItem("lastCountdownUpdate") || "0")
      const storedCount = parseInt(localStorage.getItem("currentCountdown") || "0")
      const timePassed = Math.floor((Date.now() - lastUpdate) / 1000)
      
      if (lastUpdate && storedCount && timePassed < storedCount) {
        const newCount = Math.max(0, storedCount - timePassed)
        const mins = Math.floor(newCount / 60)
        const secs = newCount % 60
        setTimeLeft(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`)
        return newCount > 0
      }
      return false
    }

    // Start countdown update interval
    const interval = setInterval(() => {
      if (!updateCountdown()) {
        setTimeLeft("00:00")
      }
    }, 1000)

    // Listen for period and countdown changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentGamePeriod" && e.newValue) {
        setCurrentGamePeriod(e.newValue)
      } else if (e.key === "currentCountdown" || e.key === "lastCountdownUpdate") {
        updateCountdown()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Initial countdown update
    updateCountdown()

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const fetchGames = async () => {
    setIsLoading(true)

    try {
      // Get games from localStorage
      const storedGames = localStorage.getItem("games")
      const games = storedGames ? JSON.parse(storedGames) : []
      setGames(games)
    } catch (error) {
      console.error("Fetch games error:", error)
      toast({
        title: "Failed to Load Games",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const storedGames = localStorage.getItem("games")
      if (storedGames) {
        try {
          const games = JSON.parse(storedGames)
          setGames(games)
        } catch (error) {
          console.error("Error parsing games data:", error)
        }
      }
    }

    // Check for changes every second
    const interval = setInterval(handleStorageChange, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSetNextResult = async () => {
    try {
      // In a real app, this would call the backend API
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Result Set",
        description: `Next result for period ${currentGamePeriod} set to ${customColor}`,
      })
    } catch (error) {
      console.error("Set result error:", error)
      toast({
        title: "Failed to Set Result",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleSetCustomResult = async () => {
    if (!customPeriod) {
      toast({
        title: "Error",
        description: "Please enter a period",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would call the backend API
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Custom Result Set",
        description: `Result for period ${customPeriod} set to ${customColor}`,
      })

      // Update games list if the period exists
      setGames(games.map((game) => (game.period === customPeriod ? { ...game, result: customColor } : game)))

      // Clear the input
      setCustomPeriod("")
    } catch (error) {
      console.error("Set custom result error:", error)
      toast({
        title: "Failed to Set Custom Result",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = () => {
    try {
      // Save settings to localStorage
      const settings = {
        roundDuration: parseInt(roundDuration) * 60, // Convert minutes to seconds
        resultMode,
        lastUpdated: Date.now()
      }
      localStorage.setItem("gameSettings", JSON.stringify(settings))
      
      // Update countdown
      localStorage.setItem("currentCountdown", (settings.roundDuration).toString())
      localStorage.setItem("lastCountdownUpdate", Date.now().toString())
      
      // Broadcast settings change to all tabs
      window.dispatchEvent(new CustomEvent("gameSettingsChanged", { 
        detail: settings 
      }))

      toast({
        title: "Settings Saved",
        description: "Game settings have been updated successfully",
      })
    } catch (error) {
      console.error("Save settings error:", error)
      toast({
        title: "Failed to Save Settings",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Game Management</h1>

      {/* Custom Result Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Set Custom Result</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Period</label>
              <Input
                type="text"
                placeholder="Enter period (e.g., 20230615001)"
                value={customPeriod}
                onChange={(e) => setCustomPeriod(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <Select value={customColor} onValueChange={setCustomColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="violet">Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSetCustomResult} className="w-full">
                Set Custom Result
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Game & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Game</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Period:</span> {currentGamePeriod}
              </p>
              <p>
                <span className="font-medium">Time Left:</span> {timeLeft}
              </p>
              <p>
                <span className="font-medium">Total Bets:</span> {totalBets}
              </p>
              <p>
                <span className="font-medium">Total Amount:</span> ₹{totalAmount.toLocaleString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Select value={customColor} onValueChange={setCustomColor}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSetNextResult}>Set Next Result</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="mr-4 w-32">Round Duration:</label>
                <Select value={roundDuration} onValueChange={setRoundDuration}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="3">3 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <label className="mr-4 w-32">Result Mode:</label>
                <Select value={resultMode} onValueChange={setResultMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} className="mt-4">
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading games...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Bets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {games.map((game) => (
                    <tr key={game.period}>
                      <td className="px-6 py-4 whitespace-nowrap">{game.period}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{game.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`color-ball game-color-${game.result}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{game.bets}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${
                          game.profit >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"
                        }`}
                      >
                        {game.profit >= 0
                          ? `₹${game.profit.toLocaleString()}`
                          : `-₹${Math.abs(game.profit).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

