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

    // Total balance across the authenticated user's accounts.
    const balanceRes = await runQuery(
      'SELECT SUM(balance) AS total_balance FROM accounts WHERE user_id = $1',
      [session.sub]
    )
    const totalBalance = balanceRes.rows[0]?.total_balance || 0

    const accountRes = await runQuery(
      'SELECT account_number FROM accounts WHERE user_id = $1 LIMIT 1',
      [session.sub]
    )
    let transactions: unknown[] = []

    if (accountRes.rowCount && accountRes.rowCount > 0) {
      const primaryAccount = accountRes.rows[0].account_number
      const txRes = await runQuery(
        `SELECT *
         FROM transactions
         WHERE from_account = $1 OR to_account = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [primaryAccount]
      )
      transactions = txRes.rows
    }

    return Response.json({
      ok: true,
      totalBalance: Number(totalBalance),
      transactions
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
