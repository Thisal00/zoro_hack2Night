import { hashPassword, verifyPassword } from '@/lib/password'
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
    const oldPassword = asText(body.oldPassword)
    const newPassword = asText(body.newPassword)

    if (!oldPassword || !newPassword) {
      return Response.json(
        { ok: false, message: 'Missing fields' },
        { status: 400 }
      )
    }
    if (newPassword.length < 6) {
      return Response.json(
        { ok: false, message: 'New password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    // Verify the current password against the stored hash for THIS user.
    const found = await runQuery('SELECT password FROM users WHERE id = $1', [
      session.sub
    ])
    const stored = found.rows[0]?.password
    if (!stored || !(await verifyPassword(oldPassword, stored))) {
      return Response.json(
        { ok: false, message: 'Incorrect old password' },
        { status: 403 }
      )
    }

    const hashed = await hashPassword(newPassword)
    await runQuery('UPDATE users SET password = $1 WHERE id = $2', [
      hashed,
      session.sub
    ])

    return Response.json({ ok: true, message: 'Password updated successfully' })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
