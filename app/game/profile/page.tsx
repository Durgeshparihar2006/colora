import type { Metadata } from "next"
import GameLayout from "@/components/game/game-layout"
import ProfileContent from "@/components/game/profile-content"

export const metadata: Metadata = {
  title: "Color Prediction - Profile",
  description: "Manage your profile settings",
}

export default function ProfilePage() {
  return (
    <GameLayout>
      <ProfileContent />
    </GameLayout>
  )
}