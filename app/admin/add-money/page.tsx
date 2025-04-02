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

export default function AddMoneyPage() {
  const [transactions, setTransactions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadTransactions = () => {
      // Get pending payments from localStorage
      const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
      
      // Format transactions with additional details
      const formattedTransactions = pendingPayments.map(payment => ({
        id: payment.utrNumber,
        userId: payment.userId || "User",
        userName: payment.userName || "User",
        amount: payment.amount,
        timestamp: payment.timestamp,
        status: payment.status,
        utrNumber: payment.utrNumber,
        type: "deposit"
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
    // Get all pending payments
    const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
    
    // Find the payment to approve
    const paymentIndex = pendingPayments.findIndex(p => p.utrNumber === transactionId)
    if (paymentIndex === -1) return

    const payment = pendingPayments[paymentIndex]

    // Update payment status
    pendingPayments[paymentIndex] = { ...payment, status: "approved" }
    localStorage.setItem("pendingPayments", JSON.stringify(pendingPayments))

    // Update user's wallet balance
    const currentBalance = parseFloat(localStorage.getItem("walletBalance") || "0")
    const newBalance = currentBalance + payment.amount
    localStorage.setItem("walletBalance", newBalance.toString())

    // Add to transaction history
    const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
    transactionHistory.unshift({
      type: "credit",
      amount: payment.amount,
      timestamp: new Date().toISOString(),
      description: `Add Money - UTR: ${payment.utrNumber}`
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
      title: "Payment Approved",
      description: `Successfully approved payment of ₹${payment.amount}`,
    })
  }

  const handleReject = async (userId, transactionId) => {
    // Get all pending payments
    const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
    
    // Find and update the payment status
    const paymentIndex = pendingPayments.findIndex(p => p.utrNumber === transactionId)
    if (paymentIndex === -1) return

    const payment = pendingPayments[paymentIndex]
    pendingPayments[paymentIndex] = { ...payment, status: "rejected" }
    localStorage.setItem("pendingPayments", JSON.stringify(pendingPayments))

    // Update local state
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: "rejected" }
          : t
      )
    )

    toast({
      title: "Payment Rejected",
      description: `Payment of ₹${payment.amount} has been rejected`,
    })
  }

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(t => 
    searchQuery === "" || 
    t.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold text-white">Add Money Requests</h1>
      
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
              placeholder="Search by UTR number..."
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
                <th className="p-4 text-left">UTR Number</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={`${transaction.id}-${transaction.timestamp}`} 
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.userName}</p>
                      <p className="text-sm text-gray-400">{transaction.userId}</p>
                    </div>
                  </td>
                  <td className="p-4">{transaction.utrNumber}</td>
                  <td className="p-4">₹{transaction.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {transaction.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(transaction.userId, transaction.id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(transaction.userId, transaction.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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
                  <p className="font-medium text-green-400">₹{parseFloat(selectedTransaction.amount).toLocaleString()}</p>
                  <p className="text-sm text-gray-300">UTR: {selectedTransaction.utrNumber}</p>
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