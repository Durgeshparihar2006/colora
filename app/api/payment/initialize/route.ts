import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to save transaction data
async function saveTransactionData(transactions: any) {
  const dataPath = path.join(process.cwd(), 'data', 'transactions.json')
  await fs.writeFile(dataPath, JSON.stringify(transactions, null, 2))
}

export async function POST(request: Request) {
  try {
    const { txnRef, amount, upiId, callbackUrl } = await request.json()

    if (!txnRef || !amount || !upiId) {
      return NextResponse.json({ 
        success: false,
        message: "Missing required fields" 
      }, { status: 400 })
    }

    // Save initial transaction data
    const dataPath = path.join(process.cwd(), 'data', 'transactions.json')
    let transactions = {}
    try {
      const data = await fs.readFile(dataPath, 'utf8')
      transactions = JSON.parse(data)
    } catch (error) {
      // If file doesn't exist, continue with empty object
    }

    // Create new transaction
    transactions[txnRef] = {
      status: 'pending',
      amount,
      upiId,
      callbackUrl,
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    }

    // Save transaction data
    await saveTransactionData(transactions)

    // In a real implementation, you would:
    // 1. Call your UPI payment gateway's API to initialize the payment
    // 2. Set up webhooks for automatic confirmation
    // 3. Store additional payment gateway details

    return NextResponse.json({ 
      success: true,
      message: "Payment initialized successfully",
      data: {
        txnRef,
        status: 'pending'
      }
    })
  } catch (error) {
    console.error("Error initializing payment:", error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to initialize payment" 
    }, { status: 500 })
  }
} 