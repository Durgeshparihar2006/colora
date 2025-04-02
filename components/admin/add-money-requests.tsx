import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface PaymentRequest {
  amount: number
  utrNumber: string
  timestamp: string
  status: "pending" | "completed" | "rejected"
}

export default function AddMoneyRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [searchUTR, setSearchUTR] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load payment requests
    const loadRequests = () => {
      const storedRequests = localStorage.getItem("pendingPayments")
      if (storedRequests) {
        setRequests(JSON.parse(storedRequests))
      }
    }

    loadRequests()
    
    // Update requests when storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pendingPayments") {
        loadRequests()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handlePaymentAction = (index: number, action: "completed" | "rejected") => {
    const updatedRequests = [...requests]
    const request = updatedRequests[index]
    request.status = action

    // Update payment requests
    localStorage.setItem("pendingPayments", JSON.stringify(updatedRequests))
    setRequests(updatedRequests)

    // If approved, add to wallet balance
    if (action === "completed") {
      const currentBalance = parseFloat(localStorage.getItem("walletBalance") || "0")
      const newBalance = currentBalance + request.amount
      localStorage.setItem("walletBalance", newBalance.toString())
      
      // Dispatch event to update wallet balance across tabs
      window.dispatchEvent(new CustomEvent("walletBalanceUpdated", {
        detail: { balance: newBalance }
      }))
    }

    // Add to transactions
    const transaction = {
      date: new Date().toISOString(),
      type: "Add Money",
      amount: request.amount,
      status: action === "completed" ? "Completed" : "Rejected",
      utrNumber: request.utrNumber
    }

    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    localStorage.setItem("transactions", JSON.stringify([transaction, ...transactions]))

    toast({
      title: action === "completed" ? "Payment Approved" : "Payment Rejected",
      description: `Payment of ₹${request.amount} has been ${action}`,
    })
  }

  const filteredRequests = searchUTR
    ? requests.filter(r => r.utrNumber.toLowerCase().includes(searchUTR.toLowerCase()))
    : requests

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Money Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by UTR number..."
              value={searchUTR}
              onChange={(e) => setSearchUTR(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date & Time</th>
                  <th className="text-left py-2">UTR Number</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No payment requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">
                        {new Date(request.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="font-mono">{request.utrNumber}</span>
                      </td>
                      <td className="py-3 text-right">₹{request.amount}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-500 text-white hover:bg-red-600"
                              onClick={() => handlePaymentAction(index, "rejected")}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => handlePaymentAction(index, "completed")}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Pending Requests</div>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Total Amount Pending</div>
            <div className="text-2xl font-bold">
              ₹{requests
                .filter(r => r.status === "pending")
                .reduce((sum, r) => sum + r.amount, 0)
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Today's Approved</div>
            <div className="text-2xl font-bold">
              ₹{requests
                .filter(r => 
                  r.status === "completed" && 
                  new Date(r.timestamp).toDateString() === new Date().toDateString()
                )
                .reduce((sum, r) => sum + r.amount, 0)
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 