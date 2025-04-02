"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface WithdrawalRequest {
  id: string
  userId: string
  name: string
  amount: number
  upiId: string
  timestamp: string
  status: 'pending' | 'rejected' | 'completed'
}

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load withdrawal requests from localStorage
    const loadRequests = () => {
      const withdrawalRequests = JSON.parse(localStorage.getItem("withdrawalRequests") || "[]")
      setRequests(withdrawalRequests)
    }

    loadRequests()

    // Listen for storage changes
    window.addEventListener("storage", loadRequests)
    return () => window.removeEventListener("storage", loadRequests)
  }, [])

  const handleApprove = (request: WithdrawalRequest) => {
    // Update request status
    const updatedRequests = requests.map(r => {
      if (r.id === request.id) {
        return { ...r, status: "completed" }
      }
      return r
    })

    // Add to transaction history
    const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
    transactionHistory.push({
      type: "withdrawal",
      amount: request.amount,
      timestamp: new Date().toISOString(),
      description: `Withdrawal to: ${request.upiId} (${request.name})`,
      status: "completed"
    })

    // Update storage
    localStorage.setItem("withdrawalRequests", JSON.stringify(updatedRequests))
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory))
    setRequests(updatedRequests as WithdrawalRequest[])

    toast({
      title: "Withdrawal Approved",
      description: `Withdrawal of ₹${request.amount} to ${request.name} has been approved.`,
    })
  }

  const handleReject = (request: WithdrawalRequest) => {
    // Update request status
    const updatedRequests = requests.map(r => {
      if (r.id === request.id) {
        return { ...r, status: "rejected" }
      }
      return r
    })

    // Add to transaction history
    const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]")
    transactionHistory.push({
      type: "withdrawal",
      amount: request.amount,
      timestamp: new Date().toISOString(),
      description: `Withdrawal rejected: ${request.upiId} (${request.name})`,
      status: "rejected"
    })

    // Refund the amount to user's wallet
    const currentBalance = parseFloat(localStorage.getItem(`wallet_${request.userId}`) || "0")
    const newBalance = currentBalance + request.amount
    localStorage.setItem(`wallet_${request.userId}`, newBalance.toString())

    // Update storage
    localStorage.setItem("withdrawalRequests", JSON.stringify(updatedRequests))
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory))
    setRequests(updatedRequests as WithdrawalRequest[])

    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal of ₹${request.amount} has been rejected and refunded.`,
      variant: "destructive",
    })
  }

  const filteredRequests = requests.filter(request => 
    request.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate statistics
  const pendingRequests = requests.filter(r => r.status === "pending")
  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0)
  const todayApproved = requests.filter(r => 
    r.status === "completed" && 
    new Date(r.timestamp).toDateString() === new Date().toDateString()
  )
  const todayApprovedAmount = todayApproved.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Withdrawal Requests</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
          <p className="text-2xl font-bold mt-2">{pendingRequests.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Pending Amount</h3>
          <p className="text-2xl font-bold mt-2">₹{totalPendingAmount}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Today's Approved Amount</h3>
          <p className="text-2xl font-bold mt-2">₹{todayApprovedAmount}</p>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">All Requests</h3>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by UPI ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>UPI ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {new Date(request.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.upiId}</TableCell>
                  <TableCell>₹{request.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      request.status === "completed" ? "bg-green-100 text-green-800" :
                      request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-600"
                          onClick={() => handleApprove(request)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                          onClick={() => handleReject(request)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No withdrawal requests found
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