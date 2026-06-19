import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = asText(body.email)
    const otp = asText(body.otp)
    const newPassword = asText(body.newPassword)

    if (!email || !otp || !newPassword) {
      return Response.json({ ok: false, message: 'All fields are required.' }, { status: 400 })
    }

    if (otp !== '123456') {
      return Response.json({ ok: false, message: 'Invalid OTP. For demo purposes, use 123456.' }, { status: 400 })
    }

    const checkUser = await runStatement('SELECT id FROM users WHERE email = $1 OR username = $1', [email])
    if (!checkUser.rowCount || checkUser.rowCount === 0) {
      return Response.json({ ok: false, message: 'No account found with that email.' }, { status: 404 })
    }

    await runStatement('UPDATE users SET password = $1 WHERE email = $2 OR username = $2', [newPassword, email])

    return Response.json({
      ok: true,
      message: 'Password reset successfully. You can now log in.'
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
