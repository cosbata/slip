import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

  // Check user duplicates
  const dup = await sql`SELECT u.username, COUNT(p.id) as n FROM posts p JOIN users u ON p.author_id = u.id GROUP BY u.username HAVING COUNT(p.id) > 1`
  console.log('User duplicates:', dup.length === 0 ? '✅ None (1 user per post)' : dup)

  // Datadog post community check
  const dd = await sql`SELECT p.title, c.slug FROM posts p JOIN communities c ON p.community_id = c.id WHERE p.title ILIKE '%datadog%' OR p.body ILIKE '%Company**: Datadog%'`
  console.log('\nDatadog post communities:')
  dd.forEach((r) => console.log('  ' + r.slug + ' | ' + r.title.slice(0, 55)))

  // Role title sample check
  const roles = await sql`SELECT title, role_title FROM posts WHERE title ILIKE '%google%' OR title ILIKE '%amazon%' OR title ILIKE '%meta%' ORDER BY title LIMIT 12`
  console.log('\nRole title samples:')
  roles.forEach((r) => console.log('  ' + r.role_title.padEnd(40) + '| ' + r.title.slice(0, 40)))

  // New community samples
  const newComms = await sql`SELECT slug, name FROM communities WHERE slug LIKE '%system-design%' OR slug LIKE '%behavioral%' OR slug LIKE '%lld%' OR slug LIKE '%new-grad%' OR slug LIKE '%fintech%' ORDER BY slug LIMIT 20`
  console.log('\nNew sub-communities:')
  newComms.forEach((r) => console.log('  ' + r.slug))

  console.log('\nTotals:')
  const [posts, users, comms] = await Promise.all([
    sql`SELECT COUNT(*) as n FROM posts`,
    sql`SELECT COUNT(*) as n FROM users`,
    sql`SELECT COUNT(*) as n FROM communities`,
  ])
  console.log(`  Posts: ${posts[0].n} | Users: ${users[0].n} | Communities: ${comms[0].n}`)

  await sql.end()
}
main().catch(console.error)
