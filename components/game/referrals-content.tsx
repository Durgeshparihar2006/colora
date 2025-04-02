"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Share2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Referral {
  name: string
  joinDate: string
  commission: number
}

export default function ReferralsContent() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      const code = user.referralCode || `USER${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setReferralCode(code)
      setReferralLink(`${window.location.origin}/signup?ref=${code}`)

      // Save referral code if not exists
      if (!user.referralCode) {
        user.referralCode = code
        localStorage.setItem("user", JSON.stringify(user))
      }
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "कॉपी किया गया",
      description: "रेफरल लिंक क्लिपबोर्ड पर कॉपी कर दिया गया है",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">मेरे रेफरल</h1>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">रेफरल कोड</h2>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">रेफरल लिंक</h2>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button className="w-full" onClick={() => copyToClipboard(referralLink)}>
          <Share2 className="mr-2 h-4 w-4" />
          शेयर करें
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">मेरे रेफरल</h2>
        <div className="space-y-4">
          {referrals?.length > 0 ? (
            <div className="grid gap-4">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <p className="text-sm text-gray-500">{referral.joinDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{referral.commission}</p>
                    <p className="text-xs text-gray-500">कमीशन</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              अभी तक कोई रेफरल नहीं
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}