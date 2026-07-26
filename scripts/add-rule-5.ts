import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  const newRule = '5. No verbatim questions||Describe your experience, difficulty, and approach — do not reproduce exact problem statements, proprietary test content, or word-for-word interview questions.'
  const result = await sql`
    UPDATE communities
    SET sidebar_rules = sidebar_rules || E'\n' || ${newRule}
    WHERE sidebar_rules IS NOT NULL AND sidebar_rules != ''
  `
  console.log(`Updated ${result.count} communities`)
  await sql.end()
}
main().catch(console.error)
