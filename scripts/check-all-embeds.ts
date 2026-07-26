import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })
  const embedded = await sql`SELECT id, embed_type, title FROM posts WHERE embed_url IS NOT NULL ORDER BY created_at DESC`
  const total = await sql`SELECT COUNT(*) as n FROM posts`
  const noBody = await sql`SELECT COUNT(*) as n FROM posts WHERE body IS NULL AND embed_url IS NULL`
  console.log(`Total posts: ${total[0].n}`)
  console.log(`With embed_url: ${embedded.length}`)
  console.log(`No body & no embed: ${noBody[0].n}`)
  console.log('\nEmbed breakdown:')
  const byType: Record<string, number> = {}
  for (const r of embedded) {
    byType[r.embed_type] = (byType[r.embed_type] ?? 0) + 1
  }
  console.log(byType)
  await sql.end()
}
main().catch(console.error)
