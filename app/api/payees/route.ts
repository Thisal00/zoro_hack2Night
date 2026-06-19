import { asText, runStatement, serviceFailure } from '@/lib/platform-db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = asText(searchParams.get('userId') || '1')

    const sql = `
      SELECT id, account_number as "accountNumber", account_name as "accountName", nickname, email, balance
      FROM payees
      WHERE user_id = ${userId}
      ORDER BY id DESC
    `
    const result = await runStatement(sql)

    return Response.json({
      ok: true,
      payees: result.rows
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = asText(body.userId || '1')
    
    // Check if delete
    if (body.action === 'delete') {
      await runStatement(`DELETE FROM payees WHERE id = ${Number(body.id)}`)
      return Response.json({ ok: true })
    }
    
    // Check if edit
    if (body.action === 'edit') {
      await runStatement(`
        UPDATE payees 
        SET account_number = '${asText(body.accountNumber)}',
            account_name = '${asText(body.accountName)}',
            nickname = '${asText(body.nickname)}'
        WHERE id = ${Number(body.id)}
      `)
      return Response.json({ ok: true })
    }

    // Otherwise insert
    const inserted = await runStatement(`
      INSERT INTO payees (user_id, account_number, account_name, nickname, email)
      VALUES (${userId}, '${asText(body.accountNumber)}', '${asText(body.accountName)}', '${asText(body.nickname)}', '${asText(body.email)}')
      ON CONFLICT (user_id, account_number) DO UPDATE 
      SET account_name = EXCLUDED.account_name, nickname = EXCLUDED.nickname, email = EXCLUDED.email
      RETURNING id, account_number as "accountNumber", account_name as "accountName", nickname, email
    `)

    return Response.json({
      ok: true,
      payee: inserted.rows[0]
    })
  } catch (reason) {
    return serviceFailure(reason)
  }
}
