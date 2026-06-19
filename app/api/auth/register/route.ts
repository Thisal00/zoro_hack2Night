import { hashPassword } from '@/lib/password'
import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = asText(body.username).trim()
    const fullName = asText(body.fullName).trim()
    const email = asText(body.email).trim()
    const password = asText(body.password)

    // Basic server-side validation; the client validates too but never trust it.
    if (username.length < 3) {
      return Response.json(
        { ok: false, message: 'Username must be at least 3 characters.' },
        { status: 400 }
      )
    }
    if (!fullName) {
      return Response.json(
        { ok: false, message: 'Full name is required.' },
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

    const hashed = await hashPassword(password)
    const insert = `
      INSERT INTO users (username, password, role, full_name, email)
      VALUES ($1, $2, 'customer', $3, $4)
      RETURNING id, username, role, full_name, email
    `

    let row: { id: number; role: string }
    try {
      const result = await runQuery(insert, [username, hashed, fullName, email])
      row = result.rows[0]
    } catch (reason) {
      // Unique violation on username.
      if ((reason as { code?: string })?.code === '23505') {
        return Response.json(
          { ok: false, message: 'That username is already taken.' },
          { status: 409 }
        )
      }
      throw reason
    }

    const token = createSessionToken({ id: row.id, role: row.role })
    const headers = new Headers()
    headers.append('set-cookie', buildSessionCookie(token))

    return Response.json({ ok: true, user: row }, { headers })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
