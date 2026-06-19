import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function PUT(request: Request) {
  try {
    const { userId, oldPassword, newPassword } = await request.json()

    if (!userId || !oldPassword || !newPassword) {
      return Response.json({ ok: false, message: 'Missing fields' })
    }

    // Verify old password
    const userCheck = await runStatement('SELECT id FROM users WHERE id = $1 AND password = $2', [userId, oldPassword])
    if (userCheck.rowCount === 0) {
      return Response.json({ ok: false, message: 'Incorrect old password' })
    }

    // Update to new password
    await runStatement('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId])

    return Response.json({ ok: true, message: 'Password updated successfully' })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
