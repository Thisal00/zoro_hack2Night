'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AuthButton from '@/components/authButton'

type Field = {
  key: 'username' | 'fullName' | 'email' | 'password' | 'confirmPassword'
  label: string
  type?: string
  autoComplete?: string
}

const fields: Field[] = [
  { key: 'username', label: 'Username', autoComplete: 'username' },
  { key: 'fullName', label: 'Full Name', autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password'
  },
  {
    key: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    autoComplete: 'new-password'
  }
]

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key: Field['key'], value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!form.fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not create your account.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto min-h-[700px] w-full max-w-[1100px] rounded-[58px] bg-white px-8 py-9 shadow-[0_1px_3px_0_rgba(0,0,0,0.30),0_4px_8px_3px_rgba(0,0,0,0.15)] lg:min-h-[820px] lg:px-14">
      <form
        className="relative mx-auto w-full max-w-[860px]"
        onSubmit={handleSubmit}
      >
        <img
          src="/loginlogo.png"
          alt="Nova Bank"
          className="absolute left-0 top-0 hidden w-[128px] md:block"
        />

        <h1 className="mb-12 text-center text-[2.6rem] font-bold text-black text-balance">
          SIGN UP
        </h1>

        <div className="space-y-4">
          {fields.map((field) => {
            const fieldId = `sign-up-${field.key}`
            return (
              <div
                className="grid items-center gap-4 md:grid-cols-[180px_1fr]"
                key={field.key}
              >
                <label className="text-xl text-black" htmlFor={fieldId}>
                  {field.label} :
                </label>
                <input
                  id={fieldId}
                  type={field.type ?? 'text'}
                  autoComplete={field.autoComplete}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
                />
              </div>
            )
          })}
        </div>

        {error && (
          <p
            className="mt-6 text-center text-sm font-semibold text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? 'CREATING…' : 'SIGN UP'}
          </AuthButton>
          <Link href="/login" className="text-sm font-bold text-black">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </section>
  )
}
