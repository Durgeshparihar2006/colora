"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Gift, Users, ArrowRight } from "lucide-react"

interface ReferralHistory {
  friendName: string;
  date: string;
  status: "Pending" | "Completed";
  reward: number;
}

export default function ReferPage() {
  const { darkMode } = useTheme()
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("")
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([])
  const [referralCount, setReferralCount] = useState(0)

  useEffect(() => {
    // Load user data and generate referral code
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      const code = user.referralCode || generateReferralCode(user.name)
      setReferralCode(code)

      // Save referral code if not exists
      if (!user.referralCode) {
        user.referralCode = code
        localStorage.setItem("user", JSON.stringify(user))
      }
    }

    // Load referral history
    const historyStr = localStorage.getItem("referralHistory")
    if (historyStr) {
      const history = JSON.parse(historyStr)
      setReferralHistory(history)
      setReferralCount(history.filter((ref: ReferralHistory) => ref.status === "Completed").length)
      setTotalEarnings(history.reduce((total: number, ref: ReferralHistory) => {
        return ref.status === "Completed" ? total + ref.reward : total
      }, 0))
    }
  }, [])

  const generateReferralCode = (name: string) => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "REF"
    return `${prefix}${Math.random().toString(36).substring(2, 7).toUpperCase()}`
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      toast({
        title: "Success",
        description: "Referral code copied to clipboard!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const shareText = `Join Color Prediction Game using my referral code: ${referralCode} and get ₹50 bonus! Download now: [App Link]`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Color Prediction Game Referral",
          text: shareText,
        })
        toast({
          title: "Success",
          description: "Shared successfully!",
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast({
            title: "Error",
            description: "Failed to share",
            variant: "destructive",
          })
        }
      }
    } else {
      handleCopyCode()
    }
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "rgb(82,37,70)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Referral Code Card */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Refer & Earn
            </CardTitle>
            <p className="mt-2 text-white/70">
              Share with friends and earn ₹100 for each referral
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Code Display */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-lg text-center">
              <p className="text-sm text-white/90 mb-2">Your Referral Code</p>
              <div className="flex items-center justify-center gap-3">
                <h3 className="text-3xl font-bold text-white">{referralCode}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="hover:bg-white/20 text-white"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <Button
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-12 text-lg"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share with Friends
            </Button>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg text-center bg-red-900/30">
                <Users className="w-6 h-6 mx-auto mb-2 text-white/70" />
                <p className="text-sm text-white/70">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{referralCount}</p>
              </div>
              <div className="p-4 rounded-lg text-center bg-red-900/30">
                <Gift className="w-6 h-6 mx-auto mb-2 text-white/70" />
                <p className="text-sm text-white/70">Total Earnings</p>
                <p className="text-2xl font-bold text-white">₹{totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">1</div>
              <div>
                <h4 className="font-semibold text-white">Share Your Code</h4>
                <p className="text-white/70">Share your unique referral code with friends</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h4 className="font-semibold text-white">Friend Joins</h4>
                <p className="text-white/70">Your friend signs up using your code</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">3</div>
              <div>
                <h4 className="font-semibold text-white">Both Earn</h4>
                <p className="text-white/70">You get ₹100 and your friend gets ₹50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referralHistory.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70">No referrals yet</p>
                <p className="text-sm text-white/50">Share your code to start earning</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referralHistory.map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-red-900/30"
                  >
                    <div className="flex items-center gap-4">
                      <Users className="text-white/70" />
                      <div>
                        <p className="font-medium text-white">
                          {referral.friendName}
                        </p>
                        <p className="text-sm text-white/70">
                          {new Date(referral.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        referral.status === "Completed" 
                          ? "text-green-400" 
                          : "text-white/70"
                      }`}>
                        {referral.status}
                      </p>
                      {referral.status === "Completed" && (
                        <p className="text-sm text-green-400">+₹{referral.reward}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 