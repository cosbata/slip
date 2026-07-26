import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 })
  const rows = await sql`
    SELECT role_title, COUNT(*)::int as n
    FROM posts
    WHERE role_title IS NOT NULL AND deleted_at IS NULL
    GROUP BY role_title ORDER BY n DESC LIMIT 20
  `
  rows.forEach(r => console.log(`${String(r.n).padStart(4)}  ${r.role_title}`))
  await sql.end()
}
main().catch(console.error)
