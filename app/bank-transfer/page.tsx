'use client'

import { useEffect, useState } from 'react'
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

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

type Errors = Partial<{
  amount: string
  accountNumber: string
  accountName: string
  bank: string
  pin: string
}>

export default function BankTransfer() {
  const [fromAccount, setFromAccount] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [accounts, setAccounts] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [bank, setBank] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'failure'>(
    'form'
  )
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [failReason, setFailReason] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [pin, setPin] = useState('')

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
    const acc = accounts.find((a) => a.account_number === accNumber)
    if (acc) {
      setCurrentBalance(Number(acc.balance))
    }
  }

  function validate() {
    const e: Errors = {}
    if (!amount) e.amount = 'Amount is required'
    else if (Number(amount) <= 0 || isNaN(Number(amount)))
      e.amount = 'Enter a valid positive amount'

    if (!accountNumber) e.accountNumber = 'Account number is required'
    else if (!/^\d{6,}$/.test(accountNumber))
      e.accountNumber = 'Enter a valid account number'

    if (!accountName) e.accountName = 'Account name is required'

    if (!bank) e.bank = 'Select a bank'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) {
      if (Number(amount) + 50 > currentBalance) {
        // Add 50 for fee
        setFailReason(
          `Insufficient Balance\nCurrent Balance is: Rs.${currentBalance.toLocaleString()}`
        )
        setStep('failure')
        return
      }
      setStep('confirm')
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{4,}$/.test(pin)) {
      setErrors((prev) => ({ ...prev, pin: 'Enter your account PIN' }))
      return
    }
    setLoading(true)
    try {
      // The server authorizes the transfer from the session + PIN; it never
      // trusts a client-supplied user id.
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount,
          toAccount: accountNumber,
          amount: Number(amount) + 50,
          description: description || `Transfer to ${accountName}`,
          pin
        })
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        setConfirmation(
          data.transactionId ||
            String(Math.floor(10000000 + Math.random() * 89999999))
        )
        setStep('success')
        setCurrentBalance((prev) => prev - (Number(amount) + 50))
      } else {
        setFailReason(data.message || 'Transaction failed on the server')
        setStep('failure')
      }
    } catch (err) {
      setFailReason('Network error occurred')
      setStep('failure')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bank Transfer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Send funds securely to any account.
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
                        Scheduled Transfer Completed
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Rent payment sent successfully.
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

        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 size-64 rounded-full bg-orange-50 blur-[80px] pointer-events-none" />

            {step === 'form' && (
              <form onSubmit={handleNext} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 md:gap-x-8 items-center">
                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    From Account
                  </label>
                  <div className="md:col-span-9">
                    <select
                      value={fromAccount}
                      onChange={handleFromAccountChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28] rounded-xl px-4 py-3 text-slate-900 outline-none transition-all appearance-none cursor-pointer focus:ring-1"
                    >
                      {accounts.map((acc) => (
                        <option
                          key={acc.account_number}
                          value={acc.account_number}
                        >
                          {acc.account_name} ({acc.account_number}) - Rs.{' '}
                          {Number(acc.balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    Amount (Rs.)
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                      placeholder="0.00"
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    Account Number
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.accountNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                      placeholder="Enter destination account"
                    />
                    {errors.accountNumber && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>

                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    Account Name
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.accountName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                      placeholder="Recipient's full name"
                    />
                    {errors.accountName && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.accountName}
                      </p>
                    )}
                  </div>

                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    Select Bank
                  </label>
                  <div className="md:col-span-9">
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className={`w-full bg-slate-50 border ${errors.bank ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 outline-none transition-all appearance-none cursor-pointer focus:ring-1`}
                    >
                      <option value="" disabled>
                        Choose bank
                      </option>
                      <option value="First National">First National</option>
                      <option value="Global Trust">Global Trust</option>
                      <option value="Union Bank">Union Bank</option>
                      <option value="Nova Bank">Nova Bank</option>
                    </select>
                    {errors.bank && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.bank}
                      </p>
                    )}
                  </div>

                  <label className="md:col-span-3 text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <div className="md:col-span-9">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] resize-none"
                      placeholder="Optional reference note"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#e65a28] px-8 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg hover:shadow-orange-500/30"
                  >
                    Continue to Review
                  </button>
                </div>
              </form>
            )}

            {step === 'confirm' && (
              <div className="relative z-10 text-center py-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">
                  Review Transfer
                </h3>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 mb-8 max-w-md mx-auto text-left">
                  <div className="flex justify-between border-b border-slate-200 pb-4 mb-4">
                    <span className="text-slate-500">From Account</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {accounts.find((a) => a.account_number === fromAccount)
                        ?.account_name || 'My Account'}
                      <br />
                      <span className="text-sm font-normal text-slate-500">
                        {fromAccount}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-4 mb-4">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {accountName}
                      <br />
                      <span className="text-sm font-normal text-slate-500">
                        {accountNumber} • {bank}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-4 mb-4">
                    <span className="text-slate-500">Transfer Amount</span>
                    <span className="font-semibold text-slate-900">
                      Rs.{' '}
                      {Number(amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-4 mb-4">
                    <span className="text-slate-500">Transfer Fee</span>
                    <span className="font-semibold text-slate-900">
                      Rs. 50.00
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-700 font-semibold">
                      Total to Deduct
                    </span>
                    <span className="font-bold text-[#e65a28] text-xl">
                      Rs.{' '}
                      {(Number(amount) + 50).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>

                <div className="max-w-md mx-auto mb-8 text-left">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Account PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value)
                      if (errors.pin)
                        setErrors((prev) => ({ ...prev, pin: undefined }))
                    }}
                    placeholder="Enter your PIN to authorize"
                    className={`w-full bg-slate-50 border ${errors.pin ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28]'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-1`}
                  />
                  {errors.pin && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.pin}</p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={loading}
                    className="rounded-xl bg-[#e65a28] px-8 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {loading ? 'Processing...' : 'Confirm Transfer'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="relative z-10 text-center py-12">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.1)] border border-green-100">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">
                  Transfer Successful
                </h3>
                <p className="text-slate-500 mb-8">Ref: {confirmation}</p>
                <button
                  onClick={() => {
                    setAmount('')
                    setAccountNumber('')
                    setAccountName('')
                    setBank('')
                    setDescription('')
                    setPin('')
                    setErrors({})
                    setConfirmation(null)
                    setStep('form')
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
                >
                  Make Another Transfer
                </button>
              </div>
            )}

            {step === 'failure' && (
              <div className="relative z-10 text-center py-12">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)] border border-red-100">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Transfer Failed
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto whitespace-pre-line">
                  {failReason}
                </p>
                <button
                  onClick={() => setStep('form')}
                  className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
