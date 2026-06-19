import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function POST(request: Request) {
  try {
    const { userId, accountNumber, accountName } = await request.json()

    if (!userId || !accountNumber || !accountName) {
      return Response.json({ ok: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Check if account already exists
    const existing = await runStatement('SELECT id FROM accounts WHERE account_number = $1', [accountNumber])
    if (existing.rowCount && existing.rowCount > 0) {
      return Response.json({ ok: false, message: 'Account number already exists' }, { status: 400 })
    }

    await runStatement(
      `INSERT INTO accounts (user_id, account_number, account_name, balance, pin) VALUES ($1, $2, $3, 0, '0000')`,
      [userId, accountNumber, accountName]
    )

    return Response.json({ ok: true, message: 'Account added successfully' })
  } catch (error) {
    return serviceFailure(error)
  }
}
