'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AuthButton from '@/components/authButton'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not reset your password.')
        return
      }
      router.push('/login')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[500px] w-full max-w-[1100px] items-center justify-center rounded-[58px] bg-white px-8 py-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.30),0_4px_8px_3px_rgba(0,0,0,0.15)] lg:min-h-[684px]">
      <form className="w-full max-w-[670px]" onSubmit={handleSubmit}>
        <h1 className="mb-16 text-center text-[2.6rem] font-bold text-black text-balance">
          RESET PASSWORD
        </h1>

        <div className="space-y-8">
          <div className="grid items-center gap-4 md:grid-cols-[160px_1fr]">
            <label className="text-xl text-black" htmlFor="reset-email">
              Email:
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          <div className="grid items-center gap-4 md:grid-cols-[160px_1fr]">
            <label className="text-xl text-black" htmlFor="reset-password">
              New Password:
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>
        </div>

        {error && (
          <p
            className="mt-8 text-center text-sm font-semibold text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-12 flex flex-col items-center gap-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? 'SAVING…' : 'RESET'}
          </AuthButton>
          <Link href="/login" className="text-sm font-bold text-black">
            Back to sign in
          </Link>
        </div>
      </form>
    </section>
  )
}
