import { runQuery, serviceFailure } from '@/lib/platform-db'

function readCookies(header: string) {
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export async function GET(request: Request) {
  try {
    // Require an authenticated admin. NOTE: the session/role trust model
    // itself is hardened separately (signed sessions) — see audit item C4.
    const cookies = readCookies(request.headers.get('cookie') || '')
    if (!cookies.user_id || cookies.role !== 'admin') {
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
