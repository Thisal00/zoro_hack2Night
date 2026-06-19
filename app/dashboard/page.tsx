'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/navigation'

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

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalBalance: 0, transactions: [] as any[] })
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = getCookie('user_id') || '1'
        const res = await fetch(`/api/dashboard/stats?userId=${userId}`)
        const data = await res.json()
        if (data.ok) {
          setStats({ totalBalance: data.totalBalance, transactions: data.transactions })
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, here's your overview.</p>
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
                      <p className="text-sm font-medium text-slate-900">New Login Alert</p>
                      <p className="text-xs text-slate-500 mt-1">Unrecognized device just logged in.</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100 text-center">
                    <button className="text-xs font-semibold text-[#e65a28]">Mark all as read</button>
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
          {/* Top Banner / Total Balance */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-50 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Balance</h2>
              {loading ? (
                <p className="text-4xl font-bold text-slate-300">Loading...</p>
              ) : (
                <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Rs. {stats.totalBalance.toLocaleString()}
                  <span className="text-lg text-slate-400 font-medium ml-2">.00</span>
                </p>
              )}
              
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={() => router.push('/bank-transfer')} className="rounded-xl bg-[#e65a28] px-6 py-3 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30">
                  Transfer Money
                </button>
                <button onClick={() => router.push('/pay-bills')} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
                  Pay Bills
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/bank-accounts')} className="group flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-orange-50 hover:shadow-sm border border-transparent hover:border-orange-100">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm group-hover:text-[#e65a28] group-hover:scale-110 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-[#e65a28] transition-colors">Accounts</span>
                </button>
                <button onClick={() => router.push('/smart-spend')} className="group flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-orange-50 hover:shadow-sm border border-transparent hover:border-orange-100">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm group-hover:text-[#e65a28] group-hover:scale-110 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-[#e65a28] transition-colors">Smart Spend</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
                <button className="text-sm font-semibold text-[#e65a28] hover:text-orange-600 transition-colors">View All</button>
              </div>

              {loading ? (
                <p className="text-slate-500 py-4 text-center">Loading transactions...</p>
              ) : stats.transactions.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">No recent transactions found.</p>
              ) : (
                <div className="space-y-2">
                  {stats.transactions.map((tx, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-[#e65a28]">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{tx.description || 'Transfer'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amount < 0 ? 'text-slate-900' : 'text-green-600'}`}>
                          {tx.amount < 0 ? '-' : '+'}Rs. {Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{tx.status}</p>
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
