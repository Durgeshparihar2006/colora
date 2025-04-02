"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Gift, Trophy, Star, ArrowRight, Clock, Check } from "lucide-react"

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  cashValue: number;
  type: "cash" | "bonus" | "special";
}

interface RewardHistory {
  id: string;
  rewardId: string;
  date: string;
  pointsUsed: number;
  status: "Processing" | "Completed";
  reward: Reward;
}

export default function RewardsPage() {
  const { darkMode } = useTheme()
  const { toast } = useToast()
  const [points, setPoints] = useState(0)
  const [showRedeem, setShowRedeem] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([])

  const availableRewards: Reward[] = [
    {
      id: "1",
      title: "₹100 Cash",
      description: "Redeem your points for real cash",
      pointsCost: 1000,
      cashValue: 100,
      type: "cash"
    },
    {
      id: "2",
      title: "₹500 Cash",
      description: "Best value for your points",
      pointsCost: 4500,
      cashValue: 500,
      type: "cash"
    },
    {
      id: "3",
      title: "₹50 Bonus",
      description: "Instant game bonus",
      pointsCost: 400,
      cashValue: 50,
      type: "bonus"
    },
    {
      id: "4",
      title: "Weekend Special",
      description: "2x points on all games",
      pointsCost: 2000,
      cashValue: 200,
      type: "special"
    }
  ]

  useEffect(() => {
    // Load user points
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setPoints(user.points || 0)
    }

    // Load reward history
    const historyStr = localStorage.getItem("rewardHistory")
    if (historyStr) {
      setRewardHistory(JSON.parse(historyStr))
    }
  }, [])

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setShowRedeem(true)
  }

  const handleRedeem = () => {
    if (!selectedReward) return

    if (points < selectedReward.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough points to redeem this reward",
        variant: "destructive",
      })
      return
    }

    // Create reward history entry
    const rewardEntry: RewardHistory = {
      id: Math.random().toString(36).substring(2),
      rewardId: selectedReward.id,
      date: new Date().toISOString(),
      pointsUsed: selectedReward.pointsCost,
      status: "Processing",
      reward: selectedReward
    }

    // Update points
    const newPoints = points - selectedReward.pointsCost
    setPoints(newPoints)

    // Update user data
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      user.points = newPoints
      localStorage.setItem("user", JSON.stringify(user))
    }

    // Update reward history
    const updatedHistory = [rewardEntry, ...rewardHistory]
    setRewardHistory(updatedHistory)
    localStorage.setItem("rewardHistory", JSON.stringify(updatedHistory))

    // If bonus reward, add to wallet balance
    if (selectedReward.type === "bonus") {
      const currentBalance = Number(localStorage.getItem("walletBalance") || "0")
      localStorage.setItem("walletBalance", (currentBalance + selectedReward.cashValue).toString())
    }

    toast({
      title: "Success",
      description: "Reward redeemed successfully!",
    })

    setShowRedeem(false)
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "rgb(82,37,70)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Points Card */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-white">
                {points} Points
              </h2>
              <p className="text-white/70">
                Play more games to earn points
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Available Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableRewards.map((reward) => (
              <div
                key={reward.id}
                className="p-4 rounded-lg bg-red-900/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reward.type === "cash"
                      ? "bg-red-600"
                      : reward.type === "bonus"
                      ? "bg-red-600"
                      : "bg-red-600"
                  }`}>
                    {reward.type === "cash" ? (
                      <Gift className="w-5 h-5 text-white" />
                    ) : reward.type === "bonus" ? (
                      <Star className="w-5 h-5 text-white" />
                    ) : (
                      <Trophy className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {reward.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      {reward.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium mb-2 text-white/70">
                    {reward.pointsCost} Points
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRedeemClick(reward)}
                    disabled={points < reward.pointsCost}
                    className="border-red-700/30 hover:bg-red-800/30"
                    style={{ color: "#DD88CF" }}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Redemption History */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Redemption History</CardTitle>
          </CardHeader>
          <CardContent>
            {rewardHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70">No redemptions yet</p>
                <p className="text-sm text-white/50">
                  Redeem your points for exciting rewards
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewardHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-red-900/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        history.reward.type === "cash"
                          ? "bg-red-600"
                          : history.reward.type === "bonus"
                          ? "bg-red-600"
                          : "bg-red-600"
                      }`}>
                        {history.reward.type === "cash" ? (
                          <Gift className="w-5 h-5 text-white" />
                        ) : history.reward.type === "bonus" ? (
                          <Star className="w-5 h-5 text-white" />
                        ) : (
                          <Trophy className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {history.reward.title}
                        </h3>
                        <p className="text-sm text-white/70">
                          {new Date(history.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        history.status === "Completed" 
                          ? "text-green-400" 
                          : "text-white/70"
                      }`}>
                        {history.status}
                      </p>
                      <p className="text-sm text-white/70">
                        -{history.pointsUsed} Points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={showRedeem} onOpenChange={setShowRedeem}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Confirm Redemption
            </DialogTitle>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  selectedReward.type === "cash"
                    ? "bg-red-600"
                    : selectedReward.type === "bonus"
                    ? "bg-red-600"
                    : "bg-red-600"
                }`}>
                  {selectedReward.type === "cash" ? (
                    <Gift className="w-8 h-8 text-white" />
                  ) : selectedReward.type === "bonus" ? (
                    <Star className="w-8 h-8 text-white" />
                  ) : (
                    <Trophy className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedReward.title}
                  </h3>
                  <p className="text-white/70">
                    {selectedReward.description}
                  </p>
                </div>
                <div>
                  <p className="text-white/70">Points Required</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedReward.pointsCost}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRedeem(false)}
              className="flex-1 border-red-700/30 text-white hover:bg-red-800/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 