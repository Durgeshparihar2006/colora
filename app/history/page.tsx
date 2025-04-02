"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface BetHistoryItem {
  period: string
  time: string
  selection: string
  amount: number
  result: string | null
  status: string
  betType: "number" | "color"
  winningNumber?: number
  winningColor?: string
  winAmount?: number
}

export default function HistoryPage() {
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    // Load initial bet history
    const loadHistory = () => {
      const history = localStorage.getItem("betHistory")
      if (history) {
        setBetHistory(JSON.parse(history))
      }
    }
    
    loadHistory()

    // Set up real-time updates
    const interval = setInterval(loadHistory, 1000)
    return () => clearInterval(interval)
  }, [])

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return betHistory.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(betHistory.length / itemsPerPage)

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

  return (
    <div className="min-h-screen bg-[rgb(82,37,70)]">
      <div className="max-w-2xl mx-auto px-3 py-5">
        <div className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm rounded-lg border border-red-700/30 shadow-xl">
          <h1 className="text-xl font-bold text-red-100 mb-4 text-center">Bet History</h1>
          {betHistory.length === 0 ? (
            <div className="text-center py-6 text-red-200/70">No bet history available</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-red-700/30">
                      <th className="px-3 py-2 text-left text-sm font-medium text-red-200/70 uppercase tracking-wider">Period</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-red-200/70 uppercase tracking-wider">Time</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-red-200/70 uppercase tracking-wider">Selection</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-red-200/70 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-red-200/70 uppercase tracking-wider">Result</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-red-200/70 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-700/30">
                    {getCurrentPageItems().map((bet, index) => (
                      <tr key={index} className="hover:bg-red-800/30 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-red-100/90 text-sm">{bet.period}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-red-100/90 text-sm">{bet.time}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={
                            bet.betType === "number" ? "text-blue-400" : 
                            bet.selection === "red" ? "text-red-400" :
                            bet.selection === "green" ? "text-green-400" :
                            "text-violet-400"
                          }>
                            {bet.selection}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-red-100/90 text-sm">₹{bet.amount}</td>
                        <td className="px-3 py-2 text-center">
                          {bet.status !== "Pending" && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-red-100/90 text-sm">{bet.winningNumber}</span>
                              {bet.winningColor && (
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  bet.winningColor === "red" ? "bg-red-500" :
                                  bet.winningColor === "green" ? "bg-green-500" :
                                  "bg-violet-500"
                                }`} />
                              )}
                            </div>
                          )}
                        </td>
                        <td className={`px-3 py-2 text-right font-medium text-sm ${
                          bet.status === "Won" ? "text-green-400" :
                          bet.status === "Lost" ? "text-red-400" :
                          "text-yellow-400"
                        }`}>
                          {bet.status === "Won" ? `+₹${bet.winAmount}` :
                           bet.status === "Lost" ? `-₹${bet.amount}` :
                           bet.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-red-800/30 border border-red-700/50 text-red-100 hover:bg-red-700/50 disabled:opacity-50 text-sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-red-100">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-red-800/30 border border-red-700/50 text-red-100 hover:bg-red-700/50 disabled:opacity-50 text-sm"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 