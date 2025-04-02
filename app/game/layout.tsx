import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Color Prediction - Play",
  description: "Predict colors and win rewards",
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 