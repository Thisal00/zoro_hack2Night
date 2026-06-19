'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/sidebar'
import { Bell, Search } from '@/components/Icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Transaction = {
  id: string
  amount: number
  description: string
  type: 'credit' | 'debit'
  created_at: string
}

export default function EStatementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Fetch real data from PostgreSQL APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Balance
        const accRes = await fetch('/api/accounts')
        const accData = await accRes.json()
        if (accData.ok && accData.accounts) {
          const mainAcc = accData.accounts.find((a: any) => a.account_number === '1000003423')
          if (mainAcc) setBalance(Number(mainAcc.balance))
        }

        // Fetch Transactions
        const txRes = await fetch('/api/transactions?account=1000003423')
        const txData = await txRes.json()
        if (txData.ok && txData.transactions) {
          const mapped: Transaction[] = txData.transactions.map((row: any) => ({
            id: String(row.id),
            amount: Number(row.amount),
            description: row.description || 'Unknown',
            type: row.from_account === '1000003423' ? 'debit' : 'credit',
            created_at: row.created_at
          }))
          setTransactions(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch statement data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate Running Balance
  const calculateRunningBalances = () => {
    let currentBalance = balance
    const runningTx = [...transactions]
    
    // Transactions are usually ordered by newest first. 
    // So to calculate running balance, we go from newest to oldest.
    for (let i = 0; i < runningTx.length; i++) {
      const tx = runningTx[i]
      // @ts-ignore
      tx.runningBalance = currentBalance
      
      // Revert the transaction to get the balance BEFORE this transaction
      if (tx.type === 'credit') {
        currentBalance -= tx.amount
      } else {
        currentBalance += tx.amount
      }
    }
    return runningTx
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    const txWithBalance = calculateRunningBalances()

    doc.setFontSize(22)
    doc.setTextColor(255, 90, 31) // Nova Orange
    doc.text("NovaBank", 14, 20)
    
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("E-Statement", 14, 30)

    doc.setFontSize(10)
    doc.text(`Account: 1000003423 (Dilara Savings)`, 14, 40)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45)
    doc.text(`Current Balance: Rs. ${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 14, 50)

    // @ts-ignore
    autoTable(doc, {
      startY: 55,
      headStyles: { fillColor: [255, 90, 31] },
      head: [['Date', 'Description', 'Ref ID', 'Debit (-)', 'Credit (+)', 'Balance']],
      body: txWithBalance.map((tx: any) => [
        new Date(tx.created_at).toLocaleDateString(),
        tx.description,
        `TRX-${tx.id}`,
        tx.type === 'debit' ? `Rs. ${tx.amount.toLocaleString()}` : '-',
        tx.type === 'credit' ? `Rs. ${tx.amount.toLocaleString()}` : '-',
        `Rs. ${tx.runningBalance.toLocaleString()}`
      ])
    })

    doc.save(`NovaBank_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleDownloadCSV = () => {
    const txWithBalance = calculateRunningBalances()
    const headers = ["Date", "Description", "Ref ID", "Debit", "Credit", "Balance"]
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"

    txWithBalance.forEach((tx: any) => {
      const debit = tx.type === 'debit' ? tx.amount : ''
      const credit = tx.type === 'credit' ? tx.amount : ''
      const row = [
        new Date(tx.created_at).toLocaleDateString(),
        `"${tx.description}"`, // Quote to handle commas in description
        `TRX-${tx.id}`,
        debit,
        credit,
        tx.runningBalance
      ]
      csvContent += row.join(",") + "\n"
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `NovaBank_Statement_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f0f11] font-sans selection:bg-[#ff5a1f] selection:text-white relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
      <div className="fixed inset-0 z-0 bg-black/85 backdrop-blur-[2px]"></div>

      {/* Sidebar */}
      <div className="relative z-10 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-y-auto hide-scrollbar h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-[#0f0f11]/80 backdrop-blur-md z-40 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white tracking-wide">E-Statement</h2>
          <div className="flex items-center gap-5">
            <button className="text-[#8a8a8a] hover:text-white transition-colors">
              <Search size={22} />
            </button>
            <button className="text-[#8a8a8a] hover:text-white transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff5a1f] rounded-full border-2 border-[#0f0f11]"></span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 ml-2">
              <Image src="/avatar.png" alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-[24px]">
            <div className="space-y-1">
              <h3 className="text-white font-bold text-lg">Account: Dilara Savings</h3>
              <p className="text-[#8a8a8a] text-sm font-mono">1000003423</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-[#ff5a1f] to-[#e0450e] hover:from-[#e0450e] hover:to-[#c23b0c] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-lg shadow-[#ff5a1f]/20 transition-all transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                Download PDF
              </button>
              
              <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 bg-[#217346] hover:bg-[#1a5c38] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-lg shadow-[#217346]/20 transition-all transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="17"></line><line x1="16" y1="13" x2="8" y2="17"></line></svg>
                Download Excel (CSV)
              </button>
            </div>
          </div>

          {/* Statement Table */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 font-bold text-xs text-[#8a8a8a] uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 font-bold text-xs text-[#8a8a8a] uppercase tracking-wider">Description</th>
                    <th className="py-4 px-6 font-bold text-xs text-[#8a8a8a] uppercase tracking-wider">Ref ID</th>
                    <th className="py-4 px-6 font-bold text-xs text-[#8a8a8a] uppercase tracking-wider text-right">Debit (-)</th>
                    <th className="py-4 px-6 font-bold text-xs text-[#8a8a8a] uppercase tracking-wider text-right">Credit (+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8a8a8a]">Loading statement data...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8a8a8a]">No transactions found.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-6 text-sm text-[#8a8a8a] whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 text-sm text-white font-medium">
                          {tx.description}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#8a8a8a] font-mono">
                          TRX-{tx.id.padStart(6, '0')}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-right">
                          {tx.type === 'debit' ? (
                            <span className="text-white">Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          ) : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-right">
                          {tx.type === 'credit' ? (
                            <span className="text-emerald-400">Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer Summary */}
            {!loading && (
              <div className="border-t border-white/10 bg-black/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-[#8a8a8a] text-sm">
                  Showing {transactions.length} transactions
                </div>
                <div className="flex items-center gap-4 bg-white/5 rounded-xl px-5 py-3 border border-white/5">
                  <span className="text-[#8a8a8a] text-sm font-bold uppercase tracking-wider">Closing Balance</span>
                  <span className="text-2xl font-bold text-white tracking-wide">
                    Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
