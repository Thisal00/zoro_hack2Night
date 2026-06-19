'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { Search, Bell, ChevronLeft } from '@/components/Icons'

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
  payFrom?: string
  accountNumber?: string
  billId?: string
  dueAmount?: string
}

export default function PayBillsPage() {
  const router = useRouter()

  // State
  const [screen, setScreen] = useState<Screen>('select')
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null)
  
  const [balance, setBalance] = useState<number>(245000)
  
  const [payFrom, setPayFrom] = useState('7788990011') // Mock main account number
  const [accountNumber, setAccountNumber] = useState('')
  const [billId, setBillId] = useState('')
  const [dueAmount, setDueAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Load real balance from DB
  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.accounts) {
          const mainAcc = data.accounts.find((a: any) => a.account_number === '1000003423')
          if (mainAcc) setBalance(Number(mainAcc.balance))
        }
      })
      .catch(err => console.error('Failed to fetch accounts', err))
  }, [])

  function handleSelectBiller(biller: Biller) {
    setSelectedBiller(biller)
    setErrors({})
    setScreen('form')
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {}

    if (!payFrom) {
      newErrors.payFrom = 'Please select a source account'
    }

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

  async function handlePayNow(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const amount = Number(dueAmount)

    // Check Balance
    if (amount > balance) {
      setScreen('failed')
      return
    }

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: '1000003423',
          toAccount: '9999999999', // Send to Admin Vault
          amount: amount,
          description: `${selectedBiller?.name} Bill - ${billId}`,
          userId: 1
        })
      })

      const data = await res.json()
      
      if (data.ok) {
        setBalance(balance - amount)
        setConfirmationNumber(`PAY-${Math.floor(10000000 + Math.random() * 90000000)}`)
        setScreen('success')
      } else {
        setScreen('failed')
      }
    } catch (err) {
      console.error(err)
      setScreen('failed')
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
            <h1 className="text-3xl font-bold !text-white mb-2 tracking-tight">Pay Bills</h1>
            <p className="text-[#8a8a8a] text-sm">Pay your utilities, credit cards, and top-ups securely.</p>
          </div>
          <div className="flex items-center gap-6 mt-1">
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

        <div className="max-w-4xl mx-auto mt-8">
          
          {/* SELECT BILLER SCREEN */}
          {screen === 'select' && (
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a1f]/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold !text-white tracking-tight">Select Biller</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative z-10">
                {billers.map((biller) => (
                  <button
                    key={biller.id}
                    onClick={() => handleSelectBiller(biller)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ff5a1f]/50 hover:bg-[#ff5a1f]/5 transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg p-2 border-2 border-transparent group-hover:border-[#ff5a1f]">
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={biller.logo}
                          alt={biller.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-[#ff5a1f] transition-colors text-center">{biller.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FORM SCREEN */}
          {screen === 'form' && selectedBiller && (
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a1f]/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <button
                onClick={() => setScreen('select')}
                className="flex items-center gap-2 text-[#8a8a8a] hover:text-white transition-colors mb-8 group w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ff5a1f] transition-colors border border-white/10 group-hover:border-[#ff5a1f]">
                  <ChevronLeft size={16} />
                </div>
                <span className="text-sm font-bold tracking-wide">Back to Billers</span>
              </button>

              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg p-2 border border-white/20">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={selectedBiller.logo}
                      alt={selectedBiller.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold !text-white tracking-tight">{selectedBiller.name}</h2>
                  <p className="text-sm text-[#8a8a8a]">Pay your utility bill instantly.</p>
                </div>
              </div>

              <form onSubmit={handlePayNow} className="space-y-6 relative z-10">
                
                {/* Pay From */}
                <div className="space-y-2">
                  <label className="flex justify-between items-center text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">
                    <span>Pay From *</span>
                    <span className="text-[#ff5a1f]">Avail: Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </label>
                  <select 
                    value={payFrom}
                    onChange={(e) => setPayFrom(e.target.value)}
                    className={"w-full bg-[#0f0f11] border " + (errors.payFrom ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all cursor-pointer"}
                  >
                    <option value="7788990011">Nova Main Account (****0011)</option>
                    <option value="5566778899">Nova Savings Account (****8899)</option>
                  </select>
                  {errors.payFrom && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.payFrom}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Account Number *</label>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 847291038"
                      className={"w-full bg-[#0f0f11] border " + (errors.accountNumber ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]"}
                    />
                    {errors.accountNumber && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.accountNumber}</p>}
                  </div>

                  {/* Bill ID */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Bill ID / Invoice No *</label>
                    <input
                      value={billId}
                      onChange={(e) => setBillId(e.target.value)}
                      placeholder="e.g. INV-2023-01"
                      className={"w-full bg-[#0f0f11] border " + (errors.billId ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]"}
                    />
                    {errors.billId && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.billId}</p>}
                  </div>
                </div>

                {/* Due Amount */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Payment Amount (Rs.) *</label>
                  <input
                    type="number"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    placeholder="0.00"
                    className={"w-full bg-[#0f0f11] border " + (errors.dueAmount ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-4 text-white text-2xl font-mono focus:outline-none transition-all placeholder:text-[#444]"}
                  />
                  {errors.dueAmount && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.dueAmount}</p>}
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Remarks (Optional)</label>
                  <input
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. March Bill"
                    className="w-full bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all placeholder:text-[#444]"
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end mt-8">
                  <button
                    type="submit"
                    className="w-full px-10 py-4 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95 tracking-wide"
                  >
                    PAY NOW
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {screen === 'success' && selectedBiller && (
            <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden text-center animate-in zoom-in-95 fade-in duration-500 max-w-xl mx-auto">
              <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
              
              <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold !text-white tracking-tight mb-2">Payment Successful!</h2>
                <p className="text-[#8a8a8a] mb-8">Your bill has been paid securely.</p>

                <div className="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 mx-auto mb-10 text-left space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Biller</span>
                    <span className="text-white font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <Image src={selectedBiller.logo} alt="logo" width={24} height={24} className="object-contain p-0.5" />
                      </div>
                      {selectedBiller.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Amount</span>
                    <span className="text-white font-mono font-bold">Rs. {Number(dueAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Account No</span>
                    <span className="text-white font-mono text-sm">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Ref No</span>
                    <span className="text-[#ff5a1f] font-mono text-xs">{confirmationNumber}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={resetToHome}
                    className="w-full px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5"
                  >
                    Pay Another Bill
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAILURE SCREEN */}
          {screen === 'failed' && (
            <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-red-500/20 relative overflow-hidden text-center animate-in zoom-in-95 fade-in duration-500 max-w-xl mx-auto">
              <div className="absolute inset-0 bg-red-500/5"></div>
              
              <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold !text-white tracking-tight mb-2">Payment Failed</h2>
                <p className="text-[#8a8a8a] mb-8">We couldn't process your bill payment due to insufficient funds.</p>

                <div className="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 mx-auto mb-10">
                  <p className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2">Current Balance</p>
                  <h3 className="text-2xl font-mono font-bold text-white tracking-tight">Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-red-400 text-xs mt-3 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    You are trying to pay Rs. {Number(dueAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}, which exceeds your available balance.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setScreen('form')}
                    className="px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95"
                  >
                    Try Different Amount
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
    </div>
  )
}
