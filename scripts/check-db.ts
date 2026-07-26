import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })
  const comms = await sql`SELECT slug, id FROM communities ORDER BY track, slug`
  console.log('TOTAL COMMUNITIES:', comms.length)
  comms.forEach((c) => console.log(c.slug + ' | ' + c.id))
  const users = await sql`SELECT id, username FROM users LIMIT 10`
  console.log('\nUSERS:', users.length)
  users.forEach((u) => console.log(u.id + ' | ' + u.username))
  const postCount = await sql`SELECT COUNT(*) FROM posts`
  console.log('\nPOST COUNT:', postCount[0].count)
  await sql.end()
}
main().catch(console.error)
