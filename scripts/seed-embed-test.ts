import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })

  // google/swe 커뮤니티 ID 가져오기
  const [comm] = await sql`SELECT id FROM communities WHERE slug = 'companies/google/swe' LIMIT 1`

  // 테스트 유저
  const userId = randomUUID()
  await sql`INSERT INTO users (id, username, supabase_auth_id, karma) VALUES (${userId}, 'embed_test_anon', ${randomUUID()}, 0) ON CONFLICT DO NOTHING`
  const [u] = await sql`SELECT id FROM users WHERE username = 'embed_test_anon'`

  // 실제 r/cscareerquestions 포스트 임베드
  const postId = randomUUID()
  await sql`
    INSERT INTO posts (id, title, community_id, author_id, vote_score, interview_stage, embed_url, embed_type, created_at)
    VALUES (
      ${postId},
      'Got strong hire on all rounds, HC rejected me anyway — Google loop post-mortem',
      ${comm.id},
      ${u.id},
      47,
      'ONSITE',
      'https://www.reddit.com/r/cscareerquestions/comments/1cw0eas/got_strong_hire_on_3_of_4_google_rounds_hc/',
      'reddit',
      NOW()
    )
    ON CONFLICT DO NOTHING
  `
  console.log('Post ID:', postId)
  await sql.end()
}
main().catch(console.error)
