import { hashPassword } from '@/lib/password'
import { asText, runQuery, serviceFailure } from '@/lib/platform-db'

// Demo-only reset: the OTP is a fixed value (123456) and is NOT a real,
// emailed, single-use token. The new password IS hashed before storage.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = asText(body.email).trim()
    const otp = asText(body.otp)
    const newPassword = asText(body.newPassword)

    if (!email || !otp || !newPassword) {
      return Response.json(
        { ok: false, message: 'All fields are required.' },
        { status: 400 }
      )
    }
    if (newPassword.length < 6) {
      return Response.json(
        { ok: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }
    if (otp !== '123456') {
      return Response.json(
        { ok: false, message: 'Invalid OTP. For demo purposes, use 123456.' },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(newPassword)
    const result = await runQuery(
      'UPDATE users SET password = $1 WHERE email = $2 OR username = $2',
      [hashed, email]
    )

    if (result.rowCount === 0) {
      return Response.json(
        { ok: false, message: 'No account found with that email.' },
        { status: 404 }
      )
    }

    return Response.json({
      ok: true,
      message: 'Password reset successfully. You can now log in.'
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
