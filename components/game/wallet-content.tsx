"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  date: string
  type: string
  amount: number
  status: string
}

export default function WalletContent() {
  const [walletBalance, setWalletBalance] = useState(0)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [addAmount, setAddAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setIsLoading(true)

    try {
      // Get transactions from localStorage
      const storedTransactions = localStorage.getItem("transactions")
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      } else {
        // If no transactions exist, use empty array
        setTransactions([])
      }

      // Get wallet balance from localStorage
      const storedBalance = localStorage.getItem("walletBalance")
      if (storedBalance) {
        setWalletBalance(Number(storedBalance))
      }
    } catch (error) {
      console.error("Fetch wallet data error:", error)
      toast({
        title: "Failed to Load Wallet Data",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMoney = () => {
    setShowWithdraw(false)
    setShowAddMoney(!showAddMoney)
  }

  const handleWithdraw = () => {
    setShowAddMoney(false)
    setShowWithdraw(!showWithdraw)
  }

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method)
  }

  const handleProcessPayment = async () => {
    const amount = Number(addAmount)

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    try {
      // Update wallet balance in state and localStorage
      const newBalance = walletBalance + amount
      setWalletBalance(newBalance)
      localStorage.setItem("walletBalance", newBalance.toString())

      // Add transaction to history
      const date = new Date()
      const transaction = {
        date: date.toISOString(),
        type: "Add Money",
        amount,
        status: "Completed",
      }

      // Get existing transactions
      const existingTransactions = localStorage.getItem("transactions")
      let transactions = existingTransactions ? JSON.parse(existingTransactions) : []

      // Add new transaction
      transactions = [transaction, ...transactions]

      // Save to localStorage
      localStorage.setItem("transactions", JSON.stringify(transactions))

      // Reset form
      setAddAmount("")
      setPaymentMethod(null)
      setShowAddMoney(false)

      toast({
        title: "Payment Successful",
        description: `₹${amount} added to your wallet`,
      })

      // Refresh transaction history
      fetchWalletData()
    } catch (error) {
      console.error("Add money error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleRequestWithdrawal = async () => {
    const amount = Number(withdrawAmount)

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
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

    if (!bankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account",
        variant: "destructive",
      })
      return
    }

    try {
      // Update wallet balance in state and localStorage
      const newBalance = walletBalance - amount
      setWalletBalance(newBalance)
      localStorage.setItem("walletBalance", newBalance.toString())

      // Add transaction to history
      const date = new Date()
      const transaction = {
        date: date.toISOString(),
        type: "Withdrawal",
        amount: -amount,
        status: "Pending",
      }

      // Get existing transactions
      const existingTransactions = localStorage.getItem("transactions")
      let transactions = existingTransactions ? JSON.parse(existingTransactions) : []

      // Add new transaction
      transactions = [transaction, ...transactions]

      // Save to localStorage
      localStorage.setItem("transactions", JSON.stringify(transactions))

      // Reset form
      setWithdrawAmount("")
      setBankAccount("")
      setShowWithdraw(false)

      toast({
        title: "Withdrawal Requested",
        description: `₹${amount} withdrawal request submitted`,
      })

      // Refresh transaction history
      fetchWalletData()
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-900/10 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Your Wallet</h2>
        {/* Wallet Balance */}
        <Card className="bg-white/5 backdrop-blur-sm border-0 mb-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-medium text-white/90">Your Balance</h3>
                <p className="text-3xl font-bold text-white">
                  ₹<span id="wallet-balance">{walletBalance.toLocaleString()}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddMoney} className="bg-white/10 text-white hover:bg-white/20">Add Money</Button>
                <Button variant="outline" onClick={handleWithdraw} className="border-white/20 text-white hover:bg-white/10">
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Money Section */}
        {showAddMoney && (
          <Card className="bg-white/5 backdrop-blur-sm border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-white">Add Money</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <label className="block text-white/70 mb-2">Amount</label>
                <Input
                  type="number"
                  id="add-amount"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3">Payment Method</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    className={`payment-option bg-white/5 border ${paymentMethod === "upi" ? "border-white" : "border-white/20"} rounded-lg p-4 text-center cursor-pointer hover:bg-white/10`}
                    onClick={() => handleSelectPaymentMethod("upi")}
                  >
                    <i className="fas fa-mobile-alt text-3xl mb-2 text-white"></i>
                    <p className="font-medium text-white">UPI</p>
                  </div>
                  <div
                    className={`payment-option bg-white/5 border ${paymentMethod === "paytm" ? "border-white" : "border-white/20"} rounded-lg p-4 text-center cursor-pointer hover:bg-white/10`}
                    onClick={() => handleSelectPaymentMethod("paytm")}
                  >
                    <i className="fas fa-wallet text-3xl mb-2 text-white"></i>
                    <p className="font-medium text-white">Paytm</p>
                  </div>
                  <div
                    className={`payment-option bg-white/5 border ${paymentMethod === "bank" ? "border-white" : "border-white/20"} rounded-lg p-4 text-center cursor-pointer hover:bg-white/10`}
                    onClick={() => handleSelectPaymentMethod("bank")}
                  >
                    <i className="fas fa-university text-3xl mb-2 text-white"></i>
                    <p className="font-medium text-white">Bank</p>
                  </div>
                  <div
                    className={`payment-option bg-white/5 border ${paymentMethod === "card" ? "border-white" : "border-white/20"} rounded-lg p-4 text-center cursor-pointer hover:bg-white/10`}
                    onClick={() => handleSelectPaymentMethod("card")}
                  >
                    <i className="fas fa-credit-card text-3xl mb-2 text-white"></i>
                    <p className="font-medium text-white">Card</p>
                  </div>
                </div>
              </div>

              {paymentMethod && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <h5 className="font-medium mb-2 text-white">Payment Details</h5>
                  <p className="mb-2 text-white/90">
                    <span className="font-medium">UPI ID:</span> payment@colorpredict
                  </p>
                  <p className="mb-2 text-white/90">
                    <span className="font-medium">Phone Number:</span> 9876543210
                  </p>
                  <p className="text-sm text-white/70">
                    Please make the payment to the above details and click "Confirm Payment"
                  </p>
                </div>
              )}

              <Button onClick={handleProcessPayment} className="w-full bg-white/10 text-white hover:bg-white/20" disabled={!paymentMethod}>
                Confirm Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Withdraw Money Section */}
        {showWithdraw && (
          <Card className="bg-white/5 backdrop-blur-sm border-0 mb-4">
            <CardHeader>
              <CardTitle className="text-white">Withdraw Money</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <label className="block text-white/70 mb-2">Amount</label>
                <Input
                  type="number"
                  id="withdraw-amount"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white/70 mb-2">Bank Account</label>
                <Select value={bankAccount} onValueChange={setBankAccount}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account1">HDFC - XXXX1234</SelectItem>
                    <SelectItem value="account2">SBI - XXXX5678</SelectItem>
                    <SelectItem value="add-new">+ Add new account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRequestWithdrawal} className="w-full bg-white/10 text-white hover:bg-white/20">
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="bg-red-900/10 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
        {/* Transaction History */}
        <Card className="bg-white/5 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-white/70">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-white/70">No transaction history found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">{new Date(transaction.date).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/90">{transaction.type}</td>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

