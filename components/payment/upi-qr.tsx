"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from "qrcode.react"

interface UPIQRCodeProps {
  amount: number
  onAmountChange: (amount: number) => void
}

const MIN_AMOUNT = 100
const MAX_AMOUNT = 50000

export default function UPIQRCode({ amount, onAmountChange }: UPIQRCodeProps) {
  const [customAmount, setCustomAmount] = useState("")
  const [upiId] = useState("9928487363@naviaxis")
  const [isVerifying, setIsVerifying] = useState(false)
  const [utrNumber, setUtrNumber] = useState("")
  const { toast } = useToast()

  const validateAmount = (value: number) => {
    if (isNaN(value) || value <= 0) {
      return { isValid: false, message: "Please enter a valid amount" }
    }
    if (value < MIN_AMOUNT) {
      return { isValid: false, message: `Minimum amount is ₹${MIN_AMOUNT}` }
    }
    if (value > MAX_AMOUNT) {
      return { isValid: false, message: `Maximum amount is ₹${MAX_AMOUNT}` }
    }
    return { isValid: true, message: "" }
  }

  const handleAmountSelect = (selectedAmount: number) => {
    const validation = validateAmount(selectedAmount)
    if (!validation.isValid) {
      toast({
        title: "Invalid Amount",
        description: validation.message,
        variant: "destructive",
      })
      return
    }
    onAmountChange(selectedAmount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)
    
    if (value === "") return
    
    const numValue = parseFloat(value)
    const validation = validateAmount(numValue)
    
    if (validation.isValid) {
      onAmountChange(numValue)
    }
  }

  const handleVerifyPayment = async () => {
    if (!utrNumber) {
      toast({
        title: "Error",
        description: "Please enter UTR number",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
          toast({
        title: "Success",
        description: "Payment verified successfully!",
      })
      
      // Reset states
      setUtrNumber("")
      onAmountChange(0)
    } catch (error) {
          toast({
        title: "Error",
        description: "Failed to verify payment",
            variant: "destructive",
          })
    } finally {
      setIsVerifying(false)
    }
  }

  const getUPILink = () => {
    return `upi://pay?pa=${upiId}&pn=Color%20Prediction&am=${amount}&cu=INR`
  }

  return (
    <div className="bg-[#1a1c2b] rounded-lg overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Recharge</h3>
          <p className="text-gray-400">Scan QR code or click to pay</p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[100, 500, 1000, 2000].map((value) => (
            <Button
              key={value}
              onClick={() => handleAmountSelect(value)}
              className={`w-full h-12 ${
                amount === value
                  ? "bg-[#6c5dd3] hover:bg-[#5a4dbf] text-white"
                  : "bg-[#12141f] hover:bg-[#2a2d3d] text-gray-300"
              } border border-[#2a2d3d]`}
            >
              ₹{value}
            </Button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="flex-1 bg-[#12141f] border-[#2a2d3d] text-white placeholder:text-gray-500"
          />
          <Button
            onClick={handleAmountSelect}
            className="bg-[#6c5dd3] hover:bg-[#5a4dbf] text-white"
          >
            Set
          </Button>
        </div>

        {/* QR Code */}
        {amount > 0 && (
          <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-lg">
            <QRCodeSVG
              value={getUPILink()}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="text-center">
              <p className="text-sm text-gray-600">Amount: ₹{amount}</p>
              <p className="text-sm text-gray-600">UPI ID: {upiId}</p>
            </div>
          </div>
        )}

        {/* Pay Button */}
        {amount > 0 && (
          <Button
            className="w-full bg-[#6c5dd3] hover:bg-[#5a4dbf] text-white h-12"
            onClick={() => window.location.href = getUPILink()}
          >
            Pay ₹{amount}
          </Button>
        )}

        {/* UPI ID Input */}
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter UTR Number"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            className="w-full bg-[#12141f] border-[#2a2d3d] text-white placeholder:text-gray-500"
          />
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            onClick={handleVerifyPayment}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Payment"}
          </Button>
        </div>
      </div>
    </div>
  )
} 