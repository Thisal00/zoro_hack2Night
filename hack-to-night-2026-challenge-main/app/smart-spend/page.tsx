'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/sidebar'
import { Bell, Search, Lightbulb, Banknote, Wallet, BuildingLibrary, AlertCircle, BarChart, Utensils, CreditCard, RefreshCw, FileText, ShoppingBag, Film, Package } from '@/components/Icons'

type Transaction = {
  id: string
  amount: number
  description: string
  type: 'credit' | 'debit'
  created_at: string
}

type CategoryData = {
  name: string
  amount: number
  color: string
  icon: React.ReactNode
  percent: number
}

const CATEGORY_RULES: { keyword: string; category: string; icon: React.ReactNode; color: string }[] = [
  { keyword: 'lunch', category: 'Food & Dining', icon: <Utensils size={14} />, color: '#f59e0b' },
  { keyword: 'food', category: 'Food & Dining', icon: <Utensils size={14} />, color: '#f59e0b' },
  { keyword: 'dinner', category: 'Food & Dining', icon: <Utensils size={14} />, color: '#f59e0b' },
  { keyword: 'keells', category: 'Food & Dining', icon: <Utensils size={14} />, color: '#f59e0b' },
  { keyword: 'cargills', category: 'Food & Dining', icon: <Utensils size={14} />, color: '#f59e0b' },
  { keyword: 'fee', category: 'Fees & Charges', icon: <CreditCard size={14} />, color: '#ef4444' },
  { keyword: 'refund', category: 'Income', icon: <Wallet size={14} />, color: '#22c55e' },
  { keyword: 'transfer', category: 'Transfers', icon: <RefreshCw size={14} />, color: '#6366f1' },
  { keyword: 'bill', category: 'Bills', icon: <FileText size={14} />, color: '#8b5cf6' },
  { keyword: 'ceb', category: 'Bills', icon: <FileText size={14} />, color: '#8b5cf6' },
  { keyword: 'dialog', category: 'Bills', icon: <FileText size={14} />, color: '#8b5cf6' },
  { keyword: 'salary', category: 'Income', icon: <Wallet size={14} />, color: '#22c55e' },
  { keyword: 'shopping', category: 'Shopping', icon: <ShoppingBag size={14} />, color: '#ec4899' },
  { keyword: 'daraz', category: 'Shopping', icon: <ShoppingBag size={14} />, color: '#ec4899' },
  { keyword: 'netflix', category: 'Entertainment', icon: <Film size={14} />, color: '#06b6d4' },
  { keyword: 'spotify', category: 'Entertainment', icon: <Film size={14} />, color: '#06b6d4' },
]

function categorize(description: string): { category: string; icon: React.ReactNode; color: string } {
  const lower = (description || '').toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (lower.includes(rule.keyword)) {
      return { category: rule.category, icon: rule.icon, color: rule.color }
    }
  }
  return { category: 'Other', icon: <Package size={14} />, color: '#64748b' }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SmartSpendPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [budgetLimit, setBudgetLimit] = useState(150000)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('150000')

  // Add Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDesc, setExpenseDesc] = useState('')

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?account=1000003423')
      const data = await res.json()
      if (data.ok && data.transactions) {
        const mapped: Transaction[] = data.transactions.map((row: any) => ({
          id: String(row.id),
          amount: Number(row.amount),
          description: row.description || 'Unknown Transaction',
          type: row.from_account === '1000003423' ? 'debit' : 'credit',
          created_at: row.created_at
        }))
        setTransactions(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch transactions from DB', err)
    }
  }

  useEffect(() => {
    fetchTransactions()

    // Load Budget
    const savedBudget = localStorage.getItem('nova_budget')
    if (savedBudget) {
      setBudgetLimit(Number(savedBudget))
      setBudgetInput(savedBudget)
    }
  }, [])

  // Filter to selected month
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === selectedMonth
  })

  const outgoing = monthTransactions.filter((t) => t.type === 'debit')
  const incoming = monthTransactions.filter((t) => t.type === 'credit')

  const totalSpent = outgoing.reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome = incoming.reduce((s, t) => s + Number(t.amount), 0)
  const savings = totalIncome - totalSpent
  const budgetUsed = Math.min((totalSpent / budgetLimit) * 100, 100)

  // Category breakdown
  const categoryMap: Record<string, { amount: number; color: string; icon: React.ReactNode }> = {}
  for (const t of outgoing) {
    const { category, icon, color } = categorize(t.description)
    if (!categoryMap[category]) categoryMap[category] = { amount: 0, color, icon }
    categoryMap[category].amount += Number(t.amount)
  }

  const categories: CategoryData[] = Object.entries(categoryMap)
    .map(([name, { amount, color, icon }]) => ({
      name,
      amount,
      color,
      icon,
      percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  // Monthly spending for mini bar chart (last 6 months)
  const monthlySpending = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (new Date().getMonth() - 5 + i + 12) % 12
    const total = transactions
      .filter((t) => {
        const d = new Date(t.created_at)
        return t.type === 'debit' && d.getMonth() === monthIndex
      })
      .reduce((s, t) => s + Number(t.amount), 0)
    return { month: MONTHS[monthIndex], total, monthIndex }
  })

  const maxMonthly = Math.max(...monthlySpending.map((m) => m.total), 1)

  function handleBudgetSave() {
    const val = Number(budgetInput)
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val)
      localStorage.setItem('nova_budget', val.toString())
    }
    setEditingBudget(false)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(expenseAmount)
    if (amount <= 0 || !expenseDesc) return

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: '1000003423',
          toAccount: '9999999999', // Send to admin vault to simulate expense
          amount,
          description: expenseDesc,
          userId: 1
        })
      })

      const data = await res.json()
      if (data.ok) {
        setIsExpenseModalOpen(false)
        setExpenseAmount('')
        setExpenseDesc('')
        fetchTransactions() // Refresh data!
      }
    } catch (err) {
      console.error('Failed to add expense', err)
    }
  }

  // Donut chart segments (simple SVG)
  function buildDonut() {
    if (categories.length === 0) return null
    const r = 70
    const cx = 90
    const cy = 90
    const circumference = 2 * Math.PI * r
    let offset = 0
    return categories.map((cat, i) => {
      const dash = (cat.percent / 100) * circumference
      const gap = circumference - dash
      const segment = (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={cat.color}
          strokeWidth="28"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={-offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 1s ease' }}
        />
      )
      offset += dash
      return segment
    })
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
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 relative z-10 h-screen overflow-y-auto custom-scrollbar scroll-smooth">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10 relative">
          <div>
            <h1 className="text-3xl font-bold !text-white mb-2 tracking-tight flex items-center gap-2">Smart Spend <Lightbulb size={24} className="text-yellow-400" /></h1>
            <p className="text-[#8a8a8a] text-sm">Analyze your spending habits and manage your budget.</p>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-gradient-to-r from-[#ff5a1f] to-[#e0450e] hover:from-[#e0450e] hover:to-[#c23b0c] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full shadow-lg shadow-[#ff5a1f]/20 transition-all transform hover:-translate-y-0.5"
            >
              + Add Expense
            </button>
            <button className="text-[#8a8a8a] hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button className="text-[#8a8a8a] hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff5a1f] rounded-full border-2 border-[#111]"></span>
            </button>
            <button className="w-10 h-10 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-[#ff5a1f] transition-colors focus:outline-none">
              <img src="https://i.pravatar.cc/150?u=dilara" alt="profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Month Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(i)}
              className={"px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all " + (selectedMonth === i ? "bg-[#ff5a1f] text-white shadow-[0_0_15px_rgba(255,90,31,0.4)]" : "bg-white/5 text-[#8a8a8a] hover:bg-white/10 hover:text-white")}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#17171a] rounded-3xl p-6 border border-white/5 relative overflow-hidden group flex flex-col justify-between h-36">
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-red-400/80 mb-2 bg-red-500/10 w-fit p-2 rounded-xl"><Banknote size={20} /></div>
            <div>
              <div className="text-[#8a8a8a] text-xs font-bold uppercase tracking-wider mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-red-400 font-mono tracking-tight">Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          <div className="bg-[#17171a] rounded-3xl p-6 border border-white/5 relative overflow-hidden group flex flex-col justify-between h-36">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-green-400/80 mb-2 bg-green-500/10 w-fit p-2 rounded-xl"><Wallet size={20} /></div>
            <div>
              <div className="text-[#8a8a8a] text-xs font-bold uppercase tracking-wider mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-400 font-mono tracking-tight">Rs. {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="bg-[#17171a] rounded-3xl p-6 border border-white/5 relative overflow-hidden group flex flex-col justify-between h-36">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className={"mb-2 w-fit p-2 rounded-xl " + (savings >= 0 ? "text-indigo-400/80 bg-indigo-500/10" : "text-red-400/80 bg-red-500/10")}>
              {savings >= 0 ? <BuildingLibrary size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <div className="text-[#8a8a8a] text-xs font-bold uppercase tracking-wider mb-1">Net Savings</div>
              <div className={"text-2xl font-bold font-mono tracking-tight " + (savings >= 0 ? "text-indigo-400" : "text-red-400")}>Rs. {savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="bg-[#17171a] rounded-3xl p-6 border border-white/5 relative overflow-hidden group flex flex-col justify-between h-36">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-yellow-400/80 mb-2 bg-yellow-500/10 w-fit p-2 rounded-xl"><BarChart size={20} /></div>
            <div>
              <div className="text-[#8a8a8a] text-xs font-bold uppercase tracking-wider mb-1">Transactions</div>
              <div className="text-2xl font-bold text-yellow-400 font-mono tracking-tight">{monthTransactions.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Budget Tracker */}
          <div className="bg-[#17171a] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg !text-white">Monthly Budget</h3>
              <button
                onClick={() => { setEditingBudget(true); setBudgetInput(String(budgetLimit)) }}
                className="text-xs text-[#ff5a1f] font-bold uppercase tracking-wider hover:text-white transition-colors"
              >
                ✏️ Edit Limit
              </button>
            </div>

            {editingBudget ? (
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="flex-1 bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f]"
                />
                <button
                  onClick={handleBudgetSave}
                  className="px-6 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all"
                >
                  Save
                </button>
              </div>
            ) : null}

            <div className="text-sm text-[#8a8a8a] mb-3 flex justify-between font-mono">
              <span className="text-white">Rs. {totalSpent.toLocaleString('en-US')}</span>
              <span>Rs. {budgetLimit.toLocaleString('en-US')}</span>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/5 rounded-full h-3 mb-3 overflow-hidden">
              <div 
                className={"h-full rounded-full transition-all duration-1000 " + (budgetUsed > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" : budgetUsed > 60 ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]" : "bg-[#ff5a1f] shadow-[0_0_10px_rgba(255,90,31,0.6)]")}
                style={{ width: `${budgetUsed}%` }}
              ></div>
            </div>
            
            <div className={"text-xs font-bold " + (budgetUsed > 80 ? "text-red-400" : "text-[#8a8a8a]")}>
              {budgetUsed.toFixed(1)}% used {budgetUsed >= 100 ? '⚠️ Over budget!' : ''}
            </div>

            {/* Mini Bar Chart */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="text-xs text-[#8a8a8a] font-bold uppercase tracking-wider mb-6">6-Month Trend</div>
              <div className="flex items-end gap-3 h-24">
                {monthlySpending.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className={"w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 " + (m.monthIndex === selectedMonth ? "bg-[#ff5a1f]" : "bg-white/10")}
                      style={{ height: `${(m.total / maxMonthly) * 100}%` }}
                    ></div>
                    <span className={"text-[10px] font-bold " + (m.monthIndex === selectedMonth ? "text-[#ff5a1f]" : "text-[#666]")}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-[#17171a] rounded-3xl p-8 border border-white/5 shadow-2xl">
            <h3 className="font-bold text-lg !text-white mb-6">Spending by Category</h3>

            {categories.length === 0 ? (
              <div className="text-center text-[#8a8a8a] py-16">
                No spending data for {MONTHS[selectedMonth]}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Donut */}
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 180 180">
                    {buildDonut()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[#8a8a8a] font-bold text-xs">Total</span>
                    <span className="text-white font-mono font-bold text-xl">Rs. {totalSpent > 1000 ? (totalSpent/1000).toFixed(1) + 'k' : totalSpent}</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 w-full space-y-4">
                  {categories.slice(0, 5).map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm shadow-sm" style={{ background: cat.color }}></div>
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
                      </span>
                      <span className="ml-auto text-xs font-bold text-[#8a8a8a]">{cat.percent}%</span>
                    </div>
                  ))}
                  {categories.length > 5 && (
                    <div className="text-xs text-[#666] font-medium pt-2 border-t border-white/5 text-center">
                      + {categories.length - 5} more categories
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#17171a] rounded-3xl p-8 border border-white/5 shadow-2xl mb-8">
          <h3 className="font-bold text-lg !text-white mb-6">Transaction History — {MONTHS[selectedMonth]}</h3>

          {monthTransactions.length === 0 ? (
            <div className="text-center py-12 text-[#8a8a8a]">
              No transactions found for {MONTHS[selectedMonth]}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[#8a8a8a] text-xs uppercase tracking-wider">
                    <th className="pb-4 font-bold">Date</th>
                    <th className="pb-4 font-bold">Description</th>
                    <th className="pb-4 font-bold">Category</th>
                    <th className="pb-4 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {monthTransactions
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((t) => {
                      const { category, icon, color } = categorize(t.description)
                      const isDebit = t.type === 'debit'
                      return (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-4 text-[#8a8a8a] whitespace-nowrap">
                            {formatDate(t.created_at)}
                          </td>
                          <td className="py-4 text-white font-medium">
                            {t.description}
                          </td>
                          <td className="py-4">
                            <span 
                              className="px-3 py-1.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5"
                              style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                            >
                              {icon} {category}
                            </span>
                          </td>
                          <td className={"py-4 text-right font-mono font-bold whitespace-nowrap " + (isDebit ? "text-white" : "text-green-400")}>
                            {isDebit ? '-' : '+'}Rs. {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
      
      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#17171a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute top-4 right-4 text-[#8a8a8a] hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#ff5a1f]" /> Simulate Card Swipe
            </h2>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-2 block">Merchant / Description</label>
                <input 
                  type="text" 
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Keells Supermarket"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors"
                  required
                />
                <p className="text-[10px] text-[#8a8a8a] mt-1">Hint: Use keywords like 'food', 'netflix', 'daraz', 'ceb', 'keells'</p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-2 block">Amount (Rs.)</label>
                <input 
                  type="number" 
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5a1f]/50 transition-colors"
                  required
                  min="1"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-[#ff5a1f] to-[#e0450e] hover:from-[#e0450e] hover:to-[#c23b0c] text-white font-bold text-sm tracking-wider py-3.5 rounded-xl shadow-lg shadow-[#ff5a1f]/20 transition-all transform hover:-translate-y-0.5 uppercase"
              >
                Complete Purchase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
