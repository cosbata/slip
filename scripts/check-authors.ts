import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

  const dist = await sql`
    SELECT u.username, COUNT(p.id) as post_count
    FROM posts p JOIN users u ON p.author_id = u.id
    GROUP BY u.username ORDER BY post_count DESC`
  console.log('=== 유저별 포스트 수 ===')
  dist.forEach((r) => console.log(r.username + ': ' + r.post_count + '개'))

  const total = await sql`SELECT COUNT(*) as n FROM posts`
  const users = await sql`SELECT COUNT(*) as n FROM users`
  console.log('\n총 포스트:', total[0].n, '/ 총 유저:', users[0].n)

  console.log('\n=== Datadog 포스트 커뮤니티 확인 ===')
  const dd = await sql`
    SELECT p.title, c.slug
    FROM posts p JOIN communities c ON p.community_id = c.id
    WHERE p.title ILIKE '%datadog%' OR p.body ILIKE '**Company**: Datadog%'`
  dd.forEach((r) => console.log(r.slug + ' | ' + r.title.slice(0, 65)))

  console.log('\n=== 전체 커뮤니티-포스트 매핑 샘플 ===')
  const sample = await sql`
    SELECT c.slug, p.title
    FROM posts p JOIN communities c ON p.community_id = c.id
    ORDER BY c.slug, p.title LIMIT 80`
  sample.forEach((r) => console.log(r.slug.padEnd(35) + '| ' + r.title.slice(0, 55)))

  await sql.end()
}
main().catch(console.error)
