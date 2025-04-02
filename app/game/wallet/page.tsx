import type { Metadata } from "next"
import GameLayout from "@/components/game/game-layout"
import WalletContent from "@/components/wallet/wallet-content"

export const metadata: Metadata = {
  title: "Color Prediction - Wallet",
  description: "Manage your wallet",
}

export default function WalletPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#522546" }}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Wallet</h1>
        <WalletContent />
      </div>
    </div>
  )
}

