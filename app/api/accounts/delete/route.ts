import { asText, runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function DELETE(request: Request) {
  try {
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const accountNumber = asText(searchParams.get('accountNumber'))

    if (!accountNumber) {
      return Response.json(
        { ok: false, message: 'Missing accountNumber' },
        { status: 400 }
      )
    }

    // Only ever delete an account owned by the authenticated user.
    const result = await runQuery(
      `DELETE FROM accounts
       WHERE user_id = $1 AND account_number = $2
       RETURNING id`,
      [session.sub, accountNumber]
    )

    if (result.rowCount === 0) {
      return Response.json(
        { ok: false, message: 'Account not found or not authorized' },
        { status: 404 }
      )
    }

    return Response.json({ ok: true, message: 'Account deleted successfully' })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
