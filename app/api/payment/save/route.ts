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
    const { txnRef, status, amount, txnId } = await request.json()

    if (!txnRef || !status || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Read existing transactions
    const dataPath = path.join(process.cwd(), 'data', 'transactions.json')
    let transactions = {}
    try {
      const data = await fs.readFile(dataPath, 'utf8')
      transactions = JSON.parse(data)
    } catch (error) {
      // If file doesn't exist or is invalid, continue with empty object
    }

    // Update transaction
    transactions[txnRef] = {
      status,
      amount,
      txnId,
      timestamp: new Date().toISOString()
    }

    // Save updated transactions
    await saveTransactionData(transactions)

    return NextResponse.json({ 
      success: true,
      message: "Transaction saved successfully"
    })
  } catch (error) {
    console.error("Error saving transaction:", error)
    return NextResponse.json({ 
      error: "Failed to save transaction"
    }, { status: 500 })
  }
} 