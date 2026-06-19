'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email or username.')
      return
    }
    setError('')
    // Simulate sending OTP
    setStep(2)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        setSuccess(data.message)
      } else {
        setError(data.message || 'Failed to reset password.')
      }
    } catch (err) {
      setError('A network error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[500px] w-full max-w-[800px] items-center justify-center rounded-[40px] bg-white px-8 py-10 shadow-xl border border-slate-200">
      <div className="w-full max-w-[500px]">
        <h1 className="mb-4 text-center text-3xl font-bold text-slate-900">
          Reset Password
        </h1>
        <p className="mb-8 text-center text-slate-500">
          Enter your credentials to regain access to your account.
        </p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-100">
              {success}
            </div>
            <Link
              href="/login"
              className="inline-block w-full rounded-xl bg-[#e65a28] px-8 py-4 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:-translate-y-1 hover:shadow-lg"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={step === 1 ? handleSendOTP : handleReset}
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="reset-email"
              >
                Email or Username
              </label>
              <input
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step === 2}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white disabled:opacity-50"
              />
            </div>

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="reset-otp"
                  >
                    OTP (Use 123456)
                  </label>
                  <input
                    id="reset-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="reset-password"
                  >
                    New Password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-[#e65a28] py-3.5 font-bold text-white transition hover:bg-[#d44d1e] disabled:opacity-70 shadow-md shadow-orange-500/20"
            >
              {loading
                ? 'Processing...'
                : step === 1
                  ? 'Send OTP'
                  : 'Reset Password'}
            </button>

            <p className="mt-8 text-center text-[15px] text-slate-600">
              Remember your password?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#e65a28] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
