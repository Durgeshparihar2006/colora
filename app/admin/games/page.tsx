"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-2">Current Game</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Period</span>
              <span>2303291001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Time Left</span>
              <span>02:30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Bets</span>
              <span>₹1,234</span>
            </div>
            <Button className="w-full">End Game</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-2">Game Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Min Bet</span>
              <span>₹10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Max Bet</span>
              <span>₹1,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Game Duration</span>
              <span>3 minutes</span>
            </div>
            <Button variant="outline" className="w-full">Update Settings</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 text-white">
          <h3 className="text-lg font-semibold mb-2">Game Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Games Today</span>
              <span>48</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Bets Today</span>
              <span>₹12,345</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Win Rate</span>
              <span>32%</span>
            </div>
            <Button variant="secondary" className="w-full">View Details</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

