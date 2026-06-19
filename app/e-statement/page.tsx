'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/components/sidebar'

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

type Account = {
  account_number: string
  account_name: string
  balance: string
}

type Tx = {
  id: number
  from_account: string
  to_account: string
  amount: string
  description: string | null
  status: string
  created_at: string
}

export default function EStatementPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selected, setSelected] = useState('')
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/accounts')
        const data = await res.json()
        if (data.ok && data.accounts.length > 0) {
          setAccounts(data.accounts)
          setSelected(data.accounts[0].account_number)
        }
      } catch (err) {
        console.error('Failed to load accounts', err)
      } finally {
        setLoadingAccounts(false)
      }
    }
    loadAccounts()
  }, [])

  useEffect(() => {
    if (!selected) return
    async function loadTransactions() {
      setLoadingTx(true)
      try {
        const res = await fetch(`/api/transactions?account=${selected}`)
        const data = await res.json()
        if (data.ok) setTransactions(data.transactions)
        else setTransactions([])
      } catch (err) {
        console.error('Failed to load transactions', err)
        setTransactions([])
      } finally {
        setLoadingTx(false)
      }
    }
    loadTransactions()
  }, [selected])

  const account = accounts.find((a) => a.account_number === selected)

  const { totalCredits, totalDebits } = useMemo(() => {
    let credits = 0
    let debits = 0
    for (const tx of transactions) {
      const amt = Number(tx.amount)
      if (tx.to_account === selected) credits += amt
      if (tx.from_account === selected) debits += amt
    }
    return { totalCredits: credits, totalDebits: debits }
  }, [transactions, selected])

  const money = (n: number) =>
    `Rs. ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              E-Statement
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review the activity on your accounts.
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
            <button className="size-10 overflow-hidden rounded-full border-2 border-slate-200 hover:border-[#e65a28] transition-all shadow-sm">
              <img
                src="/person-logo.png"
                alt="profile"
                className="size-full object-cover"
              />
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Account picker */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="statement-account"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Account
              </label>
              <select
                id="statement-account"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={loadingAccounts || accounts.length === 0}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#e65a28] focus:ring-[#e65a28] rounded-xl px-4 py-3 text-slate-900 outline-none transition-all appearance-none cursor-pointer focus:ring-1"
              >
                {accounts.length === 0 && (
                  <option value="">
                    {loadingAccounts ? 'Loading…' : 'No accounts'}
                  </option>
                )}
                {accounts.map((a) => (
                  <option key={a.account_number} value={a.account_number}>
                    {a.account_name} ({a.account_number})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!account}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Closing Balance
              </h3>
              <p className="text-3xl font-black text-slate-900">
                {account ? money(Number(account.balance)) : '—'}
              </p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Total Credits
              </h3>
              <p className="text-3xl font-black text-green-600">
                {money(totalCredits)}
              </p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Total Debits
              </h3>
              <p className="text-3xl font-black text-[#e65a28]">
                {money(totalDebits)}
              </p>
            </div>
          </div>

          {/* Transactions table */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Transaction Details
            </h3>
            {loadingTx ? (
              <p className="text-slate-500 text-center py-8">
                Loading transactions…
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No transactions for this account.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Reference</th>
                      <th className="pb-3 font-medium text-right">Debit</th>
                      <th className="pb-3 font-medium text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isDebit = tx.from_account === selected
                      const amt = Number(tx.amount)
                      return (
                        <tr
                          key={tx.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-3 text-slate-600">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-slate-900 font-medium">
                            {tx.description || '—'}
                          </td>
                          <td className="py-3 text-slate-400">#{tx.id}</td>
                          <td className="py-3 text-right text-[#e65a28] font-semibold">
                            {isDebit ? money(amt) : '—'}
                          </td>
                          <td className="py-3 text-right text-green-600 font-semibold">
                            {!isDebit ? money(amt) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
