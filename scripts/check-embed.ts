import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  const [p] = await sql`SELECT id, title, embed_url, embed_type FROM posts WHERE id = 'c8d1224b-c7ed-4874-9b19-ff5305ddbb06'`
  console.log(p)
  await sql.end()
}
main().catch(console.error)
