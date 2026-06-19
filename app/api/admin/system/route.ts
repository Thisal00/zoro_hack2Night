import { runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    // Require a valid, server-signed admin session. The role comes from the
    // signed token, not a client-supplied cookie, so it cannot be forged.
    const session = getSession(request)
    if (!session || session.role !== 'admin') {
      return Response.json({ ok: false, message: 'Forbidden.' }, { status: 403 })
    }

    const users = await runQuery(
      'SELECT id, username, role, full_name, email, created_at FROM users ORDER BY id'
    )
    const accounts = await runQuery(
      'SELECT id, user_id, account_number, account_name, balance FROM accounts ORDER BY id'
    )
    const logs = await runQuery(
      'SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10'
    )

    return Response.json({
      ok: true,
      message: 'System overview.',
      users: users.rows,
      accounts: accounts.rows,
      auditLogs: logs.rows
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
