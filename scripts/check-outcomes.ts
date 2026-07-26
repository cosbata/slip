import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  const roles = await sql`SELECT role_title, COUNT(*) as n FROM posts WHERE role_title IS NOT NULL AND role_title != '' GROUP BY role_title ORDER BY n DESC LIMIT 20`
  console.log('Roles:'); roles.forEach((r) => console.log(' ', r.n, r.role_title))
  await sql.end()
}
main().catch(console.error)
