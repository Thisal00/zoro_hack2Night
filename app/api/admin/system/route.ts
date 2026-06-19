import { runQuery, serviceFailure } from '@/lib/platform-db'

export async function GET(request: Request) {
  try {
    const cookies = request.headers.get('cookie') || ''
    const users = await runQuery('SELECT * FROM users ORDER BY id')
    const accounts = await runQuery('SELECT * FROM accounts ORDER BY id')
    const logs = await runQuery(
      'SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10'
    )

    return Response.json({
      ok: true,
      message: 'System overview.',
      cookies,
      env: process.env,
      users: users.rows,
      accounts: accounts.rows,
      auditLogs: logs.rows
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
