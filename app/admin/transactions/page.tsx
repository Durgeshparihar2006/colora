"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTransactions } from '@/app/context/TransactionContext'

export default function TransactionsPage() {
  const { transactions, getTodayStats } = useTransactions()
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = getTodayStats()

  const filteredTransactions = transactions
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => 
      searchQuery === '' || 
      (t.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.upiId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Transaction History</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <h3 className="text-sm font-medium text-gray-300">Today's Add Money</h3>
          <p className="text-2xl font-bold mt-2 text-green-400">₹{stats.addMoney.total.toLocaleString()}</p>
          <div className="flex flex-col sm:flex-row justify-between mt-4 text-sm gap-4">
            <div>
              <p className="text-gray-400">Successful</p>
              <p className="font-medium text-green-400">₹{stats.addMoney.success.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Failed</p>
              <p className="font-medium text-red-400">₹{stats.addMoney.failed.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white">
          <h3 className="text-sm font-medium text-gray-300">Today's Withdrawals</h3>
          <p className="text-2xl font-bold mt-2 text-blue-400">₹{stats.withdrawals.total.toLocaleString()}</p>
          <div className="flex flex-col sm:flex-row justify-between mt-4 text-sm gap-4">
            <div>
              <p className="text-gray-400">Successful</p>
              <p className="font-medium text-green-400">₹{stats.withdrawals.success.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Failed</p>
              <p className="font-medium text-red-400">₹{stats.withdrawals.failed.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold">All Transactions</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select 
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="deposit">Add Money</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
              <select 
                className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <Input 
                placeholder="Search by ID, UTR/UPI, or user..." 
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-300 uppercase text-xs bg-gray-800/50">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-xs">{transaction.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{transaction.userId}</div>
                      <div className="text-gray-400 text-xs">{transaction.userName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50' 
                        : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50'
                    }`}>
                      {transaction.type === 'deposit' ? 'Add Money' : 'Withdrawal'}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{parseFloat(transaction.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">
                    {transaction.type === 'deposit' ? transaction.utrNumber : transaction.upiId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === 'pending' 
                        ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50' 
                        : transaction.status === 'approved' 
                        ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50'
                        : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50'
                    }`}>
                      {transaction.status === 'approved' ? 'Approved' :
                       transaction.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-gray-700 text-gray-300 border-gray-600"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

