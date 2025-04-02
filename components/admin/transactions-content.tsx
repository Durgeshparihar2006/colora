"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, X, Search } from "lucide-react"

interface PaymentRequest {
  amount: number
  utrNumber: string
  timestamp: string
  status: "pending" | "confirmed" | "rejected"
}

export default function TransactionsContent() {
  const [transactions, setTransactions] = useState<PaymentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { toast } = useToast()

  useEffect(() => {
    // Load transactions from localStorage
    const loadTransactions = () => {
      const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
      setTransactions(pendingPayments)
    }

    loadTransactions()

    // Listen for storage changes
    window.addEventListener("storage", loadTransactions)
    return () => window.removeEventListener("storage", loadTransactions)
  }, [])

  const handleConfirm = (utrNumber: string) => {
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.utrNumber === utrNumber) {
        // Update transaction status
        transaction.status = "confirmed"

        // Update user's wallet balance
        const currentBalance = parseFloat(localStorage.getItem("walletBalance") || "0")
        const newBalance = currentBalance + transaction.amount
        localStorage.setItem("walletBalance", newBalance.toString())

        // Add to transaction history
        const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
        transactionHistory.push({
          type: "credit",
          amount: transaction.amount,
          timestamp: new Date().toISOString(),
          description: `Payment confirmed (UTR: ${utrNumber})`
        })
        localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory))

        toast({
          title: "Payment Confirmed",
          description: `Payment of ₹${transaction.amount} has been confirmed.`,
        })
      }
      return transaction
    })

    setTransactions(updatedTransactions)
    localStorage.setItem("pendingPayments", JSON.stringify(updatedTransactions))
  }

  const handleReject = (utrNumber: string) => {
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.utrNumber === utrNumber) {
        transaction.status = "rejected"

        // Add to transaction history
        const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
        transactionHistory.push({
          type: "rejected",
          amount: transaction.amount,
          timestamp: new Date().toISOString(),
          description: `Payment rejected (UTR: ${utrNumber})`
        })
        localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory))

        toast({
          title: "Payment Rejected",
          description: `Payment of ₹${transaction.amount} has been rejected.`,
          variant: "destructive",
        })
      }
      return transaction
    })

    setTransactions(updatedTransactions)
    localStorage.setItem("pendingPayments", JSON.stringify(updatedTransactions))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  const handleFilterTypeChange = (value: string) => {
    setFilterType(value)
  }
  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value)
  }
  const filteredTransactions = transactions.filter(transaction => 
    transaction.utrNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Payment Transactions</h2>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by UTR number"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>UTR Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.utrNumber}>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{transaction.utrNumber}</TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      transaction.status === "confirmed" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-600"
                          onClick={() => handleConfirm(transaction.utrNumber)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                          onClick={() => handleReject(transaction.utrNumber)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}