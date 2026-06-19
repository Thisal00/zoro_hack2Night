import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const accountNumber = asText(body.accountNumber).trim()
    const accountName = asText(body.accountName).trim()

    if (!accountNumber || !accountName) {
      return Response.json(
        { ok: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existing = await runQuery(
      'SELECT id FROM accounts WHERE account_number = $1',
      [accountNumber]
    )
    if (existing.rowCount && existing.rowCount > 0) {
      return Response.json(
        { ok: false, message: 'Account number already exists' },
        { status: 400 }
      )
    }

    // Bind the new account to the authenticated user — never a client value.
    await runQuery(
      `INSERT INTO accounts (user_id, account_number, account_name, balance, pin)
       VALUES ($1, $2, $3, 0, '0000')`,
      [session.sub, accountNumber, accountName]
    )

    return Response.json({ ok: true, message: 'Account added successfully' })
  } catch (error) {
    return serviceFailure(error)
  }
}
