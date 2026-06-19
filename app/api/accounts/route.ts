import { runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    // Authorize against the session; the caller only ever sees their own
    // accounts. PINs are never returned.
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const sql = `
      SELECT a.id, a.user_id, a.account_number, a.account_name, a.balance,
             u.username, u.full_name
      FROM accounts a
      JOIN users u ON u.id = a.user_id
      WHERE a.user_id = $1
      ORDER BY a.id
    `
    const result = await runQuery(sql, [session.sub])

    return Response.json({
      ok: true,
      note: 'Account list prepared.',
      accounts: result.rows
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
