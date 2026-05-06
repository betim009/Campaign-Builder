import { initDb, getPool, closeDb } from './db.js'

await initDb()
const pool = getPool()

const countries = [
  { code: 'BR', name: 'Brasil', languageCode: 'PT' },
  { code: 'US', name: 'EUA', languageCode: 'EN' },
  { code: 'MX', name: 'México', languageCode: 'ES' },
  { code: 'AE', name: 'Emirados', languageCode: 'AR' },
  { code: 'FR', name: 'França', languageCode: 'FR' },
  { code: 'ES', name: 'Espanha', languageCode: 'ES' }
]

const objectives = [
  { key: 'TRAFFIC', label: 'Tráfego', metaValue: 'OUTCOME_TRAFFIC' },
  { key: 'LEADS', label: 'Leads', metaValue: 'OUTCOME_LEADS' },
  { key: 'SALES', label: 'Vendas', metaValue: 'OUTCOME_SALES' }
]

await pool.query('BEGIN')
try {
  for (const c of countries) {
    await pool.query(
      `
        INSERT INTO countries (code, name, language_code)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          language_code = EXCLUDED.language_code
      `,
      [c.code, c.name, c.languageCode]
    )
  }

  for (const o of objectives) {
    await pool.query(
      `
        INSERT INTO campaign_objectives (key, label, meta_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE SET
          label = EXCLUDED.label,
          meta_value = EXCLUDED.meta_value
      `,
      [o.key, o.label, o.metaValue]
    )
  }

  await pool.query('COMMIT')
} catch (err) {
  await pool.query('ROLLBACK')
  throw err
}

console.log('[seed] done')
await closeDb()

