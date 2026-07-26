import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  const [p] = await sql`SELECT id, title, body FROM posts WHERE body ILIKE '%source%' AND body ILIKE '%http%' LIMIT 1`
  if (p) {
    console.log('TITLE:', p.title)
    console.log('BODY END:', p.body?.slice(-300))
  }
  await sql.end()
}
main().catch(console.error)
