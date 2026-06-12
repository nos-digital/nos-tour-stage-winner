import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'tour',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'tour',
  connectionLimit: 50,
  // Return DATE columns as 'YYYY-MM-DD' strings instead of JS Date objects.
  dateStrings: true,
});

export async function waitForDatabase(retries = 30, delayMs = 1000) {
  for (let attempt = 1; ; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log(`Database not ready (attempt ${attempt}/${retries}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
