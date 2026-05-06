import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb, getPool, closeDb } from './db.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(here, '..', 'migrations')

await initDb()
const pool = getPool()

await pool.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`)

const appliedRows = await pool.query('SELECT name FROM _migrations')
const applied = new Set(appliedRows.rows.map((r) => r.name))

const entries = await fs.readdir(migrationsDir, { withFileTypes: true })
const files = entries
  .filter((e) => e.isFile() && e.name.endsWith('.sql'))
  .map((e) => e.name)
  .sort()

for (const name of files) {
  if (applied.has(name)) continue

  const fullPath = path.join(migrationsDir, name)
  const sql = await fs.readFile(fullPath, 'utf8')

  console.log(`[migrate] applying ${name}`)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

console.log('[migrate] done')
await closeDb()

