import { Pool } from 'pg';

// PostgreSQL database ekata connect wena pool eka hadanawa
// (Meka oya kalin hadapu .env.local file eke thiyena DATABASE_URL eka use karanawa)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Database eka check karala 'users' table eka nattam aluthen hadanna me function eka use karanawa
export async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    // Query eka run karanawa
    await pool.query(createTableQuery);
    console.log(" Database initialized: 'users' table is ready.");
  } catch (error) {
    console.error(" Error initializing database:", error);
  }
}