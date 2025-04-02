"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SettingsContent() {
  const [minBetAmount, setMinBetAmount] = useState("100")
  const [maxBetAmount, setMaxBetAmount] = useState("10000")
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState("500")
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState("50000")
  const [referralBonus, setReferralBonus] = useState("100")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would call the backend API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Save settings error:", error)
      toast({
        title: "Failed to Save Settings",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-bet">Minimum Bet Amount (₹)</Label>
              <Input
                id="min-bet"
                type="number"
                value={minBetAmount}
                onChange={(e) => setMinBetAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max-bet">Maximum Bet Amount (₹)</Label>
              <Input
                id="max-bet"
                type="number"
                value={maxBetAmount}
                onChange={(e) => setMaxBetAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-withdrawal">Minimum Withdrawal Amount (₹)</Label>
              <Input
                id="min-withdrawal"
                type="number"
                value={minWithdrawalAmount}
                onChange={(e) => setMinWithdrawalAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max-withdrawal">Maximum Withdrawal Amount (₹)</Label>
              <Input
                id="max-withdrawal"
                type="number"
                value={maxWithdrawalAmount}
                onChange={(e) => setMaxWithdrawalAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="referral-bonus">Referral Bonus Amount (₹)</Label>
            <Input
              id="referral-bonus"
              type="number"
              value={referralBonus}
              onChange={(e) => setReferralBonus(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
            <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When maintenance mode is enabled, users will not be able to access the application.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

