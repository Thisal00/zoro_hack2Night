import { hashPassword } from '@/lib/password'
import { asText, runQuery, serviceFailure } from '@/lib/platform-db'

// Demo-only password reset: no OTP / email verification is performed. Anyone who
// knows an account's email can set its password. This is intentionally simple
// for the demo and is NOT production-safe — a real flow needs an emailed,
// single-use, expiring token.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = asText(body.email).trim()
    const password = asText(body.password)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { ok: false, message: 'A valid email is required.' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return Response.json(
        { ok: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(password)
    const result = await runQuery(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashed, email]
    )

    if (result.rowCount === 0) {
      return Response.json(
        { ok: false, message: 'No account found with that email.' },
        { status: 404 }
      )
    }

    return Response.json({ ok: true, message: 'Password updated.' })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
