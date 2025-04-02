"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function WithdrawalsPage() {
  const [transactions, setTransactions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadTransactions = () => {
      // Get withdrawal requests from localStorage
      const withdrawalRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
      
      // Format transactions with additional details
      const formattedTransactions = withdrawalRequests.map(withdrawal => ({
        id: withdrawal.upiId + '-' + withdrawal.timestamp,
        userId: withdrawal.userId || "User",
        userName: withdrawal.name || "User",
        amount: withdrawal.amount,
        timestamp: withdrawal.date || withdrawal.timestamp,
        status: withdrawal.status,
        upiId: withdrawal.upiId,
        type: "withdrawal"
      }))

      setTransactions(formattedTransactions)
    }

    loadTransactions()
    // Listen for storage changes
    window.addEventListener("storage", loadTransactions)
    return () => window.removeEventListener("storage", loadTransactions)
  }, [])

  // Calculate statistics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const todayTransactions = transactions.filter(t => 
    new Date(t.timestamp) >= todayStart
  )

  const getTotalAmount = (status) => {
    return todayTransactions
      .filter(t => t.status === status)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  }

  const pendingAmount = getTotalAmount('pending')
  const approvedAmount = getTotalAmount('approved')
  const rejectedAmount = getTotalAmount('rejected')

  const handleApprove = async (userId, transactionId) => {
    // Get all withdrawal requests
    const withdrawalRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
    
    // Find the withdrawal to approve
    const withdrawalIndex = withdrawalRequests.findIndex(w => 
      (w.upiId + '-' + (w.date || w.timestamp)) === transactionId
    )
    if (withdrawalIndex === -1) return

    const withdrawal = withdrawalRequests[withdrawalIndex]

    // Update withdrawal status
    withdrawalRequests[withdrawalIndex] = { ...withdrawal, status: "approved" }
    localStorage.setItem("withdrawalRequests", JSON.stringify(withdrawalRequests))

    // Add to transaction history
    const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
    transactionHistory.unshift({
      type: "debit",
      amount: -withdrawal.amount,
      timestamp: new Date().toISOString(),
      description: `Withdrawal to UPI: ${withdrawal.upiId}`
    })
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory))

    // Update local state
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: "approved" }
          : t
      )
    )

    toast({
      title: "Withdrawal Approved",
      description: `Successfully approved withdrawal of ₹${withdrawal.amount}`,
    })
  }

  const handleReject = async (userId, transactionId) => {
    // Get all withdrawal requests
    const withdrawalRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
    
    // Find and update the withdrawal status
    const withdrawalIndex = withdrawalRequests.findIndex(w => 
      (w.upiId + '-' + (w.date || w.timestamp)) === transactionId
    )
    if (withdrawalIndex === -1) return

    const withdrawal = withdrawalRequests[withdrawalIndex]

    // Update status
    withdrawalRequests[withdrawalIndex] = { ...withdrawal, status: "rejected" }
    localStorage.setItem("withdrawalRequests", JSON.stringify(withdrawalRequests))

    // Refund the amount to user's wallet
    const currentBalance = parseFloat(localStorage.getItem("walletBalance") || "0")
    const newBalance = currentBalance + withdrawal.amount
    localStorage.setItem("walletBalance", newBalance.toString())

    // Update local state
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: "rejected" }
          : t
      )
    )

    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal of ₹${withdrawal.amount} has been rejected and refunded`,
    })
  }

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(t => 
    searchQuery === "" || 
    t.upiId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <h3 className="text-sm font-medium text-gray-300">Today's Pending</h3>
          <p className="text-2xl font-bold mt-2 text-yellow-400">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">{todayTransactions.filter(t => t.status === 'pending').length} requests</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <h3 className="text-sm font-medium text-gray-300">Today's Approved</h3>
          <p className="text-2xl font-bold mt-2 text-green-400">₹{approvedAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">{todayTransactions.filter(t => t.status === 'approved').length} requests</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <h3 className="text-sm font-medium text-gray-300">Today's Rejected</h3>
          <p className="text-2xl font-bold mt-2 text-red-400">₹{rejectedAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">{todayTransactions.filter(t => t.status === 'rejected').length} requests</p>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold">All Requests</h3>
            <Input
              placeholder="Search by UPI ID or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-sm bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-300 uppercase text-xs bg-gray-800/50">
              <tr>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">UPI ID</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.userName}</p>
                      <p className="text-sm text-gray-400">{transaction.userId}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{transaction.upiId}</td>
                  <td className="p-4 font-medium">₹{parseFloat(transaction.amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${transaction.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50' 
                          : transaction.status === 'approved' 
                          ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50'
                          : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50'
                      }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {transaction.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(transaction.userId, transaction.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(transaction.userId, transaction.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">User Details</p>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                  <p className="text-sm text-gray-300">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Transaction Details</p>
                  <p className="font-medium text-blue-400">₹{parseFloat(selectedTransaction.amount).toLocaleString()}</p>
                  <p className="text-sm text-gray-300">UPI ID: {selectedTransaction.upiId}</p>
                  <p className="text-sm text-gray-300">Date: {new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className={`font-medium ${
                  selectedTransaction.status === 'pending' ? 'text-yellow-400' :
                  selectedTransaction.status === 'approved' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 