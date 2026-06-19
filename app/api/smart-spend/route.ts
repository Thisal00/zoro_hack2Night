import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = asText(searchParams.get('userId') || '1')

    // Get all accounts for user
    const accountRes = await runStatement(`SELECT account_number FROM accounts WHERE user_id = $1`, [userId])
    const accountNumbers = accountRes.rows.map(r => r.account_number)

    if (accountNumbers.length === 0) {
      return Response.json({ ok: true, totalSpent: 0, budgetRemaining: 0, totalIncome: 0, transactions: [] })
    }

    // Get all transactions where from_account is in user's accounts
    // For simplicity, we just look at the last 30 days
    let totalSpent = 0
    let totalIncome = 0
    const txRes = await runStatement(`
      SELECT * FROM transactions 
      WHERE (from_account = ANY($1) OR to_account = ANY($1))
      ORDER BY created_at DESC LIMIT 50
    `, [accountNumbers])

    const transactions = txRes.rows.map(tx => {
      // Determine if expense or income
      let isExpense = accountNumbers.includes(tx.from_account)
      if (isExpense) {
        totalSpent += Number(tx.amount)
      } else {
        totalIncome += Number(tx.amount)
      }

      // Simple category mapping based on description
      let category = 'Other'
      const desc = tx.description?.toLowerCase() || ''
      if (desc.includes('food') || desc.includes('lunch') || desc.includes('super')) category = 'Food & Dining'
      else if (desc.includes('transport') || desc.includes('uber') || desc.includes('pickme')) category = 'Transport'
      else if (desc.includes('bill') || desc.includes('ceb') || desc.includes('water')) category = 'Bills & Utilities'

      return {
        ...tx,
        isExpense,
        category
      }
    })

    // Fixed budget logic for demonstration
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
