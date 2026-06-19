const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgresql:supersecurepassword@localhost:5432/htn26db'
});

async function main() {
  try {
    await pool.query("ALTER TABLE payees ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;");
    await pool.query("UPDATE payees SET balance = 15000 WHERE nickname = 'Test' AND balance = 0;");
    await pool.query("UPDATE payees SET balance = 24000 WHERE nickname = 'Kasun - Rent' AND balance = 0;");
    console.log('Added balance to payees!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
