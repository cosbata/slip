import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

const DISCLAIMER = '\n\n---\n*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*'

// ── Community IDs ──────────────────────────────────────────────────────────────
const COMMUNITY_IDS: Record<string, string> = {
  'investors/yc':           '88849f07-e5fa-4de0-9c75-3b6c1d65efd2',
  'investors/a16z':         'ab3ca472-c519-4fec-9682-0b222338701d',
  'investors/sequoia':      '7f68cc47-18e0-4c47-bced-9cb26244ce7a',
  'investors/benchmark':    '45488c58-db21-4a9c-bb27-8f074812c3c7',
  'investors/first-round':  '12a127b3-5f29-4499-aa9a-6a5cb536e64c',
  'investors/founders-fund':'323d7281-dfdd-42f4-b883-3b1790ff2de8',
}

// ── Short post bodies (150-200 words, 2 paragraphs) ──────────────────────────
const SHORT_POSTS: Record<string, string> = {
  'Overcomplicated a two-pointer problem':
    `SDE-II loop. Round 1 was a clean two-pointer problem — I did not see it that way in the moment. I anchored on a complicated memoization approach and committed to it long past the point where stepping back was obvious. The interviewer gave me a real hint, gently nudging toward scanning from both ends. I heard it, acknowledged it, and kept going down my own road.\n\nThat round came back No Hire. The lesson: when an interviewer offers a hint, stop, restate what they are pointing at, and pivot. A hint is not a suggestion you can decline.${DISCLAIMER}`,

  'Got the personalized "you passed our screen" email':
    `I applied for a SWE internship as an undergrad. My resume cleared the ATS — I know because I got an actual personalized email with a real person's name and specific references to my background. For about a day I let myself believe I had broken through the part everyone says is hardest.\n\nThen the rejection. Not for fit, not for skills — for eligibility. The role required candidates to be in their penultimate or final year, and I was not far enough along. Not yet, not this role, not this timeline. Three different things, none of them "not good enough."${DISCLAIMER}`,

  'Three rounds, every interviewer seemed satisfied':
    `New grad loop. Round one was LP behavioral. Round two was system design — URL shortener — which I had prepped and felt good about. Round three was LP and coding. The interviewers seemed satisfied. I let myself believe, fully, that I had it.\n\nThe rejection came in July. Satisfied-looking interviewers are not a scorecard. Engagement is not endorsement. Somewhere across those three rounds there was a gap a bar raiser saw and I did not. "I had it" is hope wearing information's clothes.${DISCLAIMER}`,

  'Crushed the middle of the loop':
    `Five rounds in a single day. Coding 1: tree BFS, missed optimal space. Behavioral: good. System design: post-search, genuinely collaborative. Coding 2: tree BFS again, got both optimal. Then a supplemental round — hard palindrome partitioning plus Grid DFS — and under the fatigue of round five I froze.\n\nRejection came the same day. I spent my best energy on the system design I was already going to pass and had nothing left for the supplemental that actually decided the outcome. Full five-problem mock days are the only real prep.${DISCLAIMER}`,

  'My coding was fine. The behavioral rapid-fire':
    `My coding rounds went well. The behavioral is what ended me. It opened with my strongest story — the interviewer cut in almost immediately: "Do you have something more recent?" Then rapid-fire: tough coworker, difficult manager, disagreed with a decision, delivered bad news.\n\nI ran out of polished material around the third prompt and started improvising — narrating generic principles instead of concrete situations. I prepared a handful of greatest-hits and the format demanded a deep bench. Build a matrix: conflict, failure, leadership, ambiguity — at least three recent examples per category.${DISCLAIMER}`,

  'Solved the problem and one follow-up':
    `HM call first, then a screening round: an API response parser with the expectation that follow-ups would extend it. I got the core implementation working and made it through the first follow-up cleanly. Then I ran out of time mid-way through the second.\n\nA week later, rejection. The throughline was speed: "The standard is to solve the base problem and get through two to three follow-ups in the given time." I had treated the base solution as the goal. Correct-but-slow reads the same as incomplete here.${DISCLAIMER}`,

  '"Moving forward with other candidates"':
    `Full loop. "Moving forward with other candidates." No reasons, no scores. The recruiter's follow-up: they wanted to connect me with other teams — this was not a "you failed" but a "we will find you a different home."\n\nThen the other-team conversations quietly evaporated. Someone reframed it for me: "You were recycled, not rejected." The bar raisers signed off on me as hire-able; what I lost was a seat, not a verdict on my competence. Recycled still ends in no offer — but it changes what I take into the next loop.${DISCLAIMER}`,

  'Made it to the Bug Squash round':
    `New grad onsite. Phone screen was a four-part problem and I solved all four. Onsite opened with an advanced programming round, both parts handled fine. Then the Bug Squash round: a large unfamiliar Java/Kotlin codebase, a reported bug, and a stopwatch.\n\nJust orienting ate most of my time. I was navigating, not debugging. The manager round afterward went well but could not rescue the Bug Squash result. The lesson: Bug Squash tests fast comprehension of large existing code and methodical fault isolation — not algorithm design from a blank file.${DISCLAIMER}`,
}

// Additional posts to shorten (5-7 more)
const ADDITIONAL_SHORT: Record<string, string> = {
  'Passed every round I could see, rejected with no reason five days later':
    `Senior SWE process. Cleared the OA, the phone, all five onsite rounds. From inside each room, every one of them felt like a pass. Five days later the rejection arrived with no stated reason.\n\nMy best reconstruction: the LP stories. The coding and design were not the gap. But my behavioral answers were narrative without numbers — no "reduced X by Y percent," no scale, no measurable outcome. At senior level the bar raisers listen for metrics. I had the substance and told it like a memoir instead of a metrics review.${DISCLAIMER}`,

  'Told my system design was weak — the one round I thought I crushed':
    `SDE-2 loop. The behavioral rounds hit the LP hard. The system design I walked out of feeling great about — I thought I had partitioned the problem cleanly and reasoned about scale. If you had asked me to rank my rounds, system design was the top.\n\nThe feedback said system design was my weakest area. My internal gauge for "did that go well" is calibrated wrong, which is scarier than a knowledge gap because I cannot feel where the edges are. I optimized for breadth — sounded fluent — when the interviewer wanted depth on the hard tradeoffs.${DISCLAIMER}`,

  'Both coding rounds came back No Hire':
    `London loop. Two coding rounds, one system design, one behavioral. The first coding round I never landed optimal — I knew it walking out. But the second I solved cleanly, handled the follow-up, tested edge cases. I left genuinely upbeat.\n\nThen: "Both coding rounds came back as No Hire." Both. The second — the one I was proud of — scored No Hire. If my sense of a "good" round is that miscalibrated, I do not actually know what I am being measured on. I have stopped trusting the feeling of a good interview.${DISCLAIMER}`,

  'Passed all six rounds, talked comp, then they selected another candidate':
    `Six rounds, all passed. The HR call to discuss compensation went normally. A week later: "We have decided to move forward with another candidate." The next day the exact same role was reposted.\n\nMy honest read: my comp expectation, paired with a level that may not have been locked in, created friction somewhere I never had visibility into. The interviews were never my problem. Get the level and band pinned down explicitly before you state a hard number.${DISCLAIMER}`,

  '"Technically fine, fit unconvincing"':
    `Cupertino onsite for a platform engineering team. Phone screen OOP was clean. Onsite: memory management deep-dive, Swift concurrency, debugging exercise — technically solid in every room. Then the hiring manager asked why this team, why this domain.\n\nI gave him air: "I love performance work." "I really respect Apple's engineering bar." Generic answers I could have given to any team at any company. He could tell. Rejection summary: "technically fine, fit unconvincing." Exactly right.${DISCLAIMER}`,
}

// ── New investor posts ─────────────────────────────────────────────────────────
const INVESTOR_POSTS = [
  {
    communitySlug: 'investors/a16z',
    title: 'Series A partner meeting went two hours — "not the right moment for us"',
    body: `**Fund**: a16z\n**Stage**: Series A ($4M ask)\n**Deck round**: Partner meeting\n\nWe made it to the partner meeting after two calls with a principal. The meeting itself ran almost two hours — questions about GTM, unit economics, the competitive moat. The partners seemed genuinely engaged and pushed hard on churn assumptions.\n\nA week later: "We love the space and the team. This is not the right moment for us." That phrase — "not the right moment" — is VC for "we are not convinced the timing is right for our thesis," which is different from "we do not believe in you." We went on to close the round with a different lead six weeks later.\n\nThe practical takeaway: when a top-tier fund passes with specific language around timing, use that language in your next pitch as validation — "a16z told us the timing was the question; here is why the timing is now."${DISCLAIMER}`,
    fundingStage: 'SERIES_A',
    amountSoughtRange: '1M_5M',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Closed the round with another lead six weeks later.',
    rejectionYear: 2024,
  },
  {
    communitySlug: 'investors/a16z',
    title: 'Seed pitch: got to term sheet stage, then the market comp killed it',
    body: `**Fund**: a16z\n**Stage**: Seed ($1.5M ask)\n**Deck round**: Term sheet negotiation\n\nWe had a verbal term sheet. Three weeks of back-and-forth on valuation, pro-rata rights, and board composition. Then a16z ran their market comp analysis and came back with a valuation 40% below what we had agreed verbally. We could not close the gap.\n\nThe lead partner was candid: recent comps in our category had compressed, and their model could not support the number we needed to avoid excessive dilution. No hard feelings, just math.\n\nLesson: verbal term sheets are not term sheets. Get the comp analysis early — ask the partner directly which recent deals they are benchmarking against before you invest weeks in negotiation.${DISCLAIMER}`,
    fundingStage: 'SEED',
    amountSoughtRange: '1M_5M',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Eventually raised at a slightly lower valuation with a different seed fund.',
    rejectionYear: 2023,
  },
  {
    communitySlug: 'investors/sequoia',
    title: 'Sequoia Arc application: strong feedback, no follow-up call',
    body: `**Fund**: Sequoia\n**Stage**: Pre-seed / Arc program\n**Deck round**: Application + video interview\n\nWe applied to Sequoia Arc with a B2B SaaS product, $15K MRR, and a two-person founding team. Got invited to record a video interview, which felt like a signal. Questions were sharp: why now, why you, why this wedge.\n\nTwo weeks later a form rejection. No call, no personal note. For a program that markets itself on founder relationships, the process felt transactional at the application stage. The feedback we eventually got through a mutual connection: "strong product instinct, early on revenue validation for the check size."\n\nThat feedback was actionable. We hit $40K MRR before applying to the next program and got in.${DISCLAIMER}`,
    fundingStage: 'PRE_SEED',
    amountSoughtRange: 'UNDER_100K',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Grew to $40K MRR, got into a different accelerator.',
    rejectionYear: 2024,
  },
  {
    communitySlug: 'investors/benchmark',
    title: 'Series A: Benchmark loved the market, passed on the team',
    body: `**Fund**: Benchmark\n**Stage**: Series A ($6M ask)\n**Deck round**: Partner meeting\n\nWe got a partner meeting at Benchmark after a warm intro through a portfolio founder. The conversation was almost entirely about market size — they probed our TAM assumptions from every angle. When we got to the team slide, the tone shifted. One partner asked directly: "Who on your team has done this at scale before?"\n\nWe had not. Strong executers, first-time founders at this stage. The pass came three days later: "We are excited about the market but need to see a team with proven scale experience for a check this size."\n\nThis was honest and correct. We brought on a VP of Sales with a relevant exit and went back to market with a different story.${DISCLAIMER}`,
    fundingStage: 'SERIES_A',
    amountSoughtRange: '5M_PLUS',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Added a VP of Sales with exit experience, raised from a different firm.',
    rejectionYear: 2024,
  },
  {
    communitySlug: 'investors/first-round',
    title: 'First Round seed pass: "too early, come back at $100K MRR"',
    body: `**Fund**: First Round Capital\n**Stage**: Seed ($2M ask)\n**Deck round**: Second call with partner\n\nTwo calls with a First Round partner over three weeks. The diligence was thorough — customer calls, reference checks on the founders, a deep dive on our retention numbers. We felt like we were moving toward a close.\n\nThe pass: "We love the thesis and the early traction, but our seed bar has moved. We want to see $100K MRR before writing this check."\n\nAt the time we were at $35K. The bar they named was specific and trackable. Nine months later we hit $110K MRR, went back to the same partner, and had a term sheet within two weeks. The pass was a delayed yes with a clear condition attached.${DISCLAIMER}`,
    fundingStage: 'SEED',
    amountSoughtRange: '1M_5M',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Hit $110K MRR, returned to First Round, closed the round.',
    rejectionYear: 2023,
  },
  {
    communitySlug: 'investors/founders-fund',
    title: "Founders Fund: 'we don't invest in software' — and they meant it",
    body: `**Fund**: Founders Fund\n**Stage**: Series A ($5M ask)\n**Deck round**: Initial partner call\n\nWe got a warm intro and had an initial call with a Founders Fund partner. The call was thirty minutes. Midway through, the partner said something I had read about but assumed was a myth: "We really prefer bets on deep tech and hard science. Software businesses are hard for us to get excited about even at good numbers."\n\nOur product is pure software — B2B workflow automation. We had $200K ARR and strong NRR. None of that mattered because we were the wrong category for their thesis.\n\nThe lesson is not that our company was wrong. The lesson is that thesis fit is upstream of traction. Research what a fund has actually invested in for the last three years before spending political capital on an intro.${DISCLAIMER}`,
    fundingStage: 'SERIES_A',
    amountSoughtRange: '5M_PLUS',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Raised from a software-focused growth fund instead.',
    rejectionYear: 2024,
  },
  {
    communitySlug: 'investors/yc',
    title: 'YC W24 rejection: interviewed twice, no offer',
    body: `**Fund**: Y Combinator\n**Stage**: Pre-seed / Accelerator\n**Deck round**: Interview (second attempt)\n\nSecond time applying to YC. First attempt W23 was a form rejection. This time we got an interview. Ten minutes, three partners, rapid-fire questions. We had $20K MRR, two enterprise pilots, and a co-founder with a relevant exit. We thought we had done the work.\n\nTwo days later: rejected. The feedback from a YC alum who reviewed our interview prep: we sounded rehearsed rather than direct. YC partners do ten-minute interviews all day — they can feel the difference between someone who has thought deeply about their business and someone who has memorized talking points. We had memorized talking points.${DISCLAIMER}`,
    fundingStage: 'PRE_SEED',
    amountSoughtRange: 'UNDER_100K',
    outcomeCategory: 'RAISED_FUNDING',
    outcomeStory: 'Raised a small angel round and kept building.',
    rejectionYear: 2024,
  },
  {
    communitySlug: 'investors/yc',
    title: 'YC S25: invited to interview, dropped out before it happened',
    body: `**Fund**: Y Combinator\n**Stage**: Pre-seed / Accelerator\n**Deck round**: Interview invitation\n\nGot the interview invitation for S25. Spent two weeks preparing with mock interviews, refining the demo, tightening the story. Then we got an acquisition offer from a strategic buyer — small, but real, and enough to make YC feel like the wrong move for our specific situation.\n\nWe withdrew the application. YC reached out to ask why and was genuinely curious. The partner we spoke to said withdrawals are rare and they appreciate knowing the reason.\n\nThis is not a rejection story in the traditional sense. It is a story about optionality: the work we did to get to a YC interview also made us a more credible acquisition target. Preparation compounds regardless of where it leads.${DISCLAIMER}`,
    fundingStage: 'PRE_SEED',
    amountSoughtRange: 'UNDER_100K',
    outcomeCategory: 'STARTED_COMPANY',
    outcomeStory: 'Accepted a strategic acquisition offer instead.',
    rejectionYear: 2025,
  },
]

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 5 })

  // ── 1. Shorten selected posts ────────────────────────────────────────────────
  console.log('=== Shortening posts ===')
  const posts = await sql`SELECT id, title, body FROM posts ORDER BY created_at`
  console.log(`Total posts: ${posts.length}`)

  let shortened = 0
  for (const post of posts as unknown as Array<{id: string; title: string; body: string}>) {
    // Find matching short body by checking if title starts with the key
    let newBody: string | null = null
    for (const [keyFragment, body] of Object.entries({ ...SHORT_POSTS, ...ADDITIONAL_SHORT })) {
      if (post.title.startsWith(keyFragment.slice(0, 40))) {
        newBody = body
        break
      }
    }
    if (!newBody) continue
    await sql`UPDATE posts SET body = ${newBody} WHERE id = ${post.id}`
    console.log(`  Shortened: "${post.title.slice(0, 60)}..."`)
    shortened++
  }
  console.log(`Shortened ${shortened} posts`)

  // ── 2. Create new investor users ─────────────────────────────────────────────
  console.log('\n=== Creating investor post users ===')
  const INVESTOR_USERS = [
    'founder_vc_reject_01', 'founder_vc_reject_02', 'founder_vc_reject_03',
    'founder_vc_reject_04', 'founder_vc_reject_05', 'founder_vc_reject_06',
    'founder_vc_reject_07', 'founder_vc_reject_08',
  ]

  const userIds: string[] = []
  for (const username of INVESTOR_USERS) {
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`
    if (existing.length > 0) {
      userIds.push(existing[0].id)
      console.log(`  Reusing user: ${username}`)
      continue
    }
    const id = randomUUID()
    await sql`
      INSERT INTO users (id, username, supabase_auth_id, karma, created_at)
      VALUES (${id}, ${username}, ${randomUUID()}, 1, NOW())
      ON CONFLICT DO NOTHING
    `
    userIds.push(id)
    console.log(`  Created user: ${username}`)
  }

  // ── 3. Insert investor posts ─────────────────────────────────────────────────
  console.log('\n=== Inserting investor posts ===')
  let inserted = 0
  for (let i = 0; i < INVESTOR_POSTS.length; i++) {
    const p = INVESTOR_POSTS[i]
    const communityId = COMMUNITY_IDS[p.communitySlug]
    if (!communityId) {
      console.log(`  SKIP: unknown community ${p.communitySlug}`)
      continue
    }
    const userId = userIds[i % userIds.length]
    const postId = randomUUID()
    await sql`
      INSERT INTO posts (
        id, community_id, author_id, title, body,
        funding_stage, amount_sought_range, industry_vertical,
        outcome_category, outcome_story,
        rejection_year, vote_score, created_at
      ) VALUES (
        ${postId}, ${communityId}, ${userId}, ${p.title}, ${p.body},
        ${p.fundingStage ?? null}, ${p.amountSoughtRange ?? null}, ${null},
        ${p.outcomeCategory ?? null}, ${p.outcomeStory ?? null},
        ${p.rejectionYear}, 1, NOW()
      )
      ON CONFLICT DO NOTHING
    `
    console.log(`  Inserted: "${p.title.slice(0, 60)}..." -> ${p.communitySlug}`)
    inserted++
  }
  console.log(`Inserted ${inserted} investor posts`)

  // ── 4. Final summary ─────────────────────────────────────────────────────────
  const totalPosts = await sql`SELECT COUNT(*) as count FROM posts`
  const investorPosts = await sql`
    SELECT COUNT(*) as count FROM posts p
    JOIN communities c ON p.community_id = c.id
    WHERE c.track = 'INVESTORS'
  `
  console.log(`\n=== Summary ===`)
  console.log(`Total posts: ${totalPosts[0].count}`)
  console.log(`Investor posts: ${investorPosts[0].count}`)

  await sql.end()
}

main().catch(console.error)
