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
    
    // Update first user for demo (in real app, would use proper user identification)
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
    const status = searchParams.get("Status") // UPI apps typically send Status parameter
    const txnId = searchParams.get("txnId") // Transaction ID from UPI
    
    if (!txnRef) {
      return NextResponse.json({ 
        success: false,
        message: "Transaction reference is required" 
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

    // Update transaction status based on UPI callback
    const isSuccess = status === "SUCCESS" || status === "COMPLETED"
    transaction.status = isSuccess ? "success" : "failed"
    transaction.txnId = txnId
    transaction.completedAt = new Date().toISOString()

    // Save updated transaction
    await saveTransactionData(transactions)

    // If payment successful, update user balance
    if (isSuccess) {
      await updateUserBalance(transaction.amount)
    }

    // Redirect to a success/failure page
    const redirectUrl = isSuccess
      ? `/payment/success?amount=${transaction.amount}`
      : `/payment/failed?reason=payment-failed`

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("Error processing payment callback:", error)
    return NextResponse.redirect(new URL("/payment/failed?reason=server-error", request.url))
  }
} 