import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { buildSessionCookie, createSessionToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = asText(body.username)
    const password = asText(body.password)

    const sql = `
      SELECT id, username, role, full_name, email
      FROM users
      WHERE username = $1 AND password = $2
      LIMIT 1
    `
    const result = await runQuery(sql, [username, password])

    if (!result.rows[0]) {
      return Response.json(
        {
          ok: false,
          message: 'Invalid login.',
          sql
        },
        { status: 401 }
      )
    }

    const user = result.rows[0]
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
