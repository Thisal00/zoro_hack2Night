import crypto from 'node:crypto'
import { asText, ensureDatabase, pool, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

function constantTimeEquals(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

// Bill payment is a debit-only operation: money leaves the user's account to an
// external biller (no destination account to credit). Authorized by session +
// PIN + ownership + balance, recorded atomically — same guarantees as transfer.
export async function POST(request: Request) {
  try {
    const session = getSession(request)
    if (!session) {
      return Response.json(
        { ok: false, message: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const fromAccount = asText(body.fromAccount)
    const biller = asText(body.biller)
    const billAccountNumber = asText(body.accountNumber)
    const billId = asText(body.billId)
    const remarks = asText(body.remarks)
    const pin = asText(body.pin)
    const amount = Number(body.amount)

    if (!fromAccount || !biller) {
      return Response.json(
        { ok: false, message: 'fromAccount and biller are required.' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json(
        { ok: false, message: 'amount must be a positive number.' },
        { status: 400 }
      )
    }

    await ensureDatabase()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const locked = await client.query(
        `SELECT id, account_number, user_id, balance, pin
         FROM accounts
         WHERE account_number = $1
         FOR UPDATE`,
        [fromAccount]
      )
      const from = locked.rows[0]

      // Ownership: the source account must exist and belong to the caller.
      if (!from || from.user_id !== session.sub) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Source account not found or not yours.' },
          { status: 403 }
        )
      }

      if (!constantTimeEquals(pin, asText(from.pin))) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Invalid PIN.' },
          { status: 403 }
        )
      }

      if (Number(from.balance) < amount) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Insufficient funds.' },
          { status: 400 }
        )
      }

      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE account_number = $2',
        [amount, fromAccount]
      )
      const description = `Bill Payment - ${billId}${remarks ? ` ${remarks}` : ''}`
      const inserted = await client.query(
        `INSERT INTO transactions (from_account, to_account, amount, description, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          fromAccount,
          `${biller} (${billAccountNumber})`,
          amount,
          description,
          session.sub
        ]
      )

      await client.query('COMMIT')
      return Response.json({
        ok: true,
        message: 'Bill payment accepted.',
        transaction: inserted.rows[0]
      })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (reason) {
    return serviceFailure(reason)
  }
}
