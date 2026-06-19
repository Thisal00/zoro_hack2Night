'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'

// Modern icons
const Bell = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

const SearchIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

type Screen = 'list' | 'add' | 'edit'

export default function AccountsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [screen, setScreen] = useState<Screen>('list')
  const isEditMode = searchParams.get('mode') === 'edit'
  const accountNumberParam = searchParams.get('accountNumber') || ''
  const nicknameParam = searchParams.get('nickname') || ''
  const accountNameParam = searchParams.get('accountName') || ''
  const emailParam = searchParams.get('email') || ''

  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    email: '',
    nickname: ''
  })

  const [nickname, setNickname] = useState('')

  const [errors, setErrors] = useState({
    accountNumber: '',
    accountName: '',
    email: '',
    nickname: ''
  })

  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  function getCookie(name: string) {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return null
  }

  const loadAccounts = async () => {
    setLoading(true)
    const userId = getCookie('user_id') || '1'
    try {
      const res = await fetch(`/api/accounts?userId=${userId}`)
      const data = await res.json()
      if (data.ok) {
        setAccounts(data.accounts)
      }
    } catch (err) {
      console.error('Failed to load accounts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
    if (isEditMode) {
      setFormData({
        accountNumber: accountNumberParam,
        accountName: accountNameParam,
        email: emailParam,
        nickname: nicknameParam
      })
      setNickname(nicknameParam || accountNameParam)
      setScreen('edit')
    }
  }, [
    isEditMode,
    accountNumberParam,
    accountNameParam,
    emailParam,
    nicknameParam
  ])

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'accountNumber':
        if (!value.trim()) error = 'Account number is required'
        else if (!/^\d+$/.test(value)) error = 'Must contain only numbers'
        else if (value.length < 8 || value.length > 20)
          error = 'Must be between 8 and 20 digits'
        break
      case 'accountName':
        if (!value.trim()) error = 'Account name is required'
        else if (value.trim().length < 2)
          error = 'Must be at least 2 characters'
        else if (!/^[a-zA-Z\s]+$/.test(value))
          error = 'Must contain only letters and spaces'
        break
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Please enter a valid email'
        break
      case 'nickname':
        if (!value.trim()) error = 'Nickname is required'
        else if (value.trim().length < 2)
          error = 'Must be at least 2 characters'
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
    return !Object.values(newErrors).some((error) => error !== '')
  }

  const resetForm = () => {
    setFormData({ accountNumber: '', accountName: '', email: '', nickname: '' })
    setNickname('')
    setErrors({ accountNumber: '', accountName: '', email: '', nickname: '' })
  }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch('/api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          accountNumber: formData.accountNumber,
          accountName: formData.nickname || formData.accountName
        })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        alert('Account added successfully!')
        resetForm()
        loadAccounts()
        goToList()
      } else {
        alert(data.message || 'Failed to add account')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountNumber.trim()) {
      alert('Please enter an account number first')
      return
    }
    router.push(
      `/bank-accounts?mode=edit&accountNumber=${formData.accountNumber}&accountName=${formData.accountName || ''}&email=${formData.email || ''}&nickname=${formData.nickname || ''}`
    )
  }

  const handleEditNickname = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || nickname.trim().length < 2) {
      alert('Valid nickname is required')
      return
    }
    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch('/api/accounts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          accountNumber: formData.accountNumber,
          newNickname: nickname
        })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        alert(`Nickname updated to: ${nickname}`)
        resetForm()
        loadAccounts()
        goToList()
      } else {
        alert(data.message || 'Failed to update nickname')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  const handleDeleteAccount = async (accountNumber: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch(
        `/api/accounts/delete?userId=${userId}&accountNumber=${accountNumber}`,
        {
          method: 'DELETE'
        }
      )
      const data = await res.json()
      if (res.ok && data.ok) {
        alert('Account deleted successfully!')
        loadAccounts()
      } else {
        alert(data.message || 'Failed to delete account')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Accounts
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your linked bank accounts and balances.
            </p>
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
                      <p className="text-sm font-medium text-slate-900">
                        Account Verified
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Your new account has been verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="size-10 overflow-hidden rounded-full border-2 border-slate-200 hover:border-[#e65a28] transition-all shadow-sm">
              <img
                src="/person-logo.png"
                alt="profile"
                className="size-full object-cover"
              />
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto">
          {screen === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20 text-slate-400">
                  Loading accounts...
                </div>
              ) : accounts.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-20 text-slate-400">
                  No accounts found.
                </div>
              ) : (
                accounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#e65a28] hover:shadow-md"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e65a28] to-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="flex justify-between items-start mb-6">
                      <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                        <img
                          src="/account-logo.png"
                          alt="bank logo"
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="size-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              accountNumber: acc.account_number,
                              accountName: acc.account_name
                            })
                            setNickname(acc.account_name)
                            goToEdit()
                          }}
                          title="Edit Nickname"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          className="size-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100"
                          onClick={() =>
                            handleDeleteAccount(acc.account_number)
                          }
                          title="Delete Account"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                        {acc.account_name}
                      </h3>
                      <p className="text-sm font-mono text-slate-500 mb-6 tracking-widest">
                        {acc.account_number}
                      </p>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          Available Balance
                        </span>
                        <span className="text-lg font-bold text-[#e65a28]">
                          Rs. {Number(acc.balance).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={goToAdd}
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-transparent p-6 shadow-none transition-all hover:border-[#e65a28] hover:bg-orange-50 min-h-[220px]"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#e65a28] group-hover:text-white transition-all mb-4 border border-slate-100 group-hover:border-[#e65a28]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-500 group-hover:text-[#e65a28] transition-colors">
                  Add Bank Account
                </h3>
              </button>
            </div>
          )}

          {screen === 'add' && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute -top-20 -right-20 size-64 rounded-full bg-orange-50 blur-[80px] pointer-events-none" />

                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Add Another Bank Account
                </h2>

                <form className="relative z-10 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-50 border ${errors.accountNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                        placeholder="Enter account number"
                      />
                      {errors.accountNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.accountNumber}
                        </p>
                      )}
                    </div>

                    <div className="col-span-full md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Bank Account Name
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-50 border ${errors.accountName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                        placeholder="Account holder name"
                      />
                      {errors.accountName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.accountName}
                        </p>
                      )}
                    </div>

                    <div className="col-span-full md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-50 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                        placeholder="Email address"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nickname
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-50 border ${errors.nickname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                        placeholder="E.g., Savings Account"
                      />
                      {errors.nickname && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.nickname}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={goToList}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAccount}
                      className="w-full sm:w-auto rounded-xl bg-[#e65a28] px-8 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30"
                    >
                      Add Account
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateAccount}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-100"
                    >
                      Update Existing
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {screen === 'edit' && (
            <div className="max-w-xl mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute -top-20 -right-20 size-64 rounded-full bg-orange-50 blur-[80px] pointer-events-none" />

                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Edit Nickname
                </h2>

                <form
                  onSubmit={handleEditNickname}
                  className="relative z-10 space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28]"
                      placeholder="Enter new nickname"
                    />
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={goToList}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#e65a28] px-8 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
