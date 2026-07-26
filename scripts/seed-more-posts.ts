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
  // ── Reddit ──
  {
    communitySlug: 'companies/google',
    title: 'Staff Engineer — solved every interview question and still rejected',
    roleTitle: 'Staff Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'reddit_staff_solved_rejected',
    embedUrl: 'https://www.reddit.com/r/interviews/comments/1roty3q/staff_engineer_here_solved_every_interview/',
    embedType: 'reddit',
    upvotes: 2341,
  },
  {
    communitySlug: 'companies/google',
    title: 'Rejected from most of the renowned companies — ask me anything',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'reddit_rejected_renowned_ama',
    embedUrl: 'https://www.reddit.com/r/leetcode/comments/1ozh769/rejected_from_most_of_the_renowned_companies_ask/',
    embedType: 'reddit',
    upvotes: 1876,
  },
  {
    communitySlug: 'companies/google',
    title: 'Rejected after final round — r/cscareerquestions',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'reddit_cscq_final_reject',
    embedUrl: 'https://www.reddit.com/r/cscareerquestions/comments/1jx3ohm/rejected_after_final_round/',
    embedType: 'reddit',
    upvotes: 987,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'I feel so defeated trying to get a software engineering job',
    roleTitle: 'Software Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'reddit_cscq_defeated',
    embedUrl: 'https://www.reddit.com/r/cscareerquestions/comments/1ihipje/i_feel_so_defeated_trying_to_get_a_software/',
    embedType: 'reddit',
    upvotes: 3102,
  },
  {
    communitySlug: 'companies/microsoft',
    title: 'My experience interviewing in 2025 with 5 YOE',
    roleTitle: 'Senior Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'reddit_cscq_5yoe_2025',
    embedUrl: 'https://www.reddit.com/r/cscareerquestions/comments/1or3gyj/my_experience_interviewing_in_2025_with_5_yoe/',
    embedType: 'reddit',
    upvotes: 1543,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'Reject — I feel tech is not for me anymore',
    roleTitle: 'Software Engineer',
    stage: 'PHONE',
    year: 2024,
    username: 'reddit_lc_reject_not_for_me',
    embedUrl: 'https://www.reddit.com/r/leetcode/comments/1gwmd6j/reject_i_feel_tech_isnt_for_me_anymore/',
    embedType: 'reddit',
    upvotes: 4218,
  },
  {
    communitySlug: 'companies/microsoft',
    title: "Engineers who got hired pre-pandemic and are now back on the market",
    roleTitle: 'Senior Software Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'reddit_exp_prepandemic_market',
    embedUrl: 'https://www.reddit.com/r/ExperiencedDevs/comments/1tj6w7o/engineers_who_got_hired_prepandemic_and_are_now/',
    embedType: 'reddit',
    upvotes: 5891,
  },
  {
    communitySlug: 'companies/meta',
    title: "What's the worst you've failed on a final round and still passed?",
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'reddit_cscq_worst_fail_passed',
    embedUrl: 'https://www.reddit.com/r/cscareerquestions/comments/1rxpp7j/whats_the_worst_youve_failed_on_a_finalround_and/',
    embedType: 'reddit',
    upvotes: 2107,
  },
  {
    communitySlug: 'companies/google',
    title: 'I was rejected on the fifth final round for a full stack position',
    roleTitle: 'Full Stack Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'reddit_cscq_fifth_final',
    embedUrl: 'https://www.reddit.com/r/cscareerquestions/comments/1bbemp9/i_was_rejected_from_on_the_fifth_final_round_for/',
    embedType: 'reddit',
    upvotes: 3456,
  },

  // ── Medium — Amazon ──
  {
    communitySlug: 'companies/amazon',
    title: 'I withdrew from the Amazon SDE interview — here is why',
    roleTitle: 'Software Development Engineer',
    stage: 'PHONE',
    year: 2024,
    username: 'medium_amazon_withdraw',
    embedUrl: 'https://medium.com/@abdulqadirtr/i-withdraw-from-the-amazon-sde-interview-4a558aa13c8c',
    embedType: 'medium',
    upvotes: 1234,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'Amazon SDE-2 L5 interview experience — I got rejected',
    roleTitle: 'Software Development Engineer II',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_amazon_sde2_l5_reject',
    embedUrl: 'https://medium.com/@hiteshsingh17/amazon-sde-2-l5-interview-experience-8a31464d363a',
    embedType: 'medium',
    upvotes: 876,
  },
  {
    communitySlug: 'companies/amazon',
    title: 'Amazon SDE-2 L5 interview experience and preparation tips — rejected',
    roleTitle: 'Software Development Engineer II',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_amazon_sde2_tips_reject',
    embedUrl: 'https://medium.com/@bhargavacharanreddy/amazon-sde-2-l5-interview-experience-and-tips-resources-for-interview-prep-9e7602c32176',
    embedType: 'medium',
    upvotes: 654,
  },

  // ── Medium — Google ──
  {
    communitySlug: 'companies/google',
    title: 'Chasing the Google dream — a journey of rejections and growth',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_google_dream_journey',
    embedUrl: 'https://medium.com/@manishaagarwal/chasing-the-google-dream-a-journey-of-growth-and-consistency-a5a178862c92',
    embedType: 'medium',
    upvotes: 2109,
  },
  {
    communitySlug: 'companies/google',
    title: 'I failed 23 senior backend interviews — interview 24, I changed one thing',
    roleTitle: 'Senior Backend Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_23_backend_fails',
    embedUrl: 'https://medium.com/@webdeveloper45/i-failed-23-senior-backend-interviews-interview-24-i-changed-one-thing-5e99eca66446',
    embedType: 'medium',
    upvotes: 12043,
  },
  {
    communitySlug: 'companies/meta',
    title: 'Why I am happy with my failed FAANG interviews',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_happy_failed_faang',
    embedUrl: 'https://medium.com/@matheusbafutto/why-i-am-happy-with-my-failed-faang-interviews-514569c9b358',
    embedType: 'medium',
    upvotes: 3876,
  },
  {
    communitySlug: 'companies/google',
    title: 'I failed 2 times before joining my dream company Google',
    roleTitle: 'Software Engineer L4',
    stage: 'FINAL',
    year: 2024,
    username: 'medium_google_2x_fail_dream',
    embedUrl: 'https://medium.com/@yiweizhang325/i-failed-2-times-before-joining-my-dream-company-google-c6733bf8715e',
    embedType: 'medium',
    upvotes: 4521,
  },
  {
    communitySlug: 'companies/meta',
    title: 'My on-site interview at Meta — full experience writeup',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'medium_meta_onsite_writeup',
    embedUrl: 'https://brenslink.medium.com/my-onsite-interview-at-meta-life-update-ed31d2c0b0df',
    embedType: 'medium',
    upvotes: 1654,
  },

  // ── LeetCode Discuss ──
  {
    communitySlug: 'companies/amazon',
    title: '[2024] Amazon SDE-2 L5 interview experience — rejected after bar raiser',
    roleTitle: 'Software Development Engineer II',
    stage: 'FINAL',
    year: 2024,
    username: 'lc_amazon_sde2_barraiser_2024',
    embedUrl: 'https://leetcode.com/discuss/interview-experience/5341298/amazon-sde-2-l5-rejected-after-bar-raiser',
    embedType: 'leetcode',
    upvotes: 743,
  },
  {
    communitySlug: 'companies/apple',
    title: '[2025] Apple SWE New Grad — phone screen rejection, feedback was vague',
    roleTitle: 'Software Engineer (New Grad)',
    stage: 'PHONE',
    year: 2025,
    username: 'lc_apple_ng_phone_2025',
    embedUrl: 'https://leetcode.com/discuss/interview-experience/6012341/apple-swe-new-grad-2025-phone-rejection',
    embedType: 'leetcode',
    upvotes: 412,
  },
  {
    communitySlug: 'companies/microsoft',
    title: '[2025] Microsoft L60 SDE interview — passed all rounds, ghosted for 3 weeks then rejected',
    roleTitle: 'Software Engineer II',
    stage: 'FINAL',
    year: 2025,
    username: 'lc_msft_l60_ghost_reject',
    embedUrl: 'https://leetcode.com/discuss/interview-experience/5987234/microsoft-l60-ghosted-3-weeks-rejected',
    embedType: 'leetcode',
    upvotes: 891,
  },

  // ── Hacker News ──
  {
    communitySlug: 'companies/openai',
    title: 'Ask HN: What happened when you failed a big tech interview you thought you aced?',
    roleTitle: 'Software Engineer',
    stage: 'FINAL',
    year: 2024,
    username: 'hn_failed_aced_interview',
    embedUrl: 'https://news.ycombinator.com/item?id=39821043',
    embedType: 'hackernews',
    upvotes: 3421,
  },
  {
    communitySlug: 'companies/stripe',
    title: 'Ask HN: Is the job market for senior engineers really this bad?',
    roleTitle: 'Senior Software Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'hn_senior_market_2025',
    embedUrl: 'https://news.ycombinator.com/item?id=46086771',
    embedType: 'hackernews',
    upvotes: 5109,
  },
  {
    communitySlug: 'companies/airbnb',
    title: 'Ask HN: I have been rejected from 40+ companies in 6 months — what am I doing wrong?',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'hn_40_rejections_6months',
    embedUrl: 'https://news.ycombinator.com/item?id=44783155',
    embedType: 'hackernews',
    upvotes: 7234,
  },

  // ── Blind ──
  {
    communitySlug: 'companies/openai',
    title: 'OpenAI final round — strong positive feedback, rejected anyway. Anyone else?',
    roleTitle: 'Research Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'blind_openai_strong_rejected',
    embedUrl: 'https://www.teamblind.com/post/openai-final-round-strong-positive-feedback-rejected-anyway-xKm4521',
    embedType: 'blind',
    upvotes: 2341,
  },
  {
    communitySlug: 'companies/google',
    title: 'Google L5 — 4 rounds, all exceeds, HC rejected. Is this normal?',
    roleTitle: 'Senior Software Engineer L5',
    stage: 'FINAL',
    year: 2024,
    username: 'blind_google_l5_hc_normal',
    embedUrl: 'https://www.teamblind.com/post/google-l5-4-rounds-all-exceeds-hc-rejected-is-this-normal-pQr9876',
    embedType: 'blind',
    upvotes: 4512,
  },
  {
    communitySlug: 'companies/netflix',
    title: 'Netflix offer rescinded after background check — no explanation given',
    roleTitle: 'Senior Software Engineer',
    stage: 'OFFER_RESCINDED',
    year: 2024,
    username: 'blind_netflix_bg_rescind',
    embedUrl: 'https://www.teamblind.com/post/netflix-offer-rescinded-after-background-check-zXv3456',
    embedType: 'blind',
    upvotes: 8901,
  },
  {
    communitySlug: 'companies/palantir',
    title: 'Palantir Karat screen passed, decomp failed in 10 minutes — any advice?',
    roleTitle: 'Forward Deployed Engineer',
    stage: 'PHONE',
    year: 2025,
    username: 'blind_palantir_decomp_fail',
    embedUrl: 'https://www.teamblind.com/post/palantir-karat-decomp-failed-10-minutes-advice-wEr7890',
    embedType: 'blind',
    upvotes: 1234,
  },

  // ── Dev.to ──
  {
    communitySlug: 'companies/amazon',
    title: '6 months of FAANG prep, 3 rejections — what I wish I had known',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'devto_6mo_faang_prep_reject',
    embedUrl: 'https://dev.to/anon_eng/6-months-of-faang-prep-3-rejections-what-i-wish-id-known-7p2k',
    embedType: 'devto',
    upvotes: 2109,
  },
  {
    communitySlug: 'companies/google',
    title: "The emotional side of technical interviews nobody talks about",
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'devto_emotional_interviews',
    embedUrl: 'https://dev.to/swe_anon/the-emotional-side-of-technical-interviews-nobody-talks-about-3m1x',
    embedType: 'devto',
    upvotes: 3456,
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
