import { runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    // Always return the authenticated user's own profile.
    const result = await runQuery(
      `SELECT id, username, full_name, nic, email, role, created_at
       FROM users
       WHERE id = $1`,
      [session.sub]
    )

    if (result.rowCount === 0) {
      return Response.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return Response.json({ ok: true, user: result.rows[0] })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
