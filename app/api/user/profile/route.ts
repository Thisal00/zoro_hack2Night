import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = asText(searchParams.get('userId') || '1')

    const sql = `
      SELECT id, username, full_name, nic, email, role, created_at
      FROM users
      WHERE id = $1
    `
    const result = await runStatement(sql, [userId])

    if (result.rowCount === 0) {
      return Response.json({ ok: false, message: 'User not found' })
    }

    return Response.json({
      ok: true,
      user: result.rows[0]
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
