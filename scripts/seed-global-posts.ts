import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

const COMMUNITY_IDS: Record<string, string> = {
  'companies/google':    '5c49bc74-6ee1-47fe-862d-84e455a0f654',
  'companies/amazon':    'aea71518-3c54-4a0b-a421-c9d7ff203d88',
  'companies/meta':      '09f60224-0737-4a5f-8f17-e78d75841175',
  'companies/apple':     '92ad0399-5a98-4de5-a709-c49a992fb45d',
  'companies/microsoft': '09233753-6116-46be-9466-7eeba04cd741',
  'companies/stripe':    'c4609668-607f-41ee-86a3-5b82fb7067b5',
  'companies/netflix':   'f91a4f85-dd0b-4141-ae45-1457fa7c44ff',
  'companies/airbnb':    '0406f32e-357b-4a88-9153-e3994da8f7d6',
  'companies/openai':    'f3c2f41c-fe6c-416f-9772-1c2c4abde3c3',
  'companies/uber':      '361a5cd8-5833-4316-84e6-c548005abb65',
  'companies/palantir':  '74f40faf-37ad-44e8-b605-f8a1d8a89e1b',
}

type Stage = 'SCREEN' | 'PHONE' | 'ONSITE' | 'FINAL' | 'OFFER_RESCINDED'

type PostData = {
  communitySlug: string
  title: string
  roleTitle: string
  stage: Stage
  year: number
  username: string
  embedUrl: string
  embedType: string
  upvotes?: number
}

const POSTS: PostData[] = [
  // ── Blind (미국 한인 테크 커뮤니티) ──
  {
    communitySlug: 'companies/google',
    title: "L5 loop done, all strong hire, got PIP'd into rejection at committee",
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'goog_l5_shadow',
    embedUrl: 'https://www.teamblind.com/post/L5-loop-done-all-strong-hire-got-PIPd-into-rejection-at-committee-aBc1234',
    embedType: 'blind',
    upvotes: 412,
  },
  {
    communitySlug: 'companies/meta',
    title: 'E5 offer rescinded 3 days before start date — no explanation',
    roleTitle: 'Staff Software Engineer',
    stage: 'OFFER_RESCINDED',
    year: 2025,
    username: 'meta_rescind_e5',
    embedUrl: 'https://www.teamblind.com/post/E5-offer-rescinded-3-days-before-start-date-no-explanation-xYz9876',
    embedType: 'blind',
    upvotes: 891,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'Bar raiser killed my loop — disagree with feedback but no recourse',
    roleTitle: 'Software Development Engineer II',
    stage: 'FINAL',
    year: 2024,
    username: 'amz_bar_raiser_victim',
    embedUrl: 'https://www.teamblind.com/post/Bar-raiser-killed-my-loop-disagree-with-feedback-but-no-recourse-mNo5432',
    embedType: 'blind',
    upvotes: 1203,
  },

  // ── Hacker News ──
  {
    communitySlug: 'companies/stripe',
    title: 'My Stripe interview experience: 6 rounds, great process, then a hiring freeze',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'hn_stripe_freeze',
    embedUrl: 'https://news.ycombinator.com/item?id=39821043',
    embedType: 'hackernews',
    upvotes: 267,
  },
  {
    communitySlug: 'companies/openai',
    title: 'Ask HN: Anyone else get ghosted after the OpenAI final round?',
    roleTitle: 'Research Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'hn_oai_ghost',
    embedUrl: 'https://news.ycombinator.com/item?id=41203847',
    embedType: 'hackernews',
    upvotes: 445,
  },

  // ── LinkedIn ──
  {
    communitySlug: 'companies/microsoft',
    title: "I interviewed at Microsoft 4 times in 3 years — here's what finally changed",
    roleTitle: 'Senior Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'msft_fourth_attempt',
    embedUrl: 'https://www.linkedin.com/posts/anon-swe_microsoft-interview-rejection-activity-7189234567890123456',
    embedType: 'linkedin',
    upvotes: 2341,
  },
  {
    communitySlug: 'companies/netflix',
    title: "Netflix rejected me for culture fit after 5 technical rounds — my honest reflection",
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'nflx_culture_fit',
    embedUrl: 'https://www.linkedin.com/posts/anon-dev_netflix-culture-interview-activity-7201234567890123456',
    embedType: 'linkedin',
    upvotes: 3102,
  },

  // ── LeetCode Discuss ──
  {
    communitySlug: 'companies/google',
    title: '[Experience] Google L4 New Grad — passed all rounds, HC rejected, appealed and lost',
    roleTitle: 'Software Engineer L4',
    stage: 'FINAL',
    year: 2025,
    username: 'lc_google_hc_appeal',
    embedUrl: 'https://leetcode.com/discuss/interview-experience/5432198/google-l4-new-grad-hc-rejected-appealed-lost',
    embedType: 'leetcode',
    upvotes: 892,
  },
  {
    communitySlug: 'companies/amazon',
    title: '[2024] Amazon SDE2 — Cleared LP rounds, failed system design by one answer',
    roleTitle: 'Software Development Engineer II',
    stage: 'ONSITE',
    year: 2024,
    username: 'lc_amz_lp_cleared',
    embedUrl: 'https://leetcode.com/discuss/interview-experience/4918273/amazon-sde2-cleared-lp-failed-system-design',
    embedType: 'leetcode',
    upvotes: 534,
  },

  // ── Dev.to ──
  {
    communitySlug: 'companies/airbnb',
    title: "I failed my Airbnb system design interview — and I'm grateful",
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'devto_airbnb_grateful',
    embedUrl: 'https://dev.to/anon_dev/i-failed-my-airbnb-system-design-interview-and-im-grateful-4k2m',
    embedType: 'devto',
    upvotes: 743,
  },

  // ── Medium ──
  {
    communitySlug: 'companies/palantir',
    title: "Palantir's Decomp Interview Broke Me — and Then Made Me a Better Engineer",
    roleTitle: 'Forward Deployed Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_palantir_decomp',
    embedUrl: 'https://medium.com/@engineer_anon/palantirs-decomp-interview-broke-me-b7a1c2d3e4f5',
    embedType: 'medium',
    upvotes: 1891,
  },

  // ── 中文 플랫폼 (중국) ──
  {
    communitySlug: 'companies/google',
    title: 'Google L5面试全过 — 被HC拒绝后的复盘（附题目整理）',
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'zhihu_google_hc',
    embedUrl: 'https://www.zhihu.com/question/596234871/answer/3001234567',
    embedType: 'zhihu',
    upvotes: 3421,
  },
  {
    communitySlug: 'companies/microsoft',
    title: '微软三轮面试全过，offer被冻结——2024年HC冻结实录',
    roleTitle: 'Software Engineer II',
    stage: 'FINAL',
    year: 2024,
    username: 'zhihu_msft_frozen',
    embedUrl: 'https://www.zhihu.com/question/623451298/answer/3234567890',
    embedType: 'zhihu',
    upvotes: 2108,
  },
  {
    communitySlug: 'companies/amazon',
    title: '亚马逊SDE2被bar raiser否掉全记录 | 牛客面经',
    roleTitle: 'Software Development Engineer II',
    stage: 'FINAL',
    year: 2025,
    username: 'nowcoder_amz_barraiser',
    embedUrl: 'https://www.nowcoder.com/discuss/353142801234567',
    embedType: 'nowcoder',
    upvotes: 1567,
  },
  {
    communitySlug: 'companies/meta',
    title: 'Meta E5海外校招全聊 — 最终轮被pass原因分析 | 牛客',
    roleTitle: 'Software Engineer E5',
    stage: 'FINAL',
    year: 2024,
    username: 'nowcoder_meta_e5',
    embedUrl: 'https://www.nowcoder.com/discuss/253142891234567',
    embedType: 'nowcoder',
    upvotes: 2234,
  },

  // ── 日本語プラットフォーム (일본) ──
  {
    communitySlug: 'companies/google',
    title: 'Google Japanの面接を全通過してHCで落ちた話 — 振り返りと学び',
    roleTitle: 'Software Engineer L4',
    stage: 'FINAL',
    year: 2024,
    username: 'note_google_jp_hc',
    embedUrl: 'https://note.com/engineer_anon/n/n1a2b3c4d5e6f',
    embedType: 'note',
    upvotes: 892,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'Amazon Japanに3回落ちて、4回目でやっと通った話',
    roleTitle: 'Software Development Engineer',
    stage: 'PHONE',
    year: 2024,
    username: 'note_amazon_jp_3tries',
    embedUrl: 'https://note.com/swe_diary_jp/n/n9z8y7x6w5v4',
    embedType: 'note',
    upvotes: 1243,
  },

  // ── 한국 플랫폼 ──
  {
    communitySlug: 'companies/google',
    title: '구글 코리아 L5 최종 합격 후 HC 거절 후기 — 4개월의 기록',
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'blind_korea_google_hc',
    embedUrl: 'https://www.teamblind.com/ko/post/%EA%B5%AC%EA%B8%80-L5-HC-%EA%B1%B0%EC%A0%88-%ED%9B%84%EA%B8%B0-kR1234567',
    embedType: 'blind',
    upvotes: 1876,
  },

  // ── Jointaro ──
  {
    communitySlug: 'companies/uber',
    title: 'Uber SWE 2025: Passed system design, ghosted after behavioral — timeline inside',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'jointaro_uber_ghost',
    embedUrl: 'https://www.jointaro.com/interview-experiences/uber/swe-2025-passed-system-design-ghosted-after-behavioral',
    embedType: 'jointaro',
    upvotes: 321,
  },
  {
    communitySlug: 'companies/stripe',
    title: "Stripe L4 write-up: the work trial that ended my candidacy",
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'jointaro_stripe_trial',
    embedUrl: 'https://www.jointaro.com/interview-experiences/stripe/l4-write-up-the-work-trial-that-ended-my-candidacy',
    embedType: 'jointaro',
    upvotes: 445,
  },
]

function randomPast(year: number) {
  const start = new Date(`${year}-01-01`).getTime()
  const end = Math.min(new Date(`${year}-12-31`).getTime(), Date.now())
  return new Date(start + Math.random() * (end - start))
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 2 })

  let inserted = 0
  for (const p of POSTS) {
    const communityId = COMMUNITY_IDS[p.communitySlug]
    if (!communityId) { console.log(`SKIP: unknown community ${p.communitySlug}`); continue }

    // Check if a post with the same embed_url already exists
    const existing = await sql`SELECT id FROM posts WHERE embed_url = ${p.embedUrl}`
    if (existing.length > 0) { console.log(`EXISTS: ${p.title.slice(0, 50)}`); continue }

    // Ensure user exists
    const [user] = await sql`
      INSERT INTO users (id, username, supabase_auth_id, karma)
      VALUES (${randomUUID()}, ${p.username}, ${randomUUID()}, 0)
      ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `

    const createdAt = randomPast(p.year)
    await sql`
      INSERT INTO posts (
        id, title, body, embed_url, embed_type,
        community_id, author_id,
        role_title, interview_stage, rejection_year,
        vote_score, created_at
      ) VALUES (
        ${randomUUID()}, ${p.title}, NULL, ${p.embedUrl}, ${p.embedType},
        ${communityId}, ${user.id},
        ${p.roleTitle}, ${p.stage}, ${p.year},
        ${p.upvotes ?? Math.floor(Math.random() * 500 + 50)}, ${createdAt}
      )
    `
    console.log(`✓ [${p.embedType.padEnd(12)}] ${p.title.slice(0, 55)}`)
    inserted++
  }

  console.log(`\nInserted: ${inserted} / ${POSTS.length}`)
  await sql.end()
}
main().catch(console.error)
