import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS embed_url TEXT`
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS embed_type TEXT`
  console.log('embed_url and embed_type columns added to posts')
  await sql.end()
}
main().catch(console.error)
