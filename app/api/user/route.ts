import { runStatement, serviceFailure, asText } from '@/lib/platform-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get('id') || '1')

    const result = await runStatement(`
      SELECT id, username, full_name, email, avatar 
      FROM users 
      WHERE id = ${userId}
    `)

    if (result.rows.length === 0) {
      return Response.json({ ok: false, message: 'User not found' }, { status: 404 })
    }

    return Response.json({ ok: true, user: result.rows[0] })
  } catch (err) {
    return serviceFailure(err)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.id || '1')
    
    // Update user profile fields
    const updated = await runStatement(`
      UPDATE users 
      SET 
        full_name = '${asText(body.full_name)}',
        username = '${asText(body.username)}',
        email = '${asText(body.email)}',
        avatar = '${asText(body.avatar || '')}'
      WHERE id = ${userId}
      RETURNING id, username, full_name, email, avatar
    `)

    return Response.json({ ok: true, user: updated.rows[0] })
  } catch (err) {
    return serviceFailure(err)
  }
}
