import { runStatement, serviceFailure } from '@/lib/platform-db'

export async function PUT(request: Request) {
  try {
    const { userId, accountNumber, newNickname } = await request.json()

    if (!userId || !accountNumber || !newNickname) {
      return Response.json({ ok: false, message: 'Missing required fields' }, { status: 400 })
    }

    const result = await runStatement(
      `UPDATE accounts SET account_name = $1 WHERE account_number = $2 AND user_id = $3`,
      [newNickname, accountNumber, userId]
    )

    if (result.rowCount === 0) {
      return Response.json({ ok: false, message: 'Account not found or unauthorized' }, { status: 404 })
    }

    return Response.json({ ok: true, message: 'Nickname updated successfully' })
  } catch (error) {
    return serviceFailure(error)
  }
}
