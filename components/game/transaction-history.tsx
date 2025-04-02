"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  date: string
  type: string
  amount: number
  status: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      // Get transactions from localStorage
      const storedTransactions = localStorage.getItem("transactions")
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-white">No transaction history found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ffffff1a]">
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff1a]">
              {transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-[#ffffff0d]">
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {new Date(transaction.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {transaction.type}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      transaction.amount < 0 ? "text-red-400 font-medium" : "text-green-400 font-medium"
                    }`}
                  >
                    {transaction.amount < 0 ? "-" : "+"}₹{Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      transaction.status === "Completed"
                        ? "text-green-400 font-medium"
                        : transaction.status === "Pending"
                          ? "text-yellow-400 font-medium"
                          : "text-red-400 font-medium"
                    }`}
                  >
                    {transaction.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 