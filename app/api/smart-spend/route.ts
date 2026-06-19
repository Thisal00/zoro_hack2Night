import { runQuery, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    // All accounts belonging to the authenticated user.
    const accountRes = await runQuery(
      'SELECT account_number FROM accounts WHERE user_id = $1',
      [session.sub]
    )
    const accountNumbers = accountRes.rows.map((r) => r.account_number)

    if (accountNumbers.length === 0) {
      return Response.json({
        ok: true,
        totalSpent: 0,
        budgetRemaining: 0,
        totalIncome: 0,
        transactions: []
      })
    }

    let totalSpent = 0
    let totalIncome = 0
    const txRes = await runQuery(
      `SELECT * FROM transactions
       WHERE (from_account = ANY($1) OR to_account = ANY($1))
       ORDER BY created_at DESC LIMIT 50`,
      [accountNumbers]
    )

    const transactions = txRes.rows.map((tx) => {
      const isExpense = accountNumbers.includes(tx.from_account)
      if (isExpense) {
        totalSpent += Number(tx.amount)
      } else {
        totalIncome += Number(tx.amount)
      }

      let category = 'Other'
      const desc = tx.description?.toLowerCase() || ''
      if (
        desc.includes('food') ||
        desc.includes('lunch') ||
        desc.includes('super')
      )
        category = 'Food & Dining'
      else if (
        desc.includes('transport') ||
        desc.includes('uber') ||
        desc.includes('pickme')
      )
        category = 'Transport'
      else if (
        desc.includes('bill') ||
        desc.includes('ceb') ||
        desc.includes('water')
      )
        category = 'Bills & Utilities'

      return { ...tx, isExpense, category }
    })

    const budget = 250000
    const budgetRemaining = Math.max(0, budget - totalSpent)

    return Response.json({
      ok: true,
      totalSpent,
      budgetRemaining,
      totalIncome,
      transactions
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
