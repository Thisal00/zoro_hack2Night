'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/sidebar'

// Modern icons
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

const ChevronLeft = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

type Biller = {
  id: string
  name: string
  logo: string
}

const billers: Biller[] = [
  { id: 'water', name: 'Water Board', logo: '/billers/water-board.png' },
  { id: 'cable', name: 'Cable TV', logo: '/billers/cable-tv.png' },
  { id: 'ceb', name: 'CEB', logo: '/billers/ceb.png' },
  { id: 'airtel', name: 'Airtel', logo: '/billers/airtel.png' },
  { id: 'dialog', name: 'Dialog', logo: '/billers/dialog.png' },
  { id: 'slt', name: 'Sri Lanka Telecom', logo: '/billers/electricity.png' },
  { id: 'peotv', name: 'PEO TV', logo: '/billers/mpesa.png' },
  { id: 'hutch', name: 'Hutch', logo: '/billers/hutch.png' },
  { id: 'aia', name: 'AIA', logo: '/billers/aia.png' },
  { id: 'lolc', name: 'LOLC', logo: '/billers/lolc.png' },
  { id: 'insurance2', name: 'Insurance', logo: '/billers/insurance2.png' },
  { id: 'hsbc', name: 'HSBC', logo: '/billers/hsbc.png' }
]

type Screen = 'select' | 'form' | 'success' | 'failed'

type FormErrors = {
  accountNumber?: string
  billId?: string
  dueAmount?: string
}

export default function PayBillsPage() {
  const [screen, setScreen] = useState<Screen>('select')
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [billId, setBillId] = useState('')
  const [dueAmount, setDueAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [failReason, setFailReason] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [fromAccount, setFromAccount] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [accounts, setAccounts] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    async function loadAccount() {
      const userId = getCookie('user_id') || '1'
      try {
        const res = await fetch(`/api/accounts?userId=${userId}`)
        const data = await res.json()
        if (data.ok && data.accounts.length > 0) {
          setAccounts(data.accounts)
          setFromAccount(data.accounts[0].account_number)
          setCurrentBalance(Number(data.accounts[0].balance))
        }
      } catch (err) {
        console.error('Failed to fetch account', err)
      }
    }
    loadAccount()
  }, [])

  function handleFromAccountChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const accNumber = e.target.value
    setFromAccount(accNumber)
    const acc = accounts.find(a => a.account_number === accNumber)
    if (acc) {
      setCurrentBalance(Number(acc.balance))
    }
  }

  function handleSelectBiller(biller: Biller) {
    setSelectedBiller(biller)
    setErrors({})
    setScreen('form')
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^[0-9]{6,16}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = 'Enter a valid account number (6–16 digits)'
    }

    if (!billId.trim()) {
      newErrors.billId = 'Bill ID is required'
    } else if (billId.trim().length < 3) {
      newErrors.billId = 'Bill ID looks too short'
    }

    if (!dueAmount.trim()) {
      newErrors.dueAmount = 'Due amount is required'
    } else {
      const amount = Number(dueAmount)
      if (Number.isNaN(amount) || amount <= 0) {
        newErrors.dueAmount = 'Enter a valid amount greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePayNow() {
    if (!validateForm()) {
      return
    }

    const amount = Number(dueAmount)

    if (amount > currentBalance) {
      setFailReason(
        `Insufficient Balance\nCurrent Balance is: Rs.${currentBalance.toLocaleString()}`
      )
      setScreen('failed')
      return
    }

    setLoading(true)
    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount,
          toAccount: `${selectedBiller?.name} (${accountNumber})`, // Treating biller as an account
          amount,
          description: `Bill Payment - ${billId} ${remarks}`,
          userId: Number(userId)
        })
      })
      const data = await res.json()
      
      if (res.ok && data.ok) {
        setConfirmationNumber(data.transactionId || String(Math.floor(10000000 + Math.random() * 89999999)))
        setScreen('success')
        setCurrentBalance(prev => prev - amount)
      } else {
        setFailReason(data.message || 'Transaction failed on the server')
        setScreen('failed')
      }
    } catch (err) {
      setFailReason('Network error occurred')
      setScreen('failed')
    } finally {
      setLoading(false)
    }
  }

  function resetToHome() {
    setScreen('select')
    setSelectedBiller(null)
    setAccountNumber('')
    setBillId('')
    setDueAmount('')
    setRemarks('')
    setErrors({})
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pay Bills</h1>
            <p className="text-sm text-slate-500 mt-1">Select a merchant and settle your dues.</p>
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
                      <p className="text-sm font-medium text-slate-900">Bill Reminder</p>
                      <p className="text-xs text-slate-500 mt-1">Your CEB bill is due in 3 days.</p>
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

        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 size-64 rounded-full bg-orange-50 blur-[80px] pointer-events-none" />

            {screen === 'select' && (
              <div className="relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {billers.map((biller) => (
                    <button
                      key={biller.id}
                      onClick={() => handleSelectBiller(biller)}
                      className="group flex flex-col items-center gap-4 rounded-2xl bg-slate-50 border border-transparent p-6 transition-all hover:-translate-y-1 hover:bg-orange-50 hover:border-orange-100"
                    >
                      <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm p-2 transition-transform group-hover:scale-110 border border-slate-100 group-hover:border-orange-200">
                        <img
                          src={biller.logo}
                          alt={biller.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 text-center group-hover:text-[#e65a28] transition-colors">{biller.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {screen === 'form' && selectedBiller && (
              <div className="relative z-10 max-w-xl mx-auto">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8"
                  onClick={() => setScreen('select')}
                >
                  <ChevronLeft size={16} />
                  Back to billers
                </button>

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="flex size-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 p-2">
                    <img
                      src={selectedBiller.logo}
                      alt={selectedBiller.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedBiller.name}</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">From Account</label>
                    <select
                      value={fromAccount}
                      onChange={handleFromAccountChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28] rounded-xl px-4 py-3 text-slate-900 outline-none transition-all appearance-none cursor-pointer focus:ring-1"
                    >
                      {accounts.map(acc => (
                        <option key={acc.account_number} value={acc.account_number}>
                          {acc.account_name} ({acc.account_number}) - Rs. {Number(acc.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      className={`w-full bg-slate-50 border ${errors.accountNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                    />
                    {errors.accountNumber && <span className="text-xs text-red-500 mt-1">{errors.accountNumber}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bill ID</label>
                    <input
                      value={billId}
                      onChange={(e) => setBillId(e.target.value)}
                      placeholder="Enter bill ID"
                      className={`w-full bg-slate-50 border ${errors.billId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                    />
                    {errors.billId && <span className="text-xs text-red-500 mt-1">{errors.billId}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Amount (Rs.)</label>
                    <input
                      type="number"
                      value={dueAmount}
                      onChange={(e) => setDueAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full bg-slate-50 border ${errors.dueAmount ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                    />
                    {errors.dueAmount && <span className="text-xs text-red-500 mt-1">{errors.dueAmount}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks (Optional)</label>
                    <input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Additional notes"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28]"
                    />
                  </div>

                  <button 
                    className="w-full mt-6 rounded-xl bg-[#e65a28] px-8 py-4 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handlePayNow}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </div>
            )}

            {screen === 'success' && (
              <div className="relative z-10 text-center py-12">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.1)] border border-green-100">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful</h3>
                <p className="text-slate-500 mb-8">Ref: {confirmationNumber}</p>
                <button onClick={resetToHome} className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm">
                  Pay Another Bill
                </button>
              </div>
            )}

            {screen === 'failed' && (
              <div className="relative z-10 text-center py-12">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)] border border-red-100">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Payment Failed</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto whitespace-pre-line">{failReason}</p>
                <button onClick={resetToHome} className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm">
                  Return to Billers
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
