import { verifyPassword } from '@/lib/password'
import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = asText(body.username)
    const password = asText(body.password)

    // Accept either the username or the email, case-insensitively, so that
    // e.g. "User@Example.com" and "user@example.com" resolve to the same
    // account (mobile keyboards routinely auto-capitalize the first letter).
    // Still verified against the scrypt hash below.
    const sql = `
      SELECT id, username, role, full_name, email, password
      FROM users
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
      LIMIT 1
    `
    const result = await runQuery(sql, [username])

    const row = result.rows[0]
    if (!row || !(await verifyPassword(password, row.password))) {
      return Response.json(
        { ok: false, message: 'Invalid login.' },
        { status: 401 }
      )
    }

    // Never expose the password hash to the client.
    const { password: _passwordHash, ...user } = row
    const token = createSessionToken({ id: user.id, role: user.role })
    const headers = new Headers()
    headers.append('set-cookie', buildSessionCookie(token))

    return Response.json({ ok: true, user }, { headers })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
