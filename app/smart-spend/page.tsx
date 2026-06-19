'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'

const Bell = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export default function SmartSpendPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ totalSpent: 0, budgetRemaining: 0, totalIncome: 0, transactions: [] as any[] })
  const [showNotifications, setShowNotifications] = useState(false)

  function getCookie(name: string) {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getCookie('user_id') || '1'
        const res = await fetch(`/api/smart-spend?userId=${userId}`)
        const resData = await res.json()
        if (resData.ok) {
          setData(resData)
        }
      } catch (err) {
        console.error('Failed to load smart spend data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Aggregate category spends
  const categorySpend: Record<string, number> = {}
  data.transactions.forEach(tx => {
    if (tx.isExpense) {
      categorySpend[tx.category] = (categorySpend[tx.category] || 0) + Number(tx.amount)
    }
  })

  const totalSpentCalculated = data.totalSpent || 1 // prevent div by zero
  const categories = Object.keys(categorySpend).map(cat => ({
    name: cat,
    amount: categorySpend[cat],
    percentage: Math.round((categorySpend[cat] / totalSpentCalculated) * 100),
    color: cat === 'Food & Dining' ? 'bg-orange-500' : 
           cat === 'Transport' ? 'bg-blue-500' : 
           cat === 'Bills & Utilities' ? 'bg-purple-500' : 'bg-green-500'
  })).sort((a, b) => b.amount - a.amount)

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Smart Spend</h1>
            <p className="text-sm text-slate-500 mt-1">Analyze and manage your expenses.</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-48 md:w-64 rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#e65a28] transition-colors">
                <SearchIcon size={16} />
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-[#e65a28]" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-slate-900">Budget Alert</p>
                      <p className="text-xs text-slate-500 mt-1">You've spent 50% of your transport budget.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button className="size-10 overflow-hidden rounded-full border-2 border-slate-200 hover:border-[#e65a28] transition-all shadow-sm">
              <img src="/person-logo.png" alt="profile" className="size-full object-cover" />
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-red-50 to-transparent" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Spent</h3>
              {loading ? <div className="h-10 w-32 bg-slate-100 rounded animate-pulse" /> : (
                <p className="text-3xl font-black text-slate-900">Rs. {data.totalSpent.toLocaleString()}</p>
              )}
            </div>
            
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-orange-50 to-transparent" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Budget Remaining</h3>
              {loading ? <div className="h-10 w-32 bg-slate-100 rounded animate-pulse" /> : (
                <p className="text-3xl font-black text-slate-900">Rs. {data.budgetRemaining.toLocaleString()}</p>
              )}
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#e65a28] rounded-full" style={{ width: `${Math.min(100, (data.totalSpent / (data.totalSpent + data.budgetRemaining)) * 100)}%` }} />
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-green-50 to-transparent" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Monthly Savings</h3>
              {loading ? <div className="h-10 w-32 bg-slate-100 rounded animate-pulse" /> : (
                <p className="text-3xl font-black text-slate-900">Rs. {Math.max(0, data.totalIncome - data.totalSpent).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spend by Category */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Spend by Category</h3>
              {loading ? <p className="text-slate-500 text-center py-4">Loading categories...</p> : categories.length === 0 ? <p className="text-slate-500 text-center py-4">No expenses found.</p> : (
                <div className="space-y-6">
                  {categories.map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <span className="font-bold text-slate-900">Rs. {cat.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-3 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-500 w-10 text-right">{cat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Spend List */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Spend</h3>
              {loading ? <p className="text-slate-500 text-center py-4">Loading transactions...</p> : data.transactions.filter(t => t.isExpense).length === 0 ? <p className="text-slate-500 text-center py-4">No recent spend.</p> : (
                <div className="space-y-4">
                  {data.transactions.filter(t => t.isExpense).map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{tx.description || 'Expense'}</p>
                          <p className="text-xs font-medium text-[#e65a28] mt-0.5">{tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">-Rs. {Math.abs(tx.amount).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
