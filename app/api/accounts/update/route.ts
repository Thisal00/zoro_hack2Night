import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function PUT(request: Request) {
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
    const newNickname = asText(body.newNickname).trim()

    if (!accountNumber || !newNickname) {
      return Response.json(
        { ok: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Scope the update to the caller's own account.
    const result = await runQuery(
      `UPDATE accounts SET account_name = $1
       WHERE account_number = $2 AND user_id = $3`,
      [newNickname, accountNumber, session.sub]
    )

    if (result.rowCount === 0) {
      return Response.json(
        { ok: false, message: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }

    return Response.json({ ok: true, message: 'Nickname updated successfully' })
  } catch (error) {
    return serviceFailure(error)
  }
}
