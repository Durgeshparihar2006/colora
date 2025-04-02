import { NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to get transaction data
async function getTransactionData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'transactions.json')
    const data = await fs.readFile(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
}

// Helper function to save transaction data
async function saveTransactionData(transactions: any) {
  const dataPath = path.join(process.cwd(), 'data', 'transactions.json')
  await fs.writeFile(dataPath, JSON.stringify(transactions, null, 2))
}

// Helper function to update user balance
async function updateUserBalance(amount: number) {
  try {
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const usersData = await fs.readFile(usersPath, 'utf8')
    const users = JSON.parse(usersData)
    
    // Update first user for demo
    const user = users[0]
    if (user) {
      user.balance = (user.balance || 0) + amount
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2))
    }
  } catch (error) {
    console.error("Error updating user balance:", error)
  }
}

export async function POST(request: Request) {
  try {
    const { txnRef, amount } = await request.json()

    if (!txnRef || !amount) {
      return NextResponse.json({ 
        success: false,
        message: "Missing required fields" 
      }, { status: 400 })
    }

    // Get transaction data
    const transactions = await getTransactionData()
    const transaction = transactions[txnRef]

    if (!transaction) {
      return NextResponse.json({ 
        success: false,
        message: "Transaction not found" 
      }, { status: 404 })
    }

    if (transaction.status === "success") {
      return NextResponse.json({ 
        success: true,
        message: "Payment already verified" 
      })
    }

    // Verify amount matches
    if (transaction.amount !== amount) {
      return NextResponse.json({ 
        success: false,
        message: "Amount mismatch" 
      })
    }

    // Update transaction status
    transaction.status = "success"
    transaction.completedAt = new Date().toISOString()
    await saveTransactionData(transactions)

    // Update user's wallet balance
    await updateUserBalance(amount)

    return NextResponse.json({ 
      success: true,
      message: "Payment verified successfully" 
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to verify payment" 
    }, { status: 500 })
  }
} 