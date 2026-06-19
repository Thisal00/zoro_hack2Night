'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/sidebar'

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
}>

export default function Home() {
  const [fromAccount, setFromAccount] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
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

  useEffect(() => {
    async function loadAccount() {
      const userId = getCookie('user_id') || '1'
      try {
        const res = await fetch(`/api/accounts?userId=${userId}`)
        const data = await res.json()
        if (data.ok && data.accounts.length > 0) {
          setFromAccount(data.accounts[0].account_number)
          setCurrentBalance(Number(data.accounts[0].balance))
        }
      } catch (err) {
        console.error('Failed to fetch account', err)
      }
    }
    loadAccount()
  }, [])

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
      // Check balance first
      if (Number(amount) + 50 > currentBalance) { // Add 50 for fee
        setFailReason(`Insufficient Balance\nCurrent Balance is: Rs.${currentBalance.toLocaleString()}`)
        setStep('failure')
        return
      }
      setStep('confirm')
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const userId = getCookie('user_id') || '1'
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount,
          toAccount: accountNumber,
          amount: Number(amount) + 50, // Including the 50 fee
          description: description || `Transfer to ${accountName}`,
          userId: Number(userId)
        })
      })
      const data = await res.json()
      
      if (res.ok && data.ok) {
        setConfirmation(data.transactionId || String(Math.floor(10000000 + Math.random() * 89999999)))
        setStep('success')
        setCurrentBalance(prev => prev - (Number(amount) + 50))
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
    <div className="min-h-screen bg-bg-light font-geist p-0">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Bank Transfer</h2>
            <div className="flex items-center gap-3">
              <button className="topbar-icon" aria-label="search">
                <img src="/search.png" alt="search" />
              </button>
              <button className="topbar-icon" aria-label="notifications">
                <img src="/notification.png" alt="notifications" />
              </button>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src="/avatar.png"
                  alt="avatar"
                  className="w-full h-full object-cover bg-white"
                />
              </div>
            </div>
          </div>
          {step === 'form' ? (
            <form onSubmit={handleNext} className="transfer-card p-8">
              <div className="grid grid-cols-12 gap-y-6 gap-x-8 items-center">
                <label className="col-span-3 text-gray-700">Amount :</label>
                <div className="col-span-9">
                  <input
                    aria-label="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="underline-input"
                    placeholder=""
                  />
                  {errors.amount && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.amount}
                    </div>
                  )}
                </div>

                <label className="col-span-3 text-gray-700">
                  Account Number :
                </label>
                <div className="col-span-9">
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="underline-input"
                  />
                  {errors.accountNumber && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.accountNumber}
                    </div>
                  )}
                </div>

                <label className="col-span-3 text-gray-700">
                  Account Name :
                </label>
                <div className="col-span-9">
                  <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="underline-input"
                  />
                  {errors.accountName && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.accountName}
                    </div>
                  )}
                </div>

                <label className="col-span-3 text-gray-700">
                  Select Bank :
                </label>
                <div className="col-span-9">
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="underline-input bg-transparent"
                  >
                    <option value="">Choose bank</option>
                    <option>First National</option>
                    <option>Global Trust</option>
                    <option>Union Bank</option>
                  </select>
                  {errors.bank && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.bank}
                    </div>
                  )}
                </div>

                <label className="col-span-3 text-gray-700">
                  Description :
                </label>
                <div className="col-span-9">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="description-box"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-10">
                <button type="submit" className="next-btn">
                  NEXT
                </button>
              </div>
            </form>
          ) : step === 'confirm' ? (
            <div className="transfer-card p-8">
              <h3 className="text-center text-2xl font-semibold mb-6">
                Confirm Transfer
              </h3>
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-xl mx-auto text-center">
                <p className="mb-4">
                  Confirm your transfer of <strong>Rs. {amount || '0'}</strong>{' '}
                  to <strong>{accountName || 'recipient'}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Additional fee of Rs.50 will be charged.
                </p>
                <div className="mb-6">
                  <img
                    src="/transfer-illustration.png"
                    alt="illustration"
                    className="mx-auto"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setStep('failure')}
                    className="next-btn"
                    aria-label="back"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleTransfer}
                    className="next-btn transfer-btn"
                  >
                    TRANSFER
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'success' ? (
            // success page
            <div className="transfer-card p-8">
              <div className="relative">
                <div className="success-check inside-check">
                  <svg
                    viewBox="0 0 120 120"
                    width="100"
                    height="100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="g" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#28a745" />
                        <stop offset="100%" stopColor="#138a3e" />
                      </radialGradient>
                    </defs>
                    <circle cx="60" cy="60" r="50" fill="#dff7e7" />
                    <circle cx="60" cy="60" r="40" fill="#10a654" />
                    <path
                      d="M38 62 L54 78 L82 42"
                      stroke="#fff"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <h3 className="text-center text-2xl font-semibold mb-4">
                  Transfer Successful!
                </h3>
                <p className="text-center text-sm text-gray-500 mb-10">
                  Confirmation number : {confirmation}
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      // go back to home (reset form)
                      setAmount('')
                      setAccountNumber('')
                      setAccountName('')
                      setBank('')
                      setDescription('')
                      setErrors({})
                      setConfirmation(null)
                      setStep('form')
                    }}
                    className="transfer-btn success-btn"
                  >
                    <span className="mr-3">‹</span> BACK TO HOME
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // failure page
            <div className="transfer-card p-8">
              <div className="relative">
                <div className="success-check inside-check">
                  <svg
                    viewBox="0 0 120 120"
                    width="220"
                    height="220"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="60" cy="60" r="50" fill="#ffdede" />
                    <circle cx="60" cy="60" r="40" fill="#ffb6b6" />
                    <path
                      d="M60 30 L93 86 L27 86 Z"
                      fill="#ff4d4f"
                      stroke="#fff"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                    <text
                      x="60"
                      y="78"
                      textAnchor="middle"
                      fontSize="36"
                      fill="#fff"
                      fontWeight="700"
                    >
                      !
                    </text>
                  </svg>
                </div>

                <h3 className="text-center text-2xl font-semibold mb-4">
                  Transaction Failed!
                </h3>
                <p className="text-center text-sm text-gray-500 mb-6 whitespace-pre-line">
                  {failReason}
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setAmount('')
                      setAccountNumber('')
                      setAccountName('')
                      setBank('')
                      setDescription('')
                      setErrors({})
                      setConfirmation(null)
                      setStep('form')
                    }}
                    className="transfer-btn success-btn"
                  >
                    <span className="mr-3">‹</span> BACK TO HOME
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
