'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const LeftPanel = () => (
  <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-50 border-r border-slate-200 p-12 text-slate-900 md:flex">
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-[#e65a28] shadow-sm border border-orange-200">
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </div>
      <span className="text-2xl font-bold tracking-wide text-slate-900">
        Nova Bank
      </span>
    </div>

    <div className="z-10 mt-20 flex-1">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e65a28]">
        Digital Banking Platform
      </p>
      <h1 className="mt-6 text-[3.2rem] leading-[1.1] font-bold text-slate-900 max-w-[400px]">
        Simplicity in every transaction.
      </h1>
      <p className="mt-8 max-w-[380px] text-[1.1rem] leading-relaxed text-slate-600">
        Experience structural security packed inside a calm, refined, minimalist
        ecosystem built to keep your capital fluid.
      </p>
    </div>

    <div className="z-10 text-xs font-medium text-slate-500 tracking-widest uppercase">
      Nova Bank International © 2026
    </div>

    <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-orange-200/50 blur-3xl pointer-events-none" />
  </div>
)

type LoginMode = 'password' | 'google_email' | 'google_otp'

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleEmail || !googleEmail.includes('@')) {
      setError('Please enter a valid Gmail address')
      return
    }
    setError('')
    // Simulate sending OTP
    setMode('google_otp')
  }

  const handleGoogleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/google-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleEmail, otp })
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'OTP Verification failed')
      }
    } catch (err) {
      setError('An error occurred during OTP verification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[640px] w-full max-w-[1024px] overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200 transition-all duration-500">
      <LeftPanel />

      <div className="flex w-full flex-col justify-center px-10 py-12 md:w-1/2 relative overflow-hidden">
        <div className="mx-auto w-full max-w-[380px] relative z-10">
          {mode === 'password' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-[15px] text-slate-500">
                Enter your account credentials to access your terminal.
              </p>

              {error && (
                <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handlePasswordLogin}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Account Name or Email
                  </label>
                  <input
                    suppressHydrationWarning
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-slate-900 outline-none focus:border-[#e65a28] focus:ring-1 focus:ring-[#e65a28] transition-colors focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-[#e65a28] focus:ring-[#e65a28]"
                    />
                    Remember device
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-sm font-semibold text-[#e65a28] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-[#e65a28] py-3.5 font-bold text-white transition hover:bg-[#d44d1e] disabled:opacity-70 shadow-md shadow-orange-500/20"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="relative mt-8 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-slate-200" />
                  <span className="relative bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">
                    or continue with
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('google_email')
                      setError('')
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-not-allowed opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                    Phone
                  </button>
                </div>

                <p className="mt-10 text-center text-[15px] text-slate-600">
                  Don't have an account?{' '}
                  <Link
                    href="/sign-up"
                    className="font-semibold text-[#e65a28] hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          )}

          {mode === 'google_email' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                onClick={() => setMode('password')}
                className="mb-6 flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <svg
                  className="mr-2 size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Back to Login
              </button>

              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-slate-50 p-4 border border-slate-100 shadow-inner">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-10"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center text-slate-900">
                Sign in with Google
              </h2>
              <p className="mt-2 text-[15px] text-center text-slate-500">
                Enter your Gmail address to receive an OTP.
              </p>

              {error && (
                <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <form
                className="mt-8 space-y-5"
                onSubmit={handleGoogleEmailSubmit}
              >
                <div>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="Email or phone"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-colors focus:bg-white text-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-[#4285F4] py-3.5 font-bold text-white transition hover:bg-[#3367d6] shadow-md shadow-blue-500/20"
                >
                  Next
                </button>
              </form>
            </div>
          )}

          {mode === 'google_otp' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                onClick={() => setMode('google_email')}
                className="mb-6 flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <svg
                  className="mr-2 size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Back
              </button>

              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-slate-50 p-4 border border-slate-100 shadow-inner flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-full py-1 px-3 bg-white">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-slate-700">
                      {googleEmail}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center text-slate-900">
                2-Step Verification
              </h2>
              <p className="mt-2 text-[15px] text-center text-slate-500">
                An email with a verification code was just sent to{' '}
                <strong className="text-slate-800">{googleEmail}</strong>. (Use
                123456 for demo)
              </p>

              {error && (
                <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleGoogleOtpLogin}>
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter code"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center tracking-widest text-slate-900 outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-colors focus:bg-white text-2xl font-mono"
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-[#4285F4] py-3.5 font-bold text-white transition hover:bg-[#3367d6] disabled:opacity-70 shadow-md shadow-blue-500/20"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
