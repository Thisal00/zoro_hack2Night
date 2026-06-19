"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LeftPanel = () => (
  <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-slate-50 border-r border-slate-200 p-12 text-slate-900 md:flex">
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-[#e65a28] shadow-sm border border-orange-200">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </div>
      <span className="text-2xl font-bold tracking-wide text-slate-900">Nova Bank</span>
    </div>
    
    <div className="z-10 mt-20 flex-1">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e65a28]">
        Digital Banking Platform
      </p>
      <h1 className="mt-6 text-[3.2rem] leading-[1.1] font-bold text-slate-900 max-w-[400px]">
        Simplicity in every transaction.
      </h1>
      <p className="mt-8 max-w-[380px] text-[1.1rem] leading-relaxed text-slate-600">
        Experience structural security packed inside a calm, refined, minimalist ecosystem built to keep your capital fluid.
      </p>
    </div>

    <div className="z-10 text-xs font-medium text-slate-500 tracking-widest uppercase">
      Nova Bank International © 2026
    </div>
    
    <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-orange-200/50 blur-3xl pointer-events-none" />
  </div>
)

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    branch: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (res.ok && data.ok) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'Sign up failed')
      }
    } catch (err) {
      setError('An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[640px] w-full max-w-[1100px] overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
      <LeftPanel />

      <div className="flex w-full flex-col justify-center px-10 py-12 md:w-[55%]">
        <div className="mx-auto w-full max-w-[500px]">
          <h2 className="text-[2rem] font-bold text-slate-900">Create an account</h2>
          <p className="mt-2 text-[15px] text-slate-500">
            Register below to initiate your digital vault access.
          </p>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Account Number</label>
                <input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="0041-8932"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Account Name</label>
                <input
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Branch</label>
                <input
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="Central Square"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@domain.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#e65a28] py-3.5 font-bold text-white transition hover:bg-[#d44d1e] disabled:opacity-70 shadow-md shadow-[#e65a28]/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <p className="mt-8 text-center text-[15px] text-slate-600">
              Already registered? <Link href="/login" className="font-semibold text-[#e65a28] hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
