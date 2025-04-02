import type { Metadata } from "next"
import GameLayout from "@/components/game/game-layout"
import ReferralsContent from "@/components/game/referrals-content"

export const metadata: Metadata = {
  title: "Color Prediction - Referrals",
  description: "View and manage your referrals",
}

export default function ReferralsPage() {
  return (
    <GameLayout>
      <ReferralsContent />
    </GameLayout>
  )
}