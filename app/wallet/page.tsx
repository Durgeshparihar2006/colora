"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import UPIQRCode from "@/components/payment/upi-qr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function WalletPage() {
  const [showRecharge, setShowRecharge] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load wallet balance and transactions
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setBalance(user.balance || 0)
    }

    const transactionsStr = localStorage.getItem("transactions")
    if (transactionsStr) {
      setTransactions(JSON.parse(transactionsStr))
    }
  }, [])

  const handleRechargeClick = () => {
    setShowRecharge(true)
  }

  const handleCloseRecharge = () => {
    setShowRecharge(false)
    setRechargeAmount(0)
  }

  const handleWithdrawClick = () => {
    setShowWithdraw(true)
  }

  const handleCloseWithdraw = () => {
    setShowWithdraw(false)
    setWithdrawAmount("")
  }

  const handleAmountChange = (amount: number) => {
    setRechargeAmount(amount)
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive",
      })
      return
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount",
        variant: "destructive",
      })
      return
    }

    // Update balance
    const newBalance = balance - amount
    setBalance(newBalance)

    // Update user data in localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.balance = newBalance
      localStorage.setItem("user", JSON.stringify(user))
    }

    // Add transaction
    const newTransaction = {
      date: new Date().toISOString(),
      type: "Withdrawal",
      amount: -amount,
      status: "Completed"
    }
    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    toast({
      title: "Success",
      description: `Successfully withdrew ₹${amount}`,
    })

    handleCloseWithdraw()
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "rgb(82,37,70)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-red-100">My Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-white" />
              </div>
              <p className="text-red-200/70 mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold text-red-100">₹{balance.toFixed(2)}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                onClick={handleRechargeClick}
              >
                <ArrowUpCircle className="w-5 h-5 mr-2" />
                Add Money
              </Button>
              <Button
                className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white"
                onClick={handleWithdrawClick}
              >
                <ArrowDownCircle className="w-5 h-5 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-red-100">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-red-200/70">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-red-900/30 border border-red-700/30"
                  >
                    <div>
                      <p className="text-red-100 font-medium">{transaction.type}</p>
                      <p className="text-sm text-red-200/70">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-bold ${
                      transaction.amount > 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Updated Recharge Dialog */}
      <Dialog open={showRecharge} onOpenChange={setShowRecharge}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">Recharge Wallet</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <button
              onClick={() => setShowRecharge(false)}
              className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-red-900/30 text-red-200/70 hover:text-red-100 hover:bg-red-800/30 border border-red-700/30"
            >
              ✕
            </button>
            <div className="p-4">
              <UPIQRCode amount={rechargeAmount} onAmountChange={handleAmountChange} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-100">Withdraw Money</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-red-200/70">Available Balance: ₹{balance.toFixed(2)}</p>
              <Input
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-red-900/30 border-red-700/30 text-red-100 placeholder:text-red-200/50"
              />
            </div>
            <div className="text-sm text-red-200/70">
              <p>• Minimum withdrawal: ₹100</p>
              <p>• Maximum withdrawal: ₹{balance.toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseWithdraw}
              className="bg-red-900/30 border-red-700/30 text-red-100 hover:bg-red-800/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              className="bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white"
            >
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 