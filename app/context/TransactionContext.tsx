"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface UserDetails {
  phone: string
  email: string
  walletBalance: number
}

interface Transaction {
  id: string
  userId: string
  userName: string
  amount: string
  type: 'deposit' | 'withdrawal'
  status: 'pending' | 'approved' | 'rejected'
  utrNumber?: string
  upiId?: string
  timestamp: string
  userDetails: UserDetails
}

interface TransactionContextType {
  transactions: Transaction[]
  isLoading: boolean
  updateTransactionStatus: (transactionId: string, status: string, userId: string) => Promise<void>
  getTodayStats: () => {
    addMoney: { total: number, success: number, failed: number, pending: number }
    withdrawals: { total: number, success: number, failed: number, pending: number }
  }
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data from localStorage
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const savedTransactions = localStorage.getItem('transactions')
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        } else {
          // Set some sample data if nothing exists
          const sampleTransactions: Transaction[] = [
            {
              id: '1',
              userId: 'USR001',
              userName: 'John Doe',
              amount: '500',
              type: 'deposit',
              status: 'pending',
              utrNumber: 'UTR123456',
              timestamp: new Date().toISOString(),
              userDetails: {
                phone: '+91 9876543210',
                email: 'john@example.com',
                walletBalance: 1000
              }
            },
            {
              id: '2',
              userId: 'USR002',
              userName: 'Jane Smith',
              amount: '1000',
              type: 'withdrawal',
              status: 'pending',
              upiId: 'jane@upi',
              timestamp: new Date().toISOString(),
              userDetails: {
                phone: '+91 9876543211',
                email: 'jane@example.com',
                walletBalance: 2000
              }
            }
          ]
          setTransactions(sampleTransactions)
          localStorage.setItem('transactions', JSON.stringify(sampleTransactions))
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading transactions:', error)
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const updateTransactionStatus = async (transactionId: string, status: string, userId: string) => {
    try {
      const updatedTransactions = transactions.map(t => {
        if (t.id === transactionId) {
          // Update wallet balance
          const newBalance = status === 'approved'
            ? (t.type === 'deposit' 
                ? t.userDetails.walletBalance + parseFloat(t.amount)
                : t.userDetails.walletBalance - parseFloat(t.amount))
            : t.userDetails.walletBalance

          return {
            ...t,
            status,
            userDetails: {
              ...t.userDetails,
              walletBalance: newBalance
            }
          }
        }
        return t
      })

      setTransactions(updatedTransactions)
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions))
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const getTodayStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp) >= today
    )

    const addMoneyStats = {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0
    }

    const withdrawalStats = {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0
    }

    todayTransactions.forEach(t => {
      const amount = parseFloat(t.amount)
      const stats = t.type === 'deposit' ? addMoneyStats : withdrawalStats
      stats.total += amount
      if (t.status === 'approved') stats.success += amount
      else if (t.status === 'rejected') stats.failed += amount
      else if (t.status === 'pending') stats.pending += amount
    })

    return { addMoney: addMoneyStats, withdrawals: withdrawalStats }
  }

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      isLoading, 
      updateTransactionStatus,
      getTodayStats 
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
} 