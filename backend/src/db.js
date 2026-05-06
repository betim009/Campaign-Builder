import { Pool } from 'pg'

let pool = null

export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return { enabled: false }
  }

  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
  }

  await pool.query('SELECT 1')
  return { enabled: true, databaseUrl }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database is not initialized. Set DATABASE_URL and call initDb() first.')
  }
  return pool
}

export async function closeDb() {
  if (pool) {
    const current = pool
    pool = null
    await current.end()
  }
}
