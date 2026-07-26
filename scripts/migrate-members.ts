import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  await sql`
    CREATE TABLE IF NOT EXISTS community_members (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, community_id)
    )
  `
  console.log('community_members table created')
  await sql.end()
}
main().catch(console.error)
