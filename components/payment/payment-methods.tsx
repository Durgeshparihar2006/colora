import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { ArrowLeft, PhoneCall } from "lucide-react"

interface PaymentMethodsProps {
  onClose: () => void
}

export default function PaymentMethods({ onClose }: PaymentMethodsProps) {
  const [amount, setAmount] = useState("")
  const [utrNumber, setUtrNumber] = useState("")
  const { toast } = useToast()
  const [step, setStep] = useState<'amount' | 'payment' | 'utr'>('amount')
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const UPI_DETAILS = {
    id: "1234567890@ybl",
    name: "Color Predict"
  }

  const handleProceedToPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }
    setStep('payment')
  }

  const handlePaymentMethodClick = (method: string) => {
    setSelectedMethod(method)

    // First set UTR step to show UTR input
    setStep('utr')

    // Then open payment app
    setTimeout(() => {
      switch (method) {
        case "upi":
          const upiUrl = `upi://pay?pa=${UPI_DETAILS.id}&pn=${UPI_DETAILS.name}&am=${amount}&cu=INR`
          window.location.href = upiUrl
          break
        
        case "phonepe":
          window.location.href = `phonepe://pay?pa=${UPI_DETAILS.id}&pn=${UPI_DETAILS.name}&am=${amount}&cu=INR`
          break
        
        case "card":
          window.location.href = `https://payment.colorpredict.com/card?amount=${amount}`
          break
        
        case "paytm":
          window.location.href = `paytmmp://pay?pa=${UPI_DETAILS.id}&pn=${UPI_DETAILS.name}&am=${amount}&cu=INR`
          break
      }
    }, 100) // Small delay to ensure UTR screen shows first
  }

  const handleUTRSubmit = () => {
    if (!utrNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter UTR number",
        variant: "destructive",
      })
      return
    }

    // Create payment request
    const paymentRequest = {
      amount: parseFloat(amount),
      utrNumber: utrNumber.trim(),
      timestamp: new Date().toISOString(),
      status: "pending"
    }

    // Store payment request
    const pendingPayments = JSON.parse(localStorage.getItem("pendingPayments") || "[]")
    localStorage.setItem("pendingPayments", JSON.stringify([...pendingPayments, paymentRequest]))

    toast({
      title: "Payment Submitted",
      description: "Your payment is under verification. Balance will be updated once confirmed.",
    })

    // Reset and close
    setAmount("")
    setUtrNumber("")
    onClose()
  }

  const goBack = () => {
    if (step === 'payment') setStep('amount')
    else if (step === 'utr') setStep('payment')
  }

  if (step === 'amount') {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Enter Amount</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount to Add</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleProceedToPayment}>
            Proceed to Payment
          </Button>
        </div>
      </Card>
    )
  }

  if (step === 'utr') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">Enter UTR Number</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="utr">UTR Number</Label>
            <Input
              id="utr"
              placeholder="Enter UTR number after payment"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleUTRSubmit}>
            Submit UTR
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Select Payment Method</h2>
      </div>
      <div className="grid gap-4">
        <Button 
          variant="outline" 
          className="justify-start gap-2" 
          onClick={() => handlePaymentMethodClick('phonepe')}
        >
          <img src="/phonepe.png" alt="PhonePe" className="h-5 w-5" />
          PhonePe
        </Button>
        <Button 
          variant="outline" 
          className="justify-start gap-2"
          onClick={() => handlePaymentMethodClick('card')}
        >
          <img src="/card.png" alt="Card" className="h-5 w-5" />
          Card Payment
        </Button>
        <Button 
          variant="outline" 
          className="justify-start gap-2"
          onClick={() => handlePaymentMethodClick('paytm')}
        >
          <img src="/paytm.png" alt="Paytm" className="h-5 w-5" />
          Paytm
        </Button>
        <Button 
          variant="outline" 
          className="justify-start gap-2"
          onClick={() => handlePaymentMethodClick('upi')}
        >
          <PhoneCall className="h-5 w-5" />
          Other UPI Apps
        </Button>
      </div>
    </Card>
  )
} 