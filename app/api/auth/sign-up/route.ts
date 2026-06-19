import { runStatement, runTransaction, serviceFailure } from '@/lib/platform-db'

export async function POST(request: Request) {
  try {
    const { accountNumber, accountName, branch, email, password, confirmPassword } = await request.json()

    if (!accountNumber || !accountName || !email || !password || !confirmPassword) {
      return Response.json({ ok: false, message: 'All fields are required.' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return Response.json({ ok: false, message: 'Passwords do not match.' }, { status: 400 })
    }

    // Since we don't have a username field in the sign up form, we'll use email as the username
    const username = email

    // Check if user already exists
    const existingUser = await runStatement('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email])
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return Response.json({ ok: false, message: 'User with this email already exists.' }, { status: 400 })
    }

    // Check if account number already exists
    const existingAccount = await runStatement('SELECT id FROM accounts WHERE account_number = $1', [accountNumber])
    if (existingAccount.rowCount && existingAccount.rowCount > 0) {
      return Response.json({ ok: false, message: 'Account number already registered.' }, { status: 400 })
    }

    let newUserId = -1

    // Use transaction to insert user and account
    await runTransaction(async (client) => {
      // Insert user
      const userResult = await client.query(`
        INSERT INTO users (username, password, role, full_name, email)
        VALUES ($1, $2, 'customer', $3, $4)
        RETURNING id
      `, [username, password, accountName, email])
      
      newUserId = userResult.rows[0].id

      // Insert account
      await client.query(`
        INSERT INTO accounts (user_id, account_number, account_name, balance, pin)
        VALUES ($1, $2, $3, 0, '0000')
      `, [newUserId, accountNumber, accountName])
    })

    const headers = new Headers()
    headers.append('set-cookie', `user_id=${newUserId}; Path=/; SameSite=Lax`)

    return Response.json({
      ok: true,
      message: 'Sign up successful.'
    }, {
      headers
    })

  } catch (error) {
    return serviceFailure(error)
  }
}
