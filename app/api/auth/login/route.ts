import { verifyPassword } from '@/lib/password'
import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = asText(body.username)
    const password = asText(body.password)

    // Accept either the username or the email (the UI offers "Account Name or
    // Email"). Still verified against the scrypt hash below.
    const sql = `
      SELECT id, username, role, full_name, email, password
      FROM users
      WHERE username = $1 OR email = $1
      LIMIT 1
    `
    const result = await runQuery(sql, [username])

    const row = result.rows[0]
    if (!row || !(await verifyPassword(password, row.password))) {
      return Response.json(
        {
          ok: false,
          message: 'Invalid login.',
          sql
        },
        { status: 401 }
      )
    }

    // Never expose the password hash to the client.
    const { password: _passwordHash, ...user } = row
    const token = createSessionToken({ id: user.id, role: user.role })
    const headers = new Headers()
    headers.append('set-cookie', buildSessionCookie(token))

    return Response.json(
      {
        ok: true,
        user,
        sql
      },
      { headers }
    )
  } catch (reason) {
    return serviceFailure(reason)
  }
}
