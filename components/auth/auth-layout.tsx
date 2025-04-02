import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#522546] to-[#3a1b32] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Color Prediction</h1>
          <p className="text-gray-300 mt-2">Predict colors and win rewards</p>
        </div>
        {children}
      </div>
    </div>
  )
}

