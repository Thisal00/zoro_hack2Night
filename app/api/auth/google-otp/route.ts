import crypto from 'node:crypto'
import { hashPassword } from '@/lib/password'
import { asText, runTransaction, serviceFailure } from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

// Demo "Google" sign-in: a fixed OTP (123456) stands in for a real OAuth /
// verification flow. On first sign-in the user is auto-provisioned with a
// hashed random placeholder password and a starter account. A signed,
// HttpOnly session is issued — never forgeable user_id/role cookies.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = asText(body.email).trim()
    const otp = asText(body.otp)

    if (!email || !otp) {
      return Response.json(
        { ok: false, message: 'Email and OTP are required.' },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { ok: false, message: 'A valid email is required.' },
        { status: 400 }
      )
    }
    if (otp !== '123456') {
      return Response.json(
        { ok: false, message: 'Invalid OTP. Use 123456 for testing.' },
        { status: 401 }
      )
    }

    const user = await runTransaction(async (client) => {
      const existing = await client.query(
        'SELECT id, username, role, full_name, email FROM users WHERE email = $1 LIMIT 1',
        [email]
      )
      if (existing.rowCount && existing.rowCount > 0) {
        return existing.rows[0]
      }

      // Auto-register. The placeholder password is random and hashed, so the
      // account can't be logged into with a known password.
      const username = email
      const fullName = email.split('@')[0] || 'Google User'
      const placeholder = await hashPassword(crypto.randomUUID())

      const inserted = await client.query(
        `INSERT INTO users (username, password, role, full_name, email)
         VALUES ($1, $2, 'customer', $3, $4)
         RETURNING id, username, role, full_name, email`,
        [username, placeholder, fullName, email]
      )
      const created = inserted.rows[0]

      const newAccountNumber = `9${String(created.id).padStart(9, '0')}`
      await client.query(
        `INSERT INTO accounts (user_id, account_number, account_name, balance, pin)
         VALUES ($1, $2, $3, 0, '0000')`,
        [created.id, newAccountNumber, `${fullName} Savings`]
      )
      return created
    })

    const token = createSessionToken({ id: user.id, role: user.role })
    const headers = new Headers()
    headers.append('set-cookie', buildSessionCookie(token))

    return Response.json(
      { ok: true, message: 'Login successful', user },
      { headers }
    )
  } catch (reason) {
    return serviceFailure(reason)
  }
}
