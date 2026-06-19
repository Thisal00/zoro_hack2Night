import { asText, runStatement, runTransaction, serviceFailure } from '@/lib/platform-db'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = asText(body.email)
    const otp = asText(body.otp)

    if (!email || !otp) {
      return Response.json({ ok: false, message: 'Email and OTP are required.' }, { status: 400 })
    }

    if (otp !== '123456') {
      return Response.json({ ok: false, message: 'Invalid OTP. Use 123456 for testing.' }, { status: 401 })
    }

    let user: any = null

    await runTransaction(async (client) => {
      // Check if user exists
      const existingUser = await client.query('SELECT id, username, role, full_name, email FROM users WHERE email = $1 LIMIT 1', [email])
      
      if (existingUser.rowCount > 0) {
        user = existingUser.rows[0]
      } else {
        // Auto-register
        const username = email
        const password = 'google_oauth_placeholder_password'
        const fullName = email.split('@')[0] || 'Google User'

        const insertedUser = await client.query(`
          INSERT INTO users (username, password, role, full_name, email)
          VALUES ($1, $2, 'customer', $3, $4)
          RETURNING id, username, role, full_name, email
        `, [username, password, fullName, email])

        user = insertedUser.rows[0]

        // Create a default bank account for the new user
        const newAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()
        await client.query(`
          INSERT INTO accounts (user_id, account_number, account_name, balance, pin)
          VALUES ($1, $2, $3, 0, '0000')
        `, [user.id, newAccountNumber, fullName + ' Savings'])
      }
    })

    const headers = new Headers()
    headers.append('set-cookie', `user_id=${user.id}; Path=/; SameSite=Lax`)
    headers.append('set-cookie', `role=${user.role}; Path=/; SameSite=Lax`)

    return Response.json({
      ok: true,
      message: 'Login successful',
      token: Buffer.from(`${user.id}:${user.role}:session-token`).toString('base64'),
      user
    }, { headers })

  } catch (reason) {
    return serviceFailure(reason)
  }
}
