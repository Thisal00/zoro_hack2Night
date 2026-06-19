import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = asText(searchParams.get('userId') || '1')

    // Get total balance
    const balanceRes = await runStatement(`SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = $1`, [userId])
    const totalBalance = balanceRes.rows[0]?.total_balance || 0

    // Get primary account to fetch transactions
    const accountRes = await runStatement(`SELECT account_number FROM accounts WHERE user_id = $1 LIMIT 1`, [userId])
    let transactions = []
    
    if (accountRes.rowCount > 0) {
      const primaryAccount = accountRes.rows[0].account_number
      const txRes = await runStatement(`
        SELECT *
        FROM transactions
        WHERE from_account = $1 OR to_account = $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [primaryAccount])
      transactions = txRes.rows
    }

    return Response.json({
      ok: true,
      totalBalance: Number(totalBalance),
      transactions
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
