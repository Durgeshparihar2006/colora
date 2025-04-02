"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Minimum Bet Amount
              </label>
              <Input 
                type="number" 
                defaultValue="10"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Maximum Bet Amount
              </label>
              <Input 
                type="number" 
                defaultValue="1000"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Game Duration (minutes)
              </label>
              <Input 
                type="number" 
                defaultValue="3"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button className="w-full">Save Game Settings</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                UPI ID
              </label>
              <Input 
                type="text" 
                defaultValue="payment@colorpredict"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Minimum Withdrawal
              </label>
              <Input 
                type="number" 
                defaultValue="100"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Maximum Withdrawal
              </label>
              <Input 
                type="number" 
                defaultValue="10000"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button className="w-full">Save Payment Settings</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Admin Username
              </label>
              <Input 
                type="text" 
                defaultValue="admin"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                New Password
              </label>
              <Input 
                type="password" 
                placeholder="Enter new password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Confirm Password
              </label>
              <Input 
                type="password" 
                placeholder="Confirm new password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button variant="destructive" className="w-full">Update Admin Credentials</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

