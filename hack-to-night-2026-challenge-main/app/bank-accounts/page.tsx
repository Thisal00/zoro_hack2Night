'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Sidebar from '@/components/sidebar'
import { Search, Bell } from '@/components/Icons'

type Screen = 'list' | 'add' | 'edit'

type BankAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  email: string;
  nickname: string;
  balance?: string | number;
}

type MyAccount = {
  id: string;
  account_number: string;
  account_name: string;
  balance: string;
}

export default function AccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Screen state
  const [screen, setScreen] = useState<Screen>('list')

  // Check if we're in edit mode from URL
  const isEditMode = searchParams.get('mode') === 'edit'
  const isAddMode = searchParams.get('mode') === 'add'
  const accountNumberParam = searchParams.get('accountNumber') || ''
  const nicknameParam = searchParams.get('nickname') || ''
  const accountNameParam = searchParams.get('accountName') || ''
  const emailParam = searchParams.get('email') || ''
  const editIdParam = searchParams.get('id') || ''

  // Accounts State
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [myAccounts, setMyAccounts] = useState<MyAccount[]>([])

  const fetchAccounts = async () => {
    try {
      const [payeesRes, myAccsRes] = await Promise.all([
        fetch(`/api/payees?t=${Date.now()}`),
        fetch(`/api/accounts?t=${Date.now()}`)
      ])
      
      const payeesData = await payeesRes.json()
      if (payeesData.ok && payeesData.payees) {
        setAccounts(payeesData.payees)
      }

      const myAccsData = await myAccsRes.json()
      if (myAccsData.ok && myAccsData.accounts) {
        setMyAccounts(myAccsData.accounts)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Load from DB
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Form data state
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    email: '',
    nickname: ''
  })

  // Edit nickname state
  const [nickname, setNickname] = useState('')

  // Validation errors state
  const [errors, setErrors] = useState({
    accountNumber: '',
    accountName: '',
    email: '',
    nickname: ''
  })

  // Load data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        accountNumber: accountNumberParam,
        accountName: accountNameParam,
        email: emailParam,
        nickname: nicknameParam
      })
      setNickname(nicknameParam || accountNameParam)
      setScreen('edit')
    } else if (isAddMode) {
      setScreen('add')
    } else {
      setScreen('list')
    }
  }, [
    isEditMode,
    isAddMode,
    accountNumberParam,
    accountNameParam,
    emailParam,
    nicknameParam
  ])

  // ===== VALIDATION FUNCTIONS =====
  const validateField = (name: string, value: string) => {
    let error = ''

    switch (name) {
      case 'accountNumber':
        if (!value.trim()) {
          error = 'Account number is required'
        }
        break

      case 'accountName':
        if (!value.trim()) {
          error = 'Account name is required'
        }
        break

      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        }
        break

      case 'nickname':
        if (!value.trim()) {
          error = 'Nickname is required'
        }
        break

      default:
        break
    }

    return error
  }

  const validateForm = () => {
    const newErrors = {
      accountNumber: validateField('accountNumber', formData.accountNumber),
      accountName: validateField('accountName', formData.accountName),
      email: validateField('email', formData.email),
      nickname: validateField('nickname', formData.nickname)
    }

    setErrors(newErrors)

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== '')
  }

  // ===== RESET FORM FUNCTION =====
  const resetForm = () => {
    setFormData({
      accountNumber: '',
      accountName: '',
      email: '',
      nickname: ''
    })
    setNickname('')
    setErrors({
      accountNumber: '',
      accountName: '',
      email: '',
      nickname: ''
    })
  }

  // ===== NAVIGATION FUNCTIONS =====
  const goToList = () => {
    resetForm()
    setScreen('list')
    router.push('/bank-accounts')
  }

  const goToAdd = () => {
    resetForm()
    setScreen('add')
    router.push('/bank-accounts?mode=add')
  }

  const goToEdit = () => {
    setScreen('edit')
    router.push('/bank-accounts?mode=edit')
  }

  // ===== FORM HANDLERS =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }))
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const res = await fetch('/api/payees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          nickname: formData.nickname,
          email: formData.email
        })
      })
      const data = await res.json()
      if (data.ok) {
        alert('Account added successfully!')
        resetForm()
        goToList()
        fetchAccounts()
      }
    } catch (err) {
      console.error(err)
      alert('Failed to add account')
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        const res = await fetch('/api/payees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        })
        const data = await res.json()
        if (data.ok) {
          fetchAccounts()
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if at least account number is filled
    if (!formData.accountNumber.trim()) {
      alert('Please enter an account number first')
      return
    }

    // Navigate to edit mode with whatever data is filled
    router.push(
      `/bank-accounts?mode=edit&accountNumber=${formData.accountNumber}&accountName=${formData.accountName || ''}&email=${formData.email || ''}&nickname=${formData.nickname || ''}`
    )
  }

  const handleEditNickname = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nickname.trim()) {
      alert('Please enter a nickname')
      return
    }

    if (nickname.trim().length < 2) {
      alert('Nickname must be at least 2 characters')
      return
    }

    try {
      const res = await fetch('/api/payees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          id: editIdParam,
          accountNumber: accountNumberParam,
          accountName: accountNameParam,
          nickname: nickname
        })
      })
      const data = await res.json()
      if (data.ok) {
        alert('Nickname updated successfully!')
        resetForm()
        goToList()
        fetchAccounts()
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update nickname')
    }
  }

  const handleCancel = () => {
    resetForm()
    goToList()
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
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Linked Accounts</h1>
            <p className="text-[#8a8a8a] text-sm">Manage your external bank accounts and payees.</p>
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

        {/* ===== LIST SCREEN ===== */}
        {screen === 'list' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- MY ACCOUNTS SECTION --- */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">My Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAccounts.map((acc) => (
                  <div key={acc.id} className="bg-gradient-to-br from-[#ff5a1f] to-[#cc4616] rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <p className="text-white/80 text-xs font-bold tracking-wider uppercase mb-1">Total Balance</p>
                        <h3 className="text-3xl font-bold text-white">Rs. {Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                      </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <p className="text-white font-bold text-sm">{acc.account_name}</p>
                        <p className="text-white/70 text-xs font-mono tracking-widest mt-1">**** {acc.account_number.slice(-4)}</p>
                      </div>
                      <div className="px-3 py-1 bg-black/20 rounded-full">
                        <p className="text-[10px] text-white font-bold uppercase tracking-wider">Active</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- LINKED PAYEES SECTION --- */}
            <h2 className="text-xl font-bold text-white mb-4">External Payees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Render Existing Accounts */}
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-[#17171a] rounded-3xl p-6 shadow-2xl border border-white/5 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 hover:border-[#ff5a1f]/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff5a1f] to-purple-600 p-[2px] shadow-lg shadow-[#ff5a1f]/20">
                      <div className="w-full h-full bg-[#111] rounded-[14px] overflow-hidden flex items-center justify-center">
                        <span className="text-xl font-bold text-white uppercase">{acc.nickname.substring(0, 2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          router.push(`/bank-accounts?mode=edit&id=${acc.id}&accountNumber=${acc.accountNumber}&nickname=${acc.nickname}`)
                        }} 
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-400 transition-colors border border-red-500/10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-xl font-bold !text-white mb-1">{acc.nickname}</h2>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-[#8a8a8a]">{acc.accountName}</p>
                      {acc.balance !== undefined && (
                        <p className="text-[#ff5a1f] font-bold text-sm">
                          Rs. {Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff5a1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8a8a] font-bold tracking-wider uppercase">Linked Account</p>
                        <p className="text-sm font-mono text-white tracking-widest">**** {acc.accountNumber.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Account Button Card */}
              <button 
                onClick={goToAdd}
                className="bg-transparent border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[240px] hover:border-[#ff5a1f]/50 hover:bg-[#ff5a1f]/5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#ff5a1f] transition-all duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <h2 className="text-[15px] font-bold !text-white mb-1 group-hover:!text-[#ff5a1f] transition-colors">Add New Account</h2>
                <p className="text-xs text-[#666] text-center px-4">Link another bank account to transfer funds seamlessly.</p>
              </button>

            </div>
          </div>
        )}

        {/* ===== ADD SCREEN ===== */}
        {screen === 'add' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a1f]/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <button onClick={handleCancel} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h2 className="text-2xl font-bold !text-white tracking-tight">Add Bank Account</h2>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Number */}
                  <div className="space-y-2">
                    <label htmlFor="accountNumber" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Account Number *</label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 1002456789"
                      className={`w-full bg-[#0f0f11] border ${errors.accountNumber ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#ff5a1f]'} rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]`}
                    />
                    {errors.accountNumber && (
                      <p className="text-[11px] text-red-400 font-medium animate-in fade-in flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>

                  {/* Account Name */}
                  <div className="space-y-2">
                    <label htmlFor="accountName" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Account Name *</label>
                    <input
                      type="text"
                      id="accountName"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. John Doe"
                      className={`w-full bg-[#0f0f11] border ${errors.accountName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#ff5a1f]'} rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]`}
                    />
                    {errors.accountName && (
                      <p className="text-[11px] text-red-400 font-medium animate-in fade-in flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {errors.accountName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. john@example.com"
                      className={`w-full bg-[#0f0f11] border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#ff5a1f]'} rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 font-medium animate-in fade-in flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Nickname */}
                  <div className="space-y-2">
                    <label htmlFor="nickname" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Nickname *</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Savings Acct"
                      className={`w-full bg-[#0f0f11] border ${errors.nickname ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#ff5a1f]'} rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all placeholder:text-[#444]`}
                    />
                    {errors.nickname && (
                      <p className="text-[11px] text-red-400 font-medium animate-in fade-in flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {errors.nickname}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAccount}
                    className="px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Save Account
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== EDIT SCREEN ===== */}
        {screen === 'edit' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#17171a] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <button onClick={handleCancel} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h2 className="text-2xl font-bold !text-white tracking-tight">Edit Nickname</h2>
              </div>

              <form onSubmit={handleEditNickname} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label htmlFor="accountNumber" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Bank Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    value={formData.accountNumber || '1234 5678 9012'}
                    disabled
                    className="w-full bg-[#0f0f11]/50 border border-white/5 rounded-xl px-4 py-3.5 text-[#666] text-sm cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#555] mt-1">Account numbers cannot be changed after creation.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="nickname" className="text-[11px] text-[#8a8a8a] font-bold uppercase tracking-wider">Account Nickname</label>
                  <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter new nickname"
                    className="w-full bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff5a1f] transition-all placeholder:text-[#444]"
                    required
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ff5a1f] hover:bg-[#e64a15] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5a1f]/20 active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
