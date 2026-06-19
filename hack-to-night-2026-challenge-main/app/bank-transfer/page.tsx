'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { Search, Bell } from '@/components/Icons'

type BankAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  email: string;
  nickname: string;
}

type Errors = Partial<{
  transferFrom: string
  amount: string
  accountNumber: string
  accountName: string
  bank: string
}>

export default function BankTransferPage() {
  const router = useRouter()

  // State
  const [savedAccounts, setSavedAccounts] = useState<BankAccount[]>([])
  const [balance, setBalance] = useState<number>(245000)

  const [transferFrom, setTransferFrom] = useState('1000003423') // Actual main account number
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [bank, setBank] = useState('')
  const [description, setDescription] = useState('')
  
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<'form' | 'confirm' | 'face-scan' | 'success' | 'failure'>('form')
  const [confirmation, setConfirmation] = useState<string | null>(null)

  // Face Scan State
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanStatus, setScanStatus] = useState<'scanning' | 'success' | 'failed'>('scanning')

  // Load from database
  useEffect(() => {
    // Fetch real payees
    fetch(`/api/payees?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.payees) {
          setSavedAccounts(data.payees)
        }
      })
      .catch(err => console.error('Failed to fetch payees', err))

    // Fetch real balance
    fetch(`/api/accounts?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.accounts) {
          const mainAcc = data.accounts.find((a: any) => a.account_number === '1000003423')
          if (mainAcc) setBalance(Number(mainAcc.balance))
        }
      })
      .catch(err => console.error('Failed to fetch balance', err))
  }, [])

  // Auto-fill account details when selecting from dropdown
  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    if (!selectedId) {
      setAccountNumber('')
      setAccountName('')
      setBank('')
      return
    }

    const acc = savedAccounts.find(a => a.id === selectedId)
    if (acc) {
      setAccountNumber(acc.accountNumber)
      setAccountName(acc.accountName)
      setBank('') // User must select bank explicitly
    }
  }

  function validate() {
    const e: Errors = {}
    
    if (!transferFrom) e.transferFrom = 'Select source account'

    if (!amount) e.amount = 'Amount is required'
    else if (Number(amount) <= 0 || isNaN(Number(amount)))
      e.amount = 'Enter a valid positive amount'

    if (!accountNumber) e.accountNumber = 'Account number is required'
    else if (!/^\d{6,}$/.test(accountNumber))
      e.accountNumber = 'Enter a valid account number'
    else if (accountNumber === transferFrom)
      e.accountNumber = 'Cannot transfer to the same source account!'

    if (!accountName) e.accountName = 'Account name is required'
    if (!bank) e.bank = 'Select a bank'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) {
      setStep('confirm')
    }
  }

  function startFaceScan() {
    setStep('face-scan')
    setScanStatus('scanning')
    
    // Simulate the scan process
    setTimeout(() => {
      setScanStatus('success')
      // After success, execute transfer after a brief delay
      setTimeout(() => {
        handleTransfer()
      }, 1000)
    }, 3000)
  }

  // Camera initialization for face scan
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'face-scan') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Camera access denied or unavailable", err);
          // Still proceed with the mock scan animation even if camera fails
        });
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  async function handleTransfer() {
    const transferAmount = Number(amount)

    // Check Balance
    if (transferAmount > balance) {
      setStep('failure')
      return
    }

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: transferFrom,
          toAccount: accountNumber,
          amount: transferAmount,
          description: description || 'Bank Transfer',
          userId: 1
        })
      })

      const data = await res.json()
      
      if (data.ok) {
        setBalance(balance - transferAmount)
        setConfirmation(`TRX-${Math.floor(Math.random() * 1000000)}`)
        setStep('success')
      } else {
        setStep('failure')
      }
    } catch (err) {
      console.error(err)
      setStep('failure')
    }
  }

  const resetFlow = () => {
    setAmount('')
    setAccountNumber('')
    setAccountName('')
    setBank('')
    setDescription('')
    setErrors({})
    setConfirmation(null)
    setStep('form')
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
            <h1 className="text-3xl font-bold !text-white mb-2 tracking-tight">Bank Transfer</h1>
            <p className="text-[#8a8a8a] text-sm">Send money securely to linked or external accounts.</p>
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

        <div className="max-w-3xl mx-auto mt-8">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-4">
              <div className={"flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs " + (step === 'form' ? "bg-[#ff5a1f] text-white shadow-[0_0_15px_rgba(255,90,31,0.5)]" : "bg-[#ff5a1f]/20 text-[#ff5a1f]")}>1</div>
              <div className="w-12 h-0.5 bg-white/10 rounded-full"></div>
              <div className={"flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs " + (step === 'confirm' ? "bg-[#ff5a1f] text-white shadow-[0_0_15px_rgba(255,90,31,0.5)]" : step === 'success' || step === 'failure' ? "bg-[#ff5a1f]/20 text-[#ff5a1f]" : "bg-white/5 text-[#666]")}>2</div>
              <div className="w-12 h-0.5 bg-white/10 rounded-full"></div>
              <div className={"flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs " + (step === 'success' ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" : step === 'failure' ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/5 text-[#666]")}>3</div>
            </div>
          </div>

          {/* FORM STEP */}
          {step === 'form' && (
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a1f]/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold !text-white tracking-tight">Transfer Details</h2>
              </div>

              <form onSubmit={handleNext} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Transfer From */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Transfer From *</label>
                    <select 
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all cursor-pointer"
                    >
                      <option value="1000003423">Nova Main Account (****3423) - Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</option>
                      <option value="1000004876">Nova Savings Account (****4876) - Rs. 42,000.00</option>
                    </select>
                    {errors.transferFrom && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.transferFrom}</p>}
                  </div>

                  {/* Select Saved Account */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Transfer To (Saved Recipients)</label>
                    <select 
                      onChange={handleAccountSelect}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#111] text-[#8a8a8a]">-- Select a saved account or enter manually below --</option>
                      {savedAccounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-[#111] text-white">
                          {acc.nickname} - {acc.accountName} ({acc.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full h-[1px] bg-white/5 md:col-span-2 my-2"></div>

                  {/* Amount */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Transfer Amount (Rs.) *</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={"w-full bg-[#0f0f11] border " + (errors.amount ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-4 text-white text-2xl font-mono focus:outline-none transition-all placeholder:text-[#444]"}
                    />
                    {errors.amount && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.amount}</p>}
                  </div>

                  {/* Account Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Recipient Name *</label>
                    <input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className={"w-full bg-[#0f0f11] border " + (errors.accountName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]"}
                    />
                    {errors.accountName && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.accountName}</p>}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Account Number *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1002456789"
                      className={"w-full bg-[#0f0f11] border " + (errors.accountNumber ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]"}
                    />
                    {errors.accountNumber && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.accountNumber}</p>}
                  </div>

                  {/* Select Bank */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Select Bank *</label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className={"w-full bg-[#0f0f11] border " + (errors.bank ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#ff5a1f]") + " rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all cursor-pointer"}
                    >
                      <option value="" className="bg-[#111] text-[#8a8a8a]">Choose bank</option>
                      <option value="Nova Bank" className="bg-[#111] text-white">Nova Bank</option>
                      <option value="First National" className="bg-[#111] text-white">First National</option>
                      <option value="Global Trust" className="bg-[#111] text-white">Global Trust</option>
                      <option value="Union Bank" className="bg-[#111] text-white">Union Bank</option>
                    </select>
                    {errors.bank && <p className="text-[11px] text-red-400 font-medium animate-in fade-in">{errors.bank}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="What is this for?"
                      className="w-full bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all placeholder:text-[#444] resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end mt-8">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95"
                  >
                    CONTINUE
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold !text-white tracking-tight mb-2">Review Transfer</h2>
                <p className="text-[#8a8a8a] text-sm">Please verify the details below before proceeding.</p>
              </div>

              <div className="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 relative z-10 mb-8 max-w-lg mx-auto">
                <div className="flex flex-col items-center justify-center mb-8">
                  <p className="text-[#8a8a8a] text-xs font-bold tracking-widest uppercase mb-2">Sending Amount</p>
                  <h3 className="text-4xl font-mono font-bold text-white tracking-tight">Rs. {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-xs text-orange-400 mt-2">+ Rs. 50.00 Processing Fee</p>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-sm">From Account</span>
                    <span className="text-white font-mono">{transferFrom === '1000003423' ? 'Nova Main (****3423)' : 'Nova Savings (****4876)'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-sm">To Recipient Name</span>
                    <span className="text-white font-medium">{accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-sm">To Account Number</span>
                    <span className="text-white font-mono">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-sm">To Bank</span>
                    <span className="text-white font-medium">{bank}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-center gap-4 relative z-10 max-w-lg mx-auto">
                <button
                  onClick={() => setStep('form')}
                  className="w-full md:w-1/2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5"
                >
                  BACK
                </button>
                <button
                  onClick={startFaceScan}
                  className="w-full md:w-1/2 px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3a2 2 0 0 0-2 2"></path><path d="M19 3a2 2 0 0 1 2 2"></path><path d="M21 19a2 2 0 0 1-2 2"></path><path d="M5 21a2 2 0 0 1-2-2"></path><path d="M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0"></path><path d="M16 16.46 15 15"></path><path d="M8 16.46 9 15"></path></svg>
                  CONFIRM & SCAN
                </button>
              </div>
            </div>
          )}

          {/* FACE SCAN STEP */}
          {step === 'face-scan' && (
            <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden text-center animate-in zoom-in-95 fade-in duration-500 max-w-lg mx-auto">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold !text-white tracking-tight mb-2">Biometric Verification</h2>
                <p className="text-[#8a8a8a] text-sm">Please position your face in the frame to authorize this transfer.</p>
              </div>

              {/* Scanner Container */}
              <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-[#ff5a1f]/20 shadow-[0_0_50px_rgba(255,90,31,0.2)] mb-8">
                {/* Video Feed */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                
                {/* Fallback avatar if no camera */}
                {!videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f11]">
                    <img src="https://i.pravatar.cc/300?u=dilara" className="w-full h-full object-cover opacity-50 blur-sm" alt="fallback" />
                  </div>
                )}

                {/* Scanning Overlay Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,90,31,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,90,31,0.2)_1px,transparent_1px)] bg-[size:20px_20px] mix-blend-screen opacity-50"></div>
                
                {/* Scanning Laser Line Animation */}
                {scanStatus === 'scanning' && (
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#ff5a1f] shadow-[0_0_20px_#ff5a1f] animate-scan mix-blend-screen"></div>
                )}
                
                {/* Success Overlay */}
                {scanStatus === 'success' && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_#22c55e]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div className="h-10">
                {scanStatus === 'scanning' && (
                  <p className="text-[#ff5a1f] font-mono tracking-widest uppercase text-sm animate-pulse flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing Biometrics...
                  </p>
                )}
                {scanStatus === 'success' && (
                  <p className="text-green-500 font-mono tracking-widest uppercase text-sm animate-in slide-in-from-bottom-2 fade-in">
                    Identity Verified
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden text-center animate-in zoom-in-95 fade-in duration-500">
              <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
              
              <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold !text-white tracking-tight mb-2">Transfer Successful!</h2>
                <p className="text-[#8a8a8a] mb-8">Your money has been sent securely.</p>

                <div className="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 max-w-sm mx-auto mb-10 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Amount</span>
                    <span className="text-white font-mono font-bold">Rs. {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">To</span>
                    <span className="text-white font-medium text-sm">{accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] text-xs uppercase tracking-wider">Ref No</span>
                    <span className="text-[#ff5a1f] font-mono text-xs">{confirmation}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={resetFlow}
                    className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5"
                  >
                    Make Another Transfer
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAILURE STEP */}
          {step === 'failure' && (
            <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-red-500/20 relative overflow-hidden text-center animate-in zoom-in-95 fade-in duration-500">
              <div className="absolute inset-0 bg-red-500/5"></div>
              
              <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold !text-white tracking-tight mb-2">Transfer Failed</h2>
                <p className="text-[#8a8a8a] mb-8">We couldn't process your transaction due to insufficient funds.</p>

                <div className="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 max-w-sm mx-auto mb-10">
                  <p className="text-[#8a8a8a] text-xs uppercase tracking-wider mb-2">Current Balance</p>
                  <h3 className="text-2xl font-mono font-bold text-white tracking-tight">Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-red-400 text-xs mt-3 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    You are trying to send Rs. {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}, which exceeds your available balance.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setStep('form')}
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
        
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  )
}
