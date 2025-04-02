"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PaymentMethods from "@/components/payment/payment-methods"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Transaction {
  type: "Add Money" | "Withdrawal" | "Game Bet" | "Game Win"
  amount: number
  timestamp: string
  status: "Pending" | "Completed" | "Rejected"
  description?: string
}

interface WithdrawalRequest {
  amount: number
  upiId: string
  name: string
  status: "pending" | "completed" | "rejected"
  date: string
}

export default function WalletContent() {
  const [walletBalance, setWalletBalance] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawUpiId, setWithdrawUpiId] = useState("")
  const [withdrawName, setWithdrawName] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load wallet balance
    const balance = localStorage.getItem("walletBalance")
    if (balance) {
      setWalletBalance(parseFloat(balance))
    }

    // Load all transactions
    const loadTransactions = () => {
      // Get transactions from different sources
      const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
      const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
      const withdrawalRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")

      // Combine and format all transactions
      const allTransactions = [
        ...transactionHistory.map((t: any) => ({
          type: t.type === "credit" ? "Add Money" : t.type === "debit" ? "Withdrawal" : t.type,
          amount: t.amount,
          timestamp: t.timestamp,
          status: "Completed",
          description: t.description
        })),
        ...pendingPayments.map((p: any) => ({
          type: "Add Money",
          amount: p.amount,
          timestamp: p.timestamp,
          status: "Pending",
          description: `UTR: ${p.utrNumber}`
        })),
        ...withdrawalRequests.map((w: any) => ({
          type: "Withdrawal",
          amount: w.amount,
          timestamp: w.timestamp,
          status: w.status.charAt(0).toUpperCase() + w.status.slice(1),
          description: `To: ${w.upiId}`
        }))
      ]

      // Sort by timestamp, newest first
      allTransactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setTransactions(allTransactions)
    }

    loadTransactions()

    // Listen for storage changes
    window.addEventListener("storage", loadTransactions)
    return () => window.removeEventListener("storage", loadTransactions)
  }, [])

  const handleWithdrawSubmit = () => {
    const amount = Number(withdrawAmount)
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    if (!withdrawUpiId || !withdrawName) {
      toast({
        title: "Missing Details",
        description: "Please enter your UPI ID and name",
        variant: "destructive",
      })
      return
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount",
        variant: "destructive",
      })
      return
    }

    // Create withdrawal request
    const withdrawalRequest: WithdrawalRequest = {
      amount,
      upiId: withdrawUpiId,
      name: withdrawName,
      status: "pending",
      date: new Date().toISOString()
    }

    // Store withdrawal request
    const existingRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
    localStorage.setItem("withdrawalRequests", JSON.stringify([withdrawalRequest, ...existingRequests]))

    // Add to transactions
    const transaction: Transaction = {
      type: "Withdrawal",
      amount: -amount,
      timestamp: new Date().toISOString(),
      status: "Pending"
    }

    const updatedTransactions = [transaction, ...transactions]
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // Update wallet balance
    const newBalance = walletBalance - amount
    setWalletBalance(newBalance)
    localStorage.setItem("walletBalance", newBalance.toString())

    // Reset form and close modal
    setWithdrawAmount("")
    setWithdrawUpiId("")
    setWithdrawName("")
    setShowWithdraw(false)

    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted for processing",
    })
  }

  if (showPayment) {
    return (
      <div className="container mx-auto p-6">
        <PaymentMethods onClose={() => setShowPayment(false)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Wallet Balance</h2>
                <p className="text-3xl font-bold">₹{walletBalance}</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={() => setShowPayment(true)}
                  className="text-lg px-8 bg-green-600 hover:bg-green-700"
                >
                  Add Money
                </Button>
                <Button 
                  size="lg"
                  onClick={() => setShowWithdraw(true)}
                  className="text-lg px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Withdraw Money</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWithdraw(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">UPI ID</label>
                <Input
                  type="text"
                  placeholder="Enter your UPI ID"
                  value={withdrawUpiId}
                  onChange={(e) => setWithdrawUpiId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleWithdrawSubmit}
              >
                Submit Withdrawal Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Transaction History</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.type === "Add Money" ? "bg-green-100 text-green-800" :
                      transaction.type === "Withdrawal" ? "bg-blue-100 text-blue-800" :
                      transaction.type === "Game Win" ? "bg-purple-100 text-purple-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className={`font-medium ${
                    transaction.type === "Add Money" || transaction.type === "Game Win" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {transaction.type === "Add Money" || transaction.type === "Game Win" ? "+" : "-"}
                    ₹{transaction.amount}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.status === "Completed" ? "bg-green-100 text-green-800" :
                      transaction.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {transaction.description || "-"}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No transactions yet
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