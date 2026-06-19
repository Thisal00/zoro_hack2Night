import { Pool } from 'pg'

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:supersecurepassword@localhost:5432/htn26db'

export const pool = new Pool({
  connectionString,
  max: 3
})

let booted = false

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  nic TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  account_number TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  pin TEXT NOT NULL DEFAULT '0000'
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, account_number)
);
ALTER TABLE payees ADD COLUMN IF NOT EXISTS email TEXT;
`

const seed = `
INSERT INTO users (id, username, password, role, full_name, nic, email) VALUES
  (1, 'dilara', 'password123', 'customer', 'Dilara Perera', '200112345678', 'dilara@example.test'),
  (2, 'kasun', 'kasun', 'customer', 'Kasun Wickramanayake', '199812345678', 'kasun@example.test'),
  (3, 'admin', 'admin', 'admin', 'Platform Administrator', '000000000000', 'root@example.test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (user_id, account_number, account_name, balance, pin) VALUES
  (1, '1000003423', 'Dilara Savings', 100000.00, '1234'),
  (1, '1000004876', 'Dilara Expenses', 42000.00, '1234'),
  (2, '2000006754', 'Kasun Current', 9870.00, '0000'),
  (3, '9999999999', 'Admin Vault', 9999999.99, '9999')
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO transactions (from_account, to_account, amount, description, created_by) VALUES
  ('1000003423', '2000006754', 4500.00, 'Lunch money', 1),
  ('1000004876', '9999999999', 10000.00, 'Totally normal fee', 1),
  ('2000006754', '1000003423', 9870.00, 'Refund maybe', 2)
ON CONFLICT DO NOTHING;

INSERT INTO payees (user_id, account_number, account_name, nickname, email) VALUES
  (1, '2000006754', 'Kasun Wickramanayake', 'Kasun - Rent', 'kasun@example.test')
ON CONFLICT DO NOTHING;
`

export async function runStatement(sql: string) {
  await ensureDatabase()
  console.log('[bank-sql]', sql)
  return pool.query(sql)
}

export async function ensureDatabase() {
  if (booted) return
  await pool.query(schema)
  await pool.query(seed)

  // Inject 6 months of rich mock data for Dilara if not already injected
  const txCount = await pool.query('SELECT COUNT(*) FROM transactions')
  if (Number(txCount.rows[0].count) <= 3) {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    
    let injectedSql = 'INSERT INTO transactions (from_account, to_account, amount, description, created_at, created_by) VALUES '
    const values: string[] = []

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear
      
      const r1 = Math.floor(Math.random() * 5000)
      const r2 = Math.floor(Math.random() * 3000)
      const r3 = Math.floor(Math.random() * 2000)
      const r4 = Math.floor(Math.random() * 10000)
      
      // Income (Credit to 1000003423)
      values.push(`('9999999999', '1000003423', 350000, 'Monthly Salary', '${new Date(year, month, 15).toISOString()}', 3)`)
      
      // Expenses (Debit from 1000003423)
      values.push(`('1000003423', '9999999999', ${12000 + r1}, 'Keells Supermarket', '${new Date(year, month, 16).toISOString()}', 1)`)
      values.push(`('1000003423', '9999999999', ${6500 + r2}, 'Dinner at McDonald''s', '${new Date(year, month, 17).toISOString()}', 1)`)
      values.push(`('1000003423', '9999999999', 4500, 'Dialog Broadband Bill', '${new Date(year, month, 18).toISOString()}', 1)`)
      values.push(`('1000003423', '9999999999', ${6200 + r3}, 'CEB Electricity Bill', '${new Date(year, month, 19).toISOString()}', 1)`)
      values.push(`('1000003423', '9999999999', 3200, 'Netflix Subscription', '${new Date(year, month, 20).toISOString()}', 1)`)
      values.push(`('1000003423', '9999999999', ${15000 + r4}, 'Daraz Shopping', '${new Date(year, month, 21).toISOString()}', 1)`)
    }

    injectedSql += values.join(', ') + ';'
    await pool.query(injectedSql)
  }

  booted = true
}

export function asText(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function serviceFailure(reason: unknown) {
  const issue = reason as {
    message?: string
    code?: string
    detail?: string
    stack?: string
  }

  return Response.json(
    {
      ok: false,
      message: issue.message,
      code: issue.code,
      detail: issue.detail,
      trace: issue.stack,
      databaseUrl: connectionString
    },
    { status: 500 }
  )
}
