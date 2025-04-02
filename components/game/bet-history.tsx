"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

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

export default function BetHistory() {
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    // Load bet history from localStorage
    const history = localStorage.getItem("betHistory")
    if (history) {
      setBetHistory(JSON.parse(history))
    }

    // Set up interval to refresh history
    const interval = setInterval(() => {
      const updatedHistory = localStorage.getItem("betHistory")
      if (updatedHistory) {
        setBetHistory(JSON.parse(updatedHistory))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDeleteAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all bet history? This action cannot be undone.")) {
      localStorage.removeItem("betHistory")
      setBetHistory([])
      toast({
        title: "History Deleted",
        description: "All bet history has been permanently deleted.",
      })
    }
  }

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
    <div className="bg-[#522546] rounded-lg p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Bet History</h1>
        {betHistory.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteAllHistory}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete All History
          </Button>
        )}
      </div>
      {betHistory.length === 0 ? (
        <div className="text-center py-8 text-white">No bet history available</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Selection</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {getCurrentPageItems().map((bet, index) => (
                  <tr key={index} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-white">{bet.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{bet.time}</td>
                    <td className="px-6 py-4">
                      <span className={
                        bet.betType === "number" ? "text-blue-400" : 
                        bet.selection === "red" ? "text-red-400" :
                        bet.selection === "green" ? "text-green-400" :
                        "text-violet-400"
                      }>
                        {bet.selection}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white">₹{bet.amount}</td>
                    <td className="px-6 py-4 text-center">
                      {bet.status !== "Pending" && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-white">{bet.winningNumber}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            bet.winningColor === "red" ? "bg-red-500" :
                            bet.winningColor === "green" ? "bg-green-500" :
                            "bg-violet-500"
                          }`} />
                        </div>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
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
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border-white/10 text-white hover:bg-white/5"
            >
              Previous
            </Button>
            <span className="text-sm text-white">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border-white/10 text-white hover:bg-white/5"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

