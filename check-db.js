const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgresql:supersecurepassword@localhost:5432/htn26db'
});

async function main() {
  try {
    const res = await pool.query('SELECT id, username FROM users;');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
