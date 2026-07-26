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
  // ── Reddit — real 2024/2025 rejection threads ──
  {
    communitySlug: 'companies/amazon',
    title: 'Amazon SDE 2025 — received a reject for different Job ID after rescheduled round',
    roleTitle: 'Software Development Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'amz_sde_2025_us',
    embedUrl: 'https://www.reddit.com/r/leetcode/comments/1mrb002/amazon_software_development_engineer_2025_us/',
    embedType: 'reddit',
    upvotes: 134,
  },
  {
    communitySlug: 'companies/meta',
    title: 'Meta New Grad 2025 interview experience — REJECTED',
    roleTitle: 'Software Engineer (New Grad)',
    stage: 'ONSITE',
    year: 2025,
    username: 'meta_ng_2025_reject',
    embedUrl: 'https://www.reddit.com/r/csMajors/comments/1hdj6iw/meta_new_grad_2025_interview_experience_rejected/',
    embedType: 'reddit',
    upvotes: 312,
  },
  {
    communitySlug: 'companies/meta',
    title: 'Meta interview sucked — got rejected after onsite',
    roleTitle: 'Software Engineer E4',
    stage: 'ONSITE',
    year: 2025,
    username: 'meta_onsite_reject_25',
    embedUrl: 'https://www.reddit.com/r/InterviewCoderHQ/comments/1pjrowi/meta_interview_sucked_got_rejected_after_onsite/',
    embedType: 'reddit',
    upvotes: 287,
  },
  {
    communitySlug: 'companies/apple',
    title: 'Apple SWE interview experience Summer 2025 — one rejection, one ghosting',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'apple_swe_2025_ghost',
    embedUrl: 'https://www.reddit.com/r/leetcode/comments/1m2nb19/apple_swe_interview_experience_summer_2025_one/',
    embedType: 'reddit',
    upvotes: 445,
  },
  {
    communitySlug: 'companies/google',
    title: 'Just failed a code review interview as 7 YOE — not sure what to feel',
    roleTitle: 'Senior Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'exp_devs_code_review_7yoe',
    embedUrl: 'https://www.reddit.com/r/ExperiencedDevs/comments/1r9c4pw/just_failed_a_code_review_interview_as_7_yoe_and/',
    embedType: 'reddit',
    upvotes: 891,
  },
  {
    communitySlug: 'companies/microsoft',
    title: 'With more than 15 years of experience but not able to crack interviews',
    roleTitle: 'Software Architect',
    stage: 'PHONE',
    year: 2025,
    username: 'exp_devs_15yoe_fail',
    embedUrl: 'https://www.reddit.com/r/ExperiencedDevs/comments/1hxvquw/with_more_than_15_years_of_experience_but_not/',
    embedType: 'reddit',
    upvotes: 1203,
  },

  // ── Medium — real rejection experience articles ──
  {
    communitySlug: 'companies/google',
    title: 'Google rejected me — what did I learn from the experience',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_rina_google_reject',
    embedUrl: 'https://rinagreen090296.medium.com/google-rejected-me-what-did-i-learn-from-the-experience-251fde9e941',
    embedType: 'medium',
    upvotes: 743,
  },
  {
    communitySlug: 'companies/google',
    title: 'My interview experience at Google — rejected',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_ankita_google',
    embedUrl: 'https://medium.com/@dodamaniankita13/my-interview-experience-at-google-rejected-caf555a72a52',
    embedType: 'medium',
    upvotes: 534,
  },
  {
    communitySlug: 'companies/google',
    title: 'Google rejected me 4 times — the 5th time I knew exactly what changed',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_google_4x_reject',
    embedUrl: 'https://medium.com/lets-code-future/google-rejected-me-4-times-the-5th-time-i-knew-exactly-what-changed-49834f138122',
    embedType: 'medium',
    upvotes: 2341,
  },
  {
    communitySlug: 'companies/google',
    title: "Failing Google's final round — what I learned",
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_shekhar_google_final',
    embedUrl: 'https://shekharpatil-tech.medium.com/failing-googles-final-round-what-i-learned-2ac0d18b040d',
    embedType: 'medium',
    upvotes: 1876,
  },
  {
    communitySlug: 'companies/meta',
    title: '6 months, 100 rejections, and finally an offer from Meta',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_100_rejections_meta',
    embedUrl: 'https://medium.com/ai-dev-lab/6-months-100-rejections-and-finally-an-offer-from-meta-how-james-fought-his-way-into-faang-2a168b29ac97',
    embedType: 'medium',
    upvotes: 3102,
  },
  {
    communitySlug: 'companies/meta',
    title: 'I got rejected from Meta because I got COVID-19',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_alex_meta_covid',
    embedUrl: 'https://realalexnguyen.medium.com/i-got-rejected-from-meta-because-i-got-covid-19-736fecb84713',
    embedType: 'medium',
    upvotes: 4218,
  },
  {
    communitySlug: 'companies/microsoft',
    title: 'Microsoft Senior Engineer interview experience 2025 — the offer that took three attempts',
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'medium_rohit_msft_3tries',
    embedUrl: 'https://medium.com/@rohitverma_87831/microsoft-senior-engineer-interview-experience-2026-the-offer-that-took-me-three-attempts-e0d6e052bdb1',
    embedType: 'medium',
    upvotes: 1654,
  },
  {
    communitySlug: 'companies/google',
    title: 'This is how Google rejected me — just to tell me yes the year after',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_pramp_google_yes_after',
    embedUrl: 'https://medium.com/pramp/this-is-how-google-rejected-me-just-to-tell-me-yes-the-year-after-d1c49dc53f88',
    embedType: 'medium',
    upvotes: 5891,
  },
  {
    communitySlug: 'companies/google',
    title: 'I failed 12 big tech interviews before realizing everyone ignores these 3 non-negotiables',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_12_fails_google',
    embedUrl: 'https://medium.com/@alaxhenry0121/i-failed-12-big-tech-interviews-before-realizing-everyone-ignores-these-3-non-negotiables-now-4bf2bbfa8d68',
    embedType: 'medium',
    upvotes: 7234,
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

    const existing = await sql`SELECT id FROM posts WHERE embed_url = ${p.embedUrl}`
    if (existing.length > 0) { console.log(`EXISTS: ${p.title.slice(0, 50)}`); continue }

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
    console.log(`✓ [${p.embedType.padEnd(8)}] ${p.title.slice(0, 60)}`)
    inserted++
  }

  console.log(`\nInserted: ${inserted} / ${POSTS.length}`)
  await sql.end()
}
main().catch(console.error)
