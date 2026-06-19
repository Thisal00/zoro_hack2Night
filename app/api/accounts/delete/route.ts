import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = asText(searchParams.get('userId'))
    const accountNumber = asText(searchParams.get('accountNumber'))

    if (!userId || !accountNumber) {
      return Response.json({ ok: false, message: 'Missing userId or accountNumber' })
    }

    const sql = `
      DELETE FROM accounts
      WHERE user_id = $1 AND account_number = $2
      RETURNING id
    `
    const result = await runStatement(sql, [userId, accountNumber])

    if (result.rowCount === 0) {
      return Response.json({ ok: false, message: 'Account not found or not authorized' })
    }

    return Response.json({
      ok: true,
      message: 'Account deleted successfully'
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
