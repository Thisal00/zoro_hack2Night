import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    // Authorize against the session: a caller may only see transactions for
    // accounts they own.
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const owned = await runQuery(
      'SELECT account_number FROM accounts WHERE user_id = $1',
      [session.sub]
    )
    const ownedAccounts: string[] = owned.rows.map((r) => r.account_number)

    const { searchParams } = new URL(request.url)
    const requested = asText(searchParams.get('account'))

    let accounts: string[]
    if (requested) {
      // A specific account was asked for — it must belong to the caller.
      if (!ownedAccounts.includes(requested)) {
        return Response.json(
          { ok: false, message: 'Forbidden.' },
          { status: 403 }
        )
      }
      accounts = [requested]
    } else {
      accounts = ownedAccounts
    }

    if (accounts.length === 0) {
      return Response.json({ ok: true, accounts, transactions: [] })
    }

    const result = await runQuery(
      `SELECT *
       FROM transactions
       WHERE from_account = ANY($1) OR to_account = ANY($1)
       ORDER BY created_at DESC`,
      [accounts]
    )

    return Response.json({
      ok: true,
      accounts,
      transactions: result.rows
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
