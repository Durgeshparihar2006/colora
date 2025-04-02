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
    // If file doesn't exist or is invalid, return empty object
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const txnRef = searchParams.get("txnRef")

    if (!txnRef) {
      return NextResponse.json({ 
        status: "error",
        message: "Transaction reference is required" 
      }, { status: 400 })
    }

    // Get transaction data
    const transactions = await getTransactionData()
    const transaction = transactions[txnRef]

    if (!transaction) {
      return NextResponse.json({ 
        status: "pending",
        message: "Transaction not found"
      })
    }

    // Check if transaction is already marked as success
    if (transaction.status === "success") {
      return NextResponse.json({
        status: "success",
        amount: transaction.amount,
        txnId: transaction.txnId,
        timestamp: transaction.completedAt
      })
    }

    // Check if transaction is already marked as failed
    if (transaction.status === "failed") {
      return NextResponse.json({
        status: "failed",
        message: "Payment failed or was cancelled"
      })
    }

    // For pending transactions, check if payment was received
    try {
      // Here you would typically check with your payment gateway
      // For demo, we'll check local transaction data
      const now = new Date()
      const createdAt = new Date(transaction.createdAt)
      const timeDiff = now.getTime() - createdAt.getTime()
      
      // If transaction is pending for more than 5 minutes, mark as failed
      if (timeDiff > 5 * 60 * 1000) {
        transaction.status = "failed"
        transaction.completedAt = now.toISOString()
        await saveTransactionData(transactions)
        
        return NextResponse.json({
          status: "failed",
          message: "Payment timeout"
        })
      }

      // Update last checked time
      transaction.lastChecked = now.toISOString()
      await saveTransactionData(transactions)

      return NextResponse.json({
        status: "pending",
        message: "Payment is being processed"
      })
    } catch (error) {
      console.error("Error checking payment status:", error)
      return NextResponse.json({
        status: "error",
        message: "Failed to check payment status"
      })
    }
  } catch (error) {
    console.error("Error in status check:", error)
    return NextResponse.json({ 
      status: "error",
      message: "Internal server error" 
    }, { status: 500 })
  }
} 