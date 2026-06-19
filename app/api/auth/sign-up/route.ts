import { hashPassword } from '@/lib/password'
import {
  asText,
  runQuery,
  runTransaction,
  serviceFailure
} from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const accountNumber = asText(body.accountNumber).trim()
    const accountName = asText(body.accountName).trim()
    // Normalize email to lowercase so logins are case-insensitive and the
    // duplicate check below catches case-variant addresses.
    const email = asText(body.email).trim().toLowerCase()
    const password = asText(body.password)
    const confirmPassword = asText(body.confirmPassword)
    const pin = asText(body.pin).trim()

    if (
      !accountNumber ||
      !accountName ||
      !email ||
      !password ||
      !confirmPassword ||
      !pin
    ) {
      return Response.json(
        { ok: false, message: 'All fields are required.' },
        { status: 400 }
      )
    }
    if (!/^\d{4}$/.test(pin)) {
      return Response.json(
        { ok: false, message: 'Transaction PIN must be exactly 4 digits.' },
        { status: 400 }
      )
    }
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
    if (password !== confirmPassword) {
      return Response.json(
        { ok: false, message: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    // No username field in the form — use the email as the username.
    const username = email

    const existingUser = await runQuery(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    )
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return Response.json(
        { ok: false, message: 'User with this email already exists.' },
        { status: 409 }
      )
    }

    const existingAccount = await runQuery(
      'SELECT id FROM accounts WHERE account_number = $1',
      [accountNumber]
    )
    if (existingAccount.rowCount && existingAccount.rowCount > 0) {
      return Response.json(
        { ok: false, message: 'Account number already registered.' },
        { status: 409 }
      )
    }

    // Store only a hash; create the user and their first account atomically.
    const hashed = await hashPassword(password)
    const newUser = await runTransaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (username, password, role, full_name, email)
         VALUES ($1, $2, 'customer', $3, $4)
         RETURNING id, role`,
        [username, hashed, accountName, email]
      )
      const created = userResult.rows[0]
      await client.query(
        `INSERT INTO accounts (user_id, account_number, account_name, balance, pin)
         VALUES ($1, $2, $3, 0, $4)`,
        [created.id, accountNumber, accountName, pin]
      )
      return created
    })

    // Issue a signed, HttpOnly session — same as login.
    const token = createSessionToken({ id: newUser.id, role: newUser.role })
    const headers = new Headers()
    headers.append('set-cookie', buildSessionCookie(token))

    return Response.json(
      { ok: true, message: 'Sign up successful.' },
      { headers }
    )
  } catch (error) {
    return serviceFailure(error)
  }
}
