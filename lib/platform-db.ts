import crypto from 'node:crypto'
import { Pool } from 'pg'
import { hashPassword } from './password'

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
`

// Demo users. Passwords are hashed at seed time — never stored in plaintext.
const seedUsers = [
  {
    id: 1,
    username: 'dilara',
    password: 'password123',
    role: 'customer',
    full_name: 'Dilara Perera',
    nic: '200112345678',
    email: 'dilara@example.test'
  },
  {
    id: 2,
    username: 'kasun',
    password: 'kasun',
    role: 'customer',
    full_name: 'Kasun Wickramanayake',
    nic: '199812345678',
    email: 'kasun@example.test'
  },
  {
    id: 3,
    username: 'admin',
    password: 'admin',
    role: 'admin',
    full_name: 'Platform Administrator',
    nic: '000000000000',
    email: 'root@example.test'
  }
]

const seed = `
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
`

export async function runQuery(text: string, params: unknown[] = []) {
  await ensureDatabase()
  return pool.query(text, params)
}

export async function ensureDatabase() {
  if (booted) return
  await pool.query(schema)

  for (const u of seedUsers) {
    const password = await hashPassword(u.password)
    // Upsert so any pre-existing plaintext password rows are migrated to a hash.
    await pool.query(
      `INSERT INTO users (id, username, password, role, full_name, nic, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
         SET password = EXCLUDED.password
         WHERE NOT (users.password LIKE 'scrypt$%')`,
      [u.id, u.username, password, u.role, u.full_name, u.nic, u.email]
    )
  }

  await pool.query(seed)
  booted = true
}

export function asText(value: unknown) {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function serviceFailure(reason: unknown) {
  // Log the full error (message, code, stack, etc.) server-side only, keyed by
  // an id the client can quote. Never leak internals or the connection string.
  const errorId = crypto.randomUUID()
  console.error(`[service-failure ${errorId}]`, reason)

  return Response.json(
    {
      ok: false,
      message: 'Internal server error.',
      errorId
    },
    { status: 500 }
  )
}
