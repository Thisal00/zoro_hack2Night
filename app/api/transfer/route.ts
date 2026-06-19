import crypto from 'node:crypto'
import { asText, ensureDatabase, pool, serviceFailure } from '@/lib/platform-db'
import { getSession } from '@/lib/session'

function constantTimeEquals(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

export async function POST(request: Request) {
  try {
    // 1. Require an authenticated session.
    const session = getSession(request)
    if (!session) {
      return Response.json({ ok: false, message: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const fromAccount = asText(body.fromAccount || body.from)
    const toAccount = asText(body.toAccount || body.to)
    const pin = asText(body.pin)
    const description = asText(body.description)
    const amount = Number(body.amount)

    // 2. Validate input.
    if (!fromAccount || !toAccount) {
      return Response.json(
        { ok: false, message: 'fromAccount and toAccount are required.' },
        { status: 400 }
      )
    }
    if (fromAccount === toAccount) {
      return Response.json(
        { ok: false, message: 'Cannot transfer to the same account.' },
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

      // 3. Lock both accounts in a deterministic order (by account_number) to
      // avoid deadlocks between concurrent opposite-direction transfers.
      const locked = await client.query(
        `SELECT id, account_number, user_id, balance, pin
         FROM accounts
         WHERE account_number IN ($1, $2)
         ORDER BY account_number
         FOR UPDATE`,
        [fromAccount, toAccount]
      )
      const from = locked.rows.find((r) => r.account_number === fromAccount)
      const to = locked.rows.find((r) => r.account_number === toAccount)

      // 4. Ownership: the source account must exist and belong to the caller.
      if (!from || from.user_id !== session.sub) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Source account not found or not yours.' },
          { status: 403 }
        )
      }

      // 5. PIN verification (constant-time).
      if (!constantTimeEquals(pin, asText(from.pin))) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Invalid PIN.' },
          { status: 403 }
        )
      }

      // 6. Destination must exist.
      if (!to) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Destination account not found.' },
          { status: 404 }
        )
      }

      // 7. Sufficient funds (no overdraft).
      if (Number(from.balance) < amount) {
        await client.query('ROLLBACK')
        return Response.json(
          { ok: false, message: 'Insufficient funds.' },
          { status: 400 }
        )
      }

      // 8. Debit, credit, and record — all atomic.
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE account_number = $2',
        [amount, fromAccount]
      )
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE account_number = $2',
        [amount, toAccount]
      )
      const inserted = await client.query(
        `INSERT INTO transactions (from_account, to_account, amount, description, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [fromAccount, toAccount, amount, description, session.sub]
      )

      await client.query('COMMIT')
      return Response.json({
        ok: true,
        message: 'Transfer accepted.',
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
