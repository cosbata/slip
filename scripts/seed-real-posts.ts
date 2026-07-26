import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

// Community IDs from DB (companies/X parent slugs)
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
  'companies/doordash':  '2dd5fd0a-6dab-4a8c-bf17-585be998f9ad',
  'companies/palantir':  '74f40faf-37ad-44e8-b605-f8a1d8a89e1b',
  'investors/yc':        '88849f07-e5fa-4de0-9c75-3b6c1d65efd2',
  'investors/a16z':      'ab3ca472-c519-4fec-9682-0b222338701d',
}

type Stage = 'SCREEN' | 'PHONE' | 'ONSITE' | 'FINAL' | 'OFFER_RESCINDED'

type PostData = {
  slug: string
  title: string
  body: string
  roleTitle: string
  stage: Stage
  year: number
  username: string
  sourceUrl: string
}

const POSTS: PostData[] = [
  // ── 1. GOOGLE ──
  {
    slug: 'companies/google',
    title: '112 days from application to rejection — one edge case I missed ended the whole loop',
    roleTitle: 'New Grad Software Engineer',
    stage: 'ONSITE',
    year: 2025,
    username: 'loop_112days_anon',
    sourceUrl: 'https://medium.com/@ggfincke/my-google-hiring-experience-fall-2025-8e99c8a1d815',
    body: `I applied in early October and got a surprise rejection email two days later — before I'd even scheduled anything. Then, the very next morning, an "un-rejection" arrived with an Online Assessment link attached. That whiplash set the tone for what became a 112-day process.

The OA was two problems. The easier one I solved in under five minutes; the second was more involved but I finished both cleanly. A week and a half later I was into Round 1: a technical interview followed by a behavioral "Googliness" round. Both came back positive. I moved to the onsite in New York.

The onsite was three back-to-back technical sessions. The first one went well — I solved optimally, handled a complex follow-up. The second I spent too much time chatting about projects and ended up rushing the actual coding, delivering a suboptimal solution under time pressure.

The third round is the one I keep replaying. The problem had a subtle constraint that showed up only on small edge cases. My approach was logically sound, my code was clean — but I never ran a dry-run deep enough to catch that one edge where the output violated a constraint in the problem statement. I walked right past it. That was, I suspect, the entire point of the question: find the impossible case.

Then came 49 days of silence before a recruiter call and a rejection. I was in "holistic review" for most of it, then "final review" for the last week. She couldn't share specifics beyond "you didn't hit our bar."

What I'm taking from it: I had never built the habit of disciplined dry-runs. I would write an approach, feel confident, open LeetCode, and mash run. The act of validating an approach on paper — slowly, on edge cases — was never part of my routine, and they asked a question that punished exactly that weakness.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 2. GOOGLE ──
  {
    slug: 'companies/google',
    title: 'Strong interview feedback, then two months of silence in team matching — then nothing',
    roleTitle: 'Software Engineer L4',
    stage: 'FINAL',
    year: 2025,
    username: 'team_match_void_anon',
    sourceUrl: 'https://leetcode.com/discuss/post/7867127/google-l4-bengaluru-reject-by-anonymous_-vho0/',
    body: `I went through the full Google L4 loop in December. Four rounds: two DSA, one Googlyness, and a system design round — though notably no dedicated system design round was scheduled, which confused me at the time.

The DSA rounds were challenging but fair. Round one was an orderbook/auction variant — I got through it with some effort. Round two was interval merging with a priority queue component, which went more smoothly.

When the recruiter updated me in January, the news was genuinely encouraging. Round one and two feedback were both "strong," and Round three (Googlyness) came back "neutral." Despite that neutral signal, they decided to move me forward into team matching. I felt cautiously optimistic.

Then February arrived. Then March. I sent follow-up emails. Silence. Eventually the recruiter told me hiring managers were not showing interest in my profile, so they were closing the loop. No offer. No explanation of which teams had seen me or why each passed. The application moved to "Not Proceeding" in the portal but I never received a formal rejection email — it just quietly ended.

I spent six months total in this process for a soft landing in the void. The interviews themselves felt fair and well-structured. What I cannot forgive is the communication black hole at the end. Team matching is a real gate, not a formality, and it can reject you on factors entirely outside the interview performance. L4 candidates in competitive locations should know that passing all technical rounds does not mean the process is over. The seat has to exist and a hiring manager has to want it filled by you specifically.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 3. GOOGLE ──
  {
    slug: 'companies/google',
    title: 'Google gave me one sentence of feedback. It took four more interviews to understand what it actually meant.',
    roleTitle: 'Senior Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'one_sentence_feedback',
    sourceUrl: 'https://blog.stackademic.com/google-rejected-me-the-feedback-was-one-sentence-it-took-me-4-interviews-to-understand-it-2217fb9cd1bb',
    body: `Most companies give you a form email. Google gave me one sentence through the recruiter: "Strong signal on solutions. Weak signal on how the candidate gets there."

I read it three times and felt insulted. I read it a fourth time and realized it was the most accurate thing anyone had said about my interviewing in a decade.

My first interpretation: they want me to talk more. So in my next loop I narrated everything — every variable I created, every check I wrote. I got rejected again. The narration was noise.

Second interpretation: they want more technical depth. So I buried interviewers in tradeoffs, calibration metrics, precision-recall curves. Still rejected. I was answering louder without answering differently.

Third interpretation: they want me to go faster. So I snapped to solutions — clean, confident, quick. This was the worst reading. I was getting to good answers and giving interviewers zero view into how. I had optimized exactly the wrong axis.

It clicked in round five. The interviewer stopped me mid-problem and asked: "Before you solve it — how are you deciding which approach?" I didn't have an answer. Not because I didn't have a reason — I had one. I had just never said it out loud. I jumped to approaches because they felt obvious to me, and the obviousness happened silently, in a place the interviewer couldn't see.

That was the whole sentence. The feedback wasn't about narrating keystrokes or going deeper or moving faster. It was about making visible the reasoning that happens before the solution — the part where you're choosing between two paths and you can say why, while you're still uncertain.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 4. GOOGLE ──
  {
    slug: 'companies/google',
    title: 'I walked through my portfolio for 40 minutes and still couldn\'t answer "why did you make that decision"',
    roleTitle: 'UX Designer',
    stage: 'ONSITE',
    year: 2023,
    username: 'portfolio_no_story',
    sourceUrl: 'https://uxplanet.org/google-rejected-me-because-of-this-one-simple-thing-4ea1ed18d72d',
    body: `My Google onsite was a 4-5 round loop covering portfolio presentation, design exercises, and a hiring manager conversation. I prepared obsessively: I knew every metric, every outcome, every technical decision behind each piece in my portfolio.

The hiring manager round was where it ended. I walked through a case study in detail — the problem, the research, the iterations, the final design, the measured outcomes. I was thorough. And he kept asking the same thing in slightly different ways: "But why did you make that specific decision at that moment?"

I kept answering. But my answers were about what I built, not about the reasoning behind the choices at each turn. I focused on the outcome and the craft. He was asking about the decision-making process — why this, not that, at that specific moment with those specific constraints.

After maybe the fifth time he rephrased the question, I could feel the room change. I understood intellectually but couldn't seem to shift gears in real time. I left knowing I hadn't landed it.

The rejection came with no feedback, which is its own problem. What I later understood: design at this level isn't evaluated on what you built. It's evaluated on whether you can articulate the narrative of choices — the why behind each decision, told as a coherent story that another designer could learn from.

I had outputs. I didn't have a story. For the next loop, I'm building what I now call decision narration: for every major design choice, I can explain the alternatives I rejected and the reasoning that made me choose what I chose.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 5. AMAZON ──
  {
    slug: 'companies/amazon',
    title: 'Bar Raiser said they expected more complexity — five rounds, one feedback line, done',
    roleTitle: 'System Development Engineer L4',
    stage: 'ONSITE',
    year: 2025,
    username: 'bar_raiser_shock',
    sourceUrl: 'https://leetcode.com/discuss/post/8285712/amazon-system-development-engineer-l4-by-qubt/',
    body: `Five rounds: Online Assessment, two DSA rounds, computer networks and Linux fundamentals, a Hiring Manager round, and a Bar Raiser.

The OA cleared. DSA rounds were fine. The networks and Linux round was domain-heavy — I know this area well and felt solid going through kernel behavior, TCP internals, container networking. The HM round went well enough that my recruiter told me afterward I had "a good chance," though he noted another candidate was ahead of me for this specific team.

Then the Bar Raiser feedback came back. One line: they were expecting "more complexity level" in my performance. The current team decided not to move forward.

Here's the thing — my recruiter didn't close the loop. He said he would try to place me in a different SysDE role, that headcount might open in two weeks, that I should expect a new HM round. He seemed genuinely invested in finding me a seat somewhere.

Two weeks passed. Then another week. The internal placement conversation quietly faded. What had looked like a soft landing became a hard rejection with extra steps.

If someone tells you "you passed but we're looking for another team," that's not a guarantee. You are in a limbo state where your results are valid but your seat doesn't exist yet. Keep interviewing. The pool is real but so is the wait.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 6. AMAZON ──
  {
    slug: 'companies/amazon',
    title: 'I designed a rate limiter and forgot to mention Token Bucket — Amazon doesn\'t forget',
    roleTitle: 'Software Engineer 2 (SDE-2)',
    stage: 'ONSITE',
    year: 2026,
    username: 'token_bucket_forgot',
    sourceUrl: 'https://interviewexperiences.in/experience/amazon/amazon-swe-2-interview-verdict-rejected',
    body: `Five rounds: two DSA, one LLD, one HLD/Bar Raiser, and an LP-heavy Hiring Manager round.

The first DSA round went well. Second DSA round covered sliding window optimization and 2D dynamic programming — both positive verdicts. Then LLD: design a Rate Limiter.

I proposed a sliding window approach. I got it working, explained it clearly, handled the follow-ups. But in the debrief I realized I never mentioned the Token Bucket algorithm — which, at Amazon's scale with millions of concurrent users, is almost certainly the preferred production approach. The sliding window is academically correct. The Token Bucket is operationally right.

The Bar Raiser round was 30 minutes of Leadership Principle grilling plus a system design question: tracking the maximum number of concurrent users logged in at any point. I felt okay about the LP stories. The system design I handled but didn't distinguish myself on.

Rejection came a few days later. My read: the LLD round cost me because I locked into one approach and never explored alternatives. Amazon doesn't just want a working solution — they want evidence that you know the landscape of solutions and can choose between them with explicit reasoning. Missing Token Bucket wasn't a knowledge gap exactly; I know it. It was a discussion gap. I solved and stopped when I should have solved and compared.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 7. AMAZON ──
  {
    slug: 'companies/amazon',
    title: 'The Hiring Manager gave me three hints during the system design. I missed all of them.',
    roleTitle: 'SDE-2 (Backend)',
    stage: 'ONSITE',
    year: 2025,
    username: 'missed_hm_hints',
    sourceUrl: 'https://medium.com/@pragadheeshwaran/what-went-wrong-in-my-amazon-sde-2-interview-and-what-you-can-learn-5fe81ce68195',
    body: `Amazon SDE-2 loop: OA, two technical rounds, one LLD round, and a Hiring Manager round. The timeline stretched to almost two months from OA to final call, mostly recruiter-side delays.

The first technical round was a paper coding session. I solved both problems — Number of Islands with some space constraint handling, and a variant on monotonic stacks. The recruiter told me the feedback noted hints had been given. I was surprised; it hadn't felt that way to me.

LLD round was a Cricket leaderboard schema design. I jumped straight to writing tables without asking clarifying questions. That was the mistake I recognized immediately after — even when a problem seems familiar, interviewers layer in constraints that force schema changes, and skipping clarification means you're designing for the wrong problem.

The HM round is the one I'm still replaying. The technical problem was live database migration from SQL to NoSQL without downtime. We went back and forth on approaches. Then came LP questions. The recruiter later told me the hiring manager had given me hints during the migration discussion — and I hadn't picked them up or redirected the conversation toward what was being asked.

I genuinely did not perceive those as hints in the moment. I thought I was having a dialogue. Amazon's interviewers sometimes hint indirectly — a follow-up question phrased as curiosity, a reframe disguised as elaboration. When the recruiter says "you missed the hints," it means the answer you needed was sitting inside a question they were already asking.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 8. AMAZON ──
  {
    slug: 'companies/amazon',
    title: 'Full loop completed, all rounds positive — "moving forward with another candidate" and then silence',
    roleTitle: 'SDE-2',
    stage: 'ONSITE',
    year: 2026,
    username: 'full_loop_another_cand',
    sourceUrl: 'https://interviewexperiences.in/experience/amazon/amazon-sde-2-interview-experience-jan-feb-2026-rejected',
    body: `The process started with a same-day OA link after I applied. A week later the recruiter confirmed I passed and set up the loop. Four rounds: Low-Level Design, DSA, High-Level Design, and a combined LP/behavioral round.

LLD: notification service with SMS and Email integration, rate limits, retry logic. I handled the core design but the recruiter later flagged concerns specifically about the LLD approach — possibly that I didn't articulate the component boundaries clearly enough.

DSA: two problems in 45 minutes, both solved correctly. Positive verdict.

HLD: design Twitter at scale. This went well technically.

LP round: standard STAR-format questions — delivering results under deadline, learning curiosity, dealing with a teammate whose work was affecting the team. I thought these were my strongest answers.

Feedback came back mixed but they moved me to the HM round anyway, which is typically a good sign.

Then the HM round. More LP questions, a technical design discussion. I thought it went fine.

Rejection followed: "moving forward with another candidate." No specifics. I asked the recruiter explicitly for feedback. The policy is they can't share it.

The recruiter mentioned I could be considered for other teams if openings came up. I followed up twice. No response. The suggestion of internal re-consideration evaporated the same week it was offered.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 9. META ──
  {
    slug: 'companies/meta',
    title: "I prepared with Meta's own practice portal — the real interview was nothing like it",
    roleTitle: 'Data Engineer',
    stage: 'PHONE',
    year: 2024,
    username: 'meta_portal_mismatch',
    sourceUrl: 'https://b17news.com/im-a-data-engineer-who-failed-metas-technical-interview-i-felt-confident-but-heres-what-i-got-wrong/',
    body: `A Meta recruiter reached out to me directly after finding my LinkedIn profile. They said my experience was a strong match. After an initial phone screen with the recruiter, I moved to a technical interview — and spent the next two weeks preparing seriously. Mock interviews, practice problems, the works.

Meta gives you access to a preparation portal. I used it heavily — went through the coding exercises, familiarized myself with the environment. The questions there seemed approachable, and I started to feel genuinely confident.

The technical interview had two interviewers. The session itself went okay — I worked through both problems and explained my reasoning. I didn't freeze. I didn't blank.

Two weeks later, a colleague of my recruiter emailed: they were moving forward with another candidate. No specific feedback due to compliance policy.

Here's what I now know: the practice portal questions are significantly easier than what shows up in the actual interview. I treated portal performance as a calibration signal. It wasn't. The portal is there to familiarize you with the interface, not to simulate the difficulty level.

The second thing: I spent almost no time on mock interviews with real interviewers giving real-time feedback. That's the closest simulation available, and I treated it as optional. It's not optional if you want accurate feedback on how you actually perform under live conditions.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 10. META ──
  {
    slug: 'companies/meta',
    title: 'I got a supplemental round, thought that was a good sign — it ended me',
    roleTitle: 'Software Engineer E4 (Mid-Level)',
    stage: 'ONSITE',
    year: 2024,
    username: 'supplemental_trap_e4',
    sourceUrl: 'https://www.jointaro.com/question/dIXdt7dq3hcBrMR8SLpm/my-meta-interview-experience-mid-level-e4-or-usa-or-reject-after-follow-up/',
    body: `Meta phone screen went smoothly — two problems from the top-50 commonly tagged questions, both solved optimally. Moved to onsite the next day.

Onsite: five rounds. Round one (coding): Tree BFS variant, got optimal runtime but not optimal space on the first question. Second question was harder — a binary search variant I couldn't crack optimally. I walked out of round one already worried.

Round two (behavioral): solid connection, good stories, felt like a genuine conversation.

Round three (system design): a search-related product design. I'd prepared for this format and we had a real technical discussion.

Round four (coding): Two BFS problems, both optimal. Momentum back.

Then round five — a surprise. The recruiter called the next day to say they wanted to give me a supplemental coding round. I took this as a positive signal. Companies don't give you extra chances when they're going to reject you, right?

Round five: palindrome partitioning (LC Hard) and grid DFS. Both are problems where either you've seen the pattern or you haven't. I hadn't. I couldn't recover in the session. The rejection came the same day the supplemental ended.

The supplemental round isn't a reward for strong performance. It's a tiebreaker — you were borderline and they needed more data. If you get one, treat it as your most important round, not your easiest one.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 11. META ──
  {
    slug: 'companies/meta',
    title: 'Recruiter said she had an update, would call that afternoon — I\'m still waiting, one week later',
    roleTitle: 'Software Engineer',
    stage: 'PHONE',
    year: 2024,
    username: 'update_call_ghost',
    sourceUrl: 'https://www.teamblind.com/post/hvj4kb0h',
    body: `I applied somewhat spontaneously for a SWE role. A recruiter got back to me, we had a good introductory call, and she set up the first-round technical screen.

The technical screen itself went well. Two medium-difficulty problems within the time limit. I explained my approach first on both, got to working solutions, and the interviewer seemed genuinely engaged. We had a good conversation in the last few minutes.

Three days later the recruiter emailed: she had an update for me and asked if I was free for a call that afternoon or the following day. I replied within an hour: yes, I'm free anytime.

No call that afternoon. No call the next day. I followed up after two days: just checking in if you have time to connect. Nothing. Another three days, another check-in: happy to find a different time if the original window doesn't work. Still nothing.

By this point it had been over a week since she said she had an update ready.

I know this story probably ends well — the silence on positive news is normal, recruiters get pulled into other things, she probably didn't have a decision locked in when she sent that email. But the experience of being told "I have news, let's talk today," and then hearing nothing for a week, with no acknowledgment of the delay, is genuinely demoralizing.

If you reach out to say you have an update, a two-line follow-up email the next day costs nothing. "Still working on timing, I'll get back to you by Friday" is not a hard thing to send.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 12. APPLE ──
  {
    slug: 'companies/apple',
    title: 'First-round screen, sliding window follow-up I couldn\'t optimize, done',
    roleTitle: 'Software Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'apple_sliding_gap',
    sourceUrl: 'https://www.jointaro.com/interviews/companies/apple/experiences/software-engineer-cupertino-ca-june-23-2025-no-offer-neutral-1179c538/',
    body: `One round. IS&T team, virtual screen, one interviewer.

The problem was a sliding window question — the kind that's clearly identifiable as a sliding window if you've drilled the pattern. I identified it correctly and got a working solution.

Then the follow-up: optimize it further, tighten the time complexity. I had difficulty with this part. I could see what was being asked but couldn't get to the cleaner implementation under time pressure.

The round ended. A few days later, rejected.

The thing about Apple's screening is that the bar is not "did you get a working solution." The bar seems to be "did you get the optimal solution and handle the follow-up optimally." Getting to "working" is apparently roughly expected, not a signal. The follow-up is where they differentiate candidates.

I've heard this from multiple people who interviewed with Apple: they expect you to answer everything at a high level to qualify for the next round. That's a different calibration than most companies, where a good working solution with some discussion of optimization is typically a pass at the screen stage.

I was prepared to get to a correct answer. I wasn't prepared to treat the follow-up optimization as the actual test.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 13. APPLE ──
  {
    slug: 'companies/apple',
    title: 'Five rounds, all cleared — rejected at team matching after the role was reassigned internally',
    roleTitle: 'Software Development Engineer',
    stage: 'FINAL',
    year: 2026,
    username: 'apple_internal_transfer',
    sourceUrl: 'https://interviewexperiences.in/experience/apple/apple-sde-interview-experience-java-springboot-microservices-role',
    body: `The process started with a take-home coding test. After clearing that, I had a recruiter screen, then a virtual event with two back-to-back rounds. Those cleared, and team matching began.

Team matching at Apple works by routing your profile to hiring managers based on background fit. Two teams expressed initial interest. I had a conversation with each.

Then, after a few weeks of what felt like normal back-and-forth, the team I'd been most excited about went quiet. When I followed up, the recruiter explained the role had been filled by an internal transfer. The second team had also moved on.

Five technical rounds. All passed. No offer.

I don't blame the process — internal transfers happen and they're legitimate. What I'd want any future candidate to know is that team matching at Apple is a real gate that can fail for reasons entirely disconnected from how you performed in the interviews. The technical bar is one thing. Whether a hiring manager happens to have an open seat at the moment your packet circulates is another thing entirely.

Keep interviewing in parallel during team matching. Don't treat "your interviews went well, we're matching you to a team" as an offer. It is not an offer.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 14. STRIPE ──
  {
    slug: 'companies/stripe',
    title: "I treated Stripe's integration round like a LeetCode problem. That's not what it is.",
    roleTitle: 'Staff Engineer (Backend)',
    stage: 'ONSITE',
    year: 2024,
    username: 'stripe_docs_not_algo',
    sourceUrl: 'https://leonstaff.com/blogs/stripe-interview-response-time-2025/',
    body: `I passed the phone screen easily. I handled the system design round without problems. I walked into the Integration Round feeling like the hard part was behind me.

The Integration Round: a laptop, a dev environment, a buggy payment integration that needed to be diagnosed and fixed. Internet access allowed. No restrictions on documentation.

I treated it like a LeetCode hard. I started optimizing for Big O — looking for inefficiency in the algorithm, reaching for clever abstractions, thinking about performance characteristics. I barely touched the documentation.

That was the failure. The integration round is not asking you to invent something clever. It's asking you to read documentation accurately, call an API correctly, handle error codes as specified, and ship working code. The right tool was "open the docs, find the endpoint, handle the 400 vs 500 behavior as documented, make it work."

Instead I spent 15 minutes designing an abstraction layer that made sense architecturally but didn't make the API call work. Then I went silent for another 10 minutes trying to optimize the wrong thing while the interviewer watched.

Stripe rejected me four days later. The recruiter confirmed it was the integration round.

Stripe hires engineers who can ship. Reading docs carefully under pressure, communicating while you're confused, treating the interviewer like a coworker — that's the round. It's not a harder algorithm test.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 15. STRIPE ──
  {
    slug: 'companies/stripe',
    title: 'Got to the onsite, then the Bug Bash round exposed the gap between reading code and writing it',
    roleTitle: 'Software Engineering Intern',
    stage: 'ONSITE',
    year: 2025,
    username: 'stripe_bug_bash_gap',
    sourceUrl: 'https://medium.com/nybles/stripe-software-engineering-intern-interview-experience-off-campus-a83b30aabed4',
    body: `Stripe's process is genuinely different. No LeetCode-factory grind. The OA was a log parsing task — parse transaction logs, filter error codes, compute metrics. More like a debugging script than a competitive programming problem.

I passed the OA and got a team screening. The multi-part format: get Part 1, solve it, unlock Part 2, and so on. Each part builds on the previous. For Part 4 I ran out of time — instead of code I wrote a detailed explanation of how I would modify the class structure. The interviewer appreciated the clarity. I moved to the virtual onsite.

The virtual onsite had two sessions. Session one was a Notification Scheduling System — full lifecycle, state mutations, concurrent event handling. I solved three of four parts completely. Session two was API integration work: authenticate, fetch paginated data, process it, POST results to a downstream service with proper error handling. I finished four parts confidently.

Both interviewers seemed satisfied. I got invited to the Hiring Manager round the same afternoon.

Then the HM round went fine but came back as a rejection.

Sitting with it: my technical performance was objectively strong in the onsite. The HM round asked behavioral questions about past experience, collaboration, feedback. My best guess is that something in how I talked about my Amazon internship didn't land the way I intended — either I came across as defensive about feedback or the "why Stripe" answer felt generic.

The onsite can go well and the behavioral can still end it.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 16. NETFLIX ──
  {
    slug: 'companies/netflix',
    title: 'The tech screen had no coding. They went until they found the edge of what I knew.',
    roleTitle: 'Security Software Engineer L5',
    stage: 'PHONE',
    year: 2025,
    username: 'netflix_depth_probe',
    sourceUrl: 'https://www.teamblind.com/post/Failed-Netflix-tech-screen---my-experience-and-timeline-7c3sZMtT',
    body: `Netflix reached out to me for an L5 security software engineer role. The fit looked perfect on paper — the experience level matched, the domain matched, and they specifically wanted Java, which I'd been working in for six years.

After a recruiter screen and a short call with a staff engineer on the team, I got to the technical screen. The recruiter told me in advance: no coding. Instead, an hour with a senior engineer on the team covering domain-relevant topics.

The format was deeply open-ended. One prompt: "Tell me about a recent difficult bug you had to solve." I described a complex authentication issue I'd worked through. The interviewer was able to ask detailed follow-up questions about it — which was impressive but also meant my answer had to hold up under real scrutiny.

The session covered distributed systems principles: leader elections, consensus protocols, exactly the infrastructure concepts the team uses. The pattern was clear: they kept probing until they found the boundary of my knowledge. The moment you say "I'm not sure, but here's how I'd find out" is noted.

After the session I sent follow-up notes to both the recruiter and the staff engineer. Three days later, automated rejection from the recruiter. The staff engineer had thumbs-up'd my message on LinkedIn and said nothing else.

My honest read: they are looking for the unicorn who can answer comprehensively on every topic without hedging. "I'd figure it out" is acceptable once. As a recurring answer, it signals gaps they aren't willing to fill.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 17. NETFLIX ──
  {
    slug: 'companies/netflix',
    title: 'Four rejection rounds over six years — the fourth time they finally offered, then lowballed me',
    roleTitle: 'Senior Software Engineer',
    stage: 'OFFER_RESCINDED',
    year: 2024,
    username: 'netflix_4x_lowball',
    sourceUrl: 'https://www.teamblind.com/post/Rejection-from-Netflix-kiDyfT8A',
    body: `I've interviewed at Netflix four separate times over several years. First attempt in 2018: rejected after the manager round. Second in 2020: same stage, same result — not enough experience. Third time in 2022: cleared the first two technical rounds, then was told the position was filled and my resume would be floated to another manager who interviewed me and decided my background wasn't the right fit.

The fourth attempt in 2024 was different. Seven rounds total — recruiter, hiring manager, team conversations, a cross-functional panel, a skip-level leadership interview. I made it through all of them. Then a different hiring manager saw my interview packet and reached out. Two more rounds.

After nine rounds across multiple managers and a span of weeks, they extended an offer.

I declined.

The offer was significantly below my target compensation. I already have FAANG-level experience. Netflix isn't the Netflix I first applied to in 2018 — the culture has shifted, the compensation structure for my level didn't match the commitment they expected, and after watching them ask for nine rounds of my time, I wasn't inclined to negotiate from a place of desperation.

The practical data point for everyone else: Netflix interviews are team-dependent, your previous packet can be re-evaluated by any manager in the system, and being rejected from one manager doesn't permanently close the door. If your resume has the right signal, you'll get multiple bites at different teams. Whether the offer at the end is worth it is a different question.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 18. MICROSOFT ──
  {
    slug: 'companies/microsoft',
    title: 'Microsoft SDE-2 loop done, then 3 weeks of recruiter ghosting, then a template rejection',
    roleTitle: 'Software Engineer 2 (SDE-2)',
    stage: 'ONSITE',
    year: 2026,
    username: 'msft_3week_ghost',
    sourceUrl: 'https://www.teamblind.com/post/microsoft-sde-2-full-loop-4-rounds-3-weeks-of-recruiter-ghosting-jsbswjys',
    body: `Reached out to a Microsoft recruiter early in the year. OA came quickly, I cleared it in early February, got the "moved to full loop" email — then a week of silence before scheduling.

Four rounds. I'll focus on what's worth noting.

The DSA round was solid. Two medium-hard problems, the second had a tricky edge case I caught on a dry run — exactly the kind of discipline I'd built explicitly because of a previous rejection where I'd missed it. This time I caught it. That round felt like a win.

The LLD round was harder to evaluate. The interviewer interrupted my explanation almost continuously — every time I started building toward a point, they'd cut in. I'd been warned this happens and that it might be a test of how you handle difficult collaborators. Looking back, I should have said "let me finish this thought before we go deeper" more explicitly instead of accommodating every interruption. I kept adjusting and lost my train of thought twice.

Then three weeks of silence. I sent three follow-up emails over that period. Each one ignored. The eventual rejection was a template email — no feedback whatsoever. When I specifically asked for feedback, a short reply came back: they couldn't share it.

The portal still showed "Interview" status for the role weeks after the rejection email.

The recruiter communication before the loop had been reasonable. The total drop after the decision was jarring. Don't take responsiveness during scheduling as a signal of how they'll treat you after.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 19. MICROSOFT ──
  {
    slug: 'companies/microsoft',
    title: 'Interviewed at Google and Microsoft the same summer — one No Hire round killed both',
    roleTitle: 'Software Engineer II (L61)',
    stage: 'ONSITE',
    year: 2024,
    username: 'dual_loop_one_floor',
    sourceUrl: 'https://www.levels.fyi/community/thread/ahefC4/sharing-my-microsoft-and-google-interview-experience-rejected-at-both',
    body: `I did two full loops in the same two-month stretch — Google in one city and Microsoft in another. This is a writeup on both, because the lesson that came out of them is the same.

Google: four virtual onsite rounds — behavioral, two coding, one harder coding. The behavioral came back Strongly Hire. Two of the coding rounds were Hire. The third coding round — a crossword-style puzzle variant — I couldn't get to optimal. No Hire. That one round against three positive signals was enough to reject me. The recruiter told me the vast majority of candidates fail the first attempt and I should apply again next year.

Microsoft: four rounds — MinHeap from scratch (coding), chess board OOP design, marketing campaign email system design, and a behavioral round. The OOP, system design, and behavioral all went well. The MinHeap round was the one that cost me — implementing it from scratch including heapify-up and heapify-down, and I needed significant hints to get through it. The other three rounds didn't compensate.

The same lesson from both: one weak round against several strong ones is enough. Companies don't average across rounds — they look for the floor. A single room where you visibly needed help on fundamentals outweighs three rooms where you shined.

The other lesson: getting through screening and into a full onsite loop is arguably harder than the interviews themselves. Don't waste either opportunity on gaps you haven't drilled.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 20. AIRBNB ──
  {
    slug: 'companies/airbnb',
    title: '75% through my implementation when the interviewer told me the approach was wrong',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'airbnb_75pct_pivot',
    sourceUrl: 'https://www.jointaro.com/interviews/companies/airbnb/experiences/software-engineer-united-states-july-1-2024-no-offer-negative-a9964f99/',
    body: `Airbnb's virtual onsite: one coding round, one code review round, one system design round, one behavioral project deep-dive. Four rounds in total.

The code review round was its own problem. The interviewer barely spoke. I would talk through a change, ask for confirmation I was going in the right direction, and get near silence. I worked through the whole thing essentially alone and had no idea whether any of it was landing.

The coding rounds had verbose, ambiguous problem statements. In one of them I verbalized my approach before starting — asked whether this direction seemed reasonable — and got a non-committal response. So I started implementing. Got about 75% of the way through when the interviewer told me the approach I'd announced and partially built was wrong.

That's the moment I keep replaying. I asked for alignment early. I didn't get a clear signal. I committed and built. At 75% complete I was told to start over, with maybe 15 minutes left.

I eventually got to a working solution, but not quickly enough to count.

A week later: "You did well, but we went with a different candidate." No follow-up when I asked about other teams.

What I'm taking into the next loop: when an interviewer won't give you signal, force a check-in. "I'm going to implement X and handle Y as an edge case — is that reasonable before I start coding?" And wait for an explicit yes or redirect. Don't accept ambiguity as permission.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 21. AIRBNB ──
  {
    slug: 'companies/airbnb',
    title: 'Completed every round including Core Values — two weeks of silence, no update',
    roleTitle: 'Senior Software Engineer',
    stage: 'FINAL',
    year: 2025,
    username: 'airbnb_core_values_void',
    sourceUrl: 'https://www.teamblind.com/post/has-anyone-completed-all-rounds-with-airbnb-till-core-values-round-and-still-got-the-rejection-pfh6a7ox',
    body: `I went through a five-stage process: recruiter screen, use case discussion, two technical rounds, a stakeholder conversation, and the Core Values round.

One of the two technical rounds didn't go as well as the others. I know that. But I made it to the Core Values round anyway, which I understood to mean the technical gate had been cleared — you only get to Core Values if your technical rounds were at least collectively positive.

The Core Values round itself felt genuine. Good connection with the interviewer, honest conversation about how I think and work. I left feeling like it had gone as well as it could have.

Then two weeks of silence.

I've sent a follow-up email. No response from the recruiter. The application status hasn't changed. I'm treating this as a de facto rejection but I don't actually know.

What I've learned from talking to others who've been through this: Airbnb is genuinely slow on post-interview communication, and the Core Values round does not guarantee an offer — the hiring decision is made by the hiring manager with recruiter input, sometimes involving a hiring committee. Making it to Core Values proves you cleared the technical bar. It doesn't prove you won the seat.

If you're in this limbo state: give it three weeks before reading into the silence. Send one follow-up. After that, redirect your energy. You can't do anything to change the outcome, and watching a portal is not time well spent.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 22. OPENAI ──
  {
    slug: 'companies/openai',
    title: 'OpenAI reached out to me, set up a recruiter screen, then rejected me after 20 minutes',
    roleTitle: 'Software Engineer',
    stage: 'SCREEN',
    year: 2025,
    username: 'oai_recruiter_screen_out',
    sourceUrl: 'https://www.jointaro.com/question/5B3oEmEVcoyOGPSnxz0p/rejections-at-the-recruiter-screen-stage/',
    body: `I didn't apply to OpenAI. A recruiter reached out to me.

We scheduled a recruiter screen for about a week after their initial email. The conversation itself felt normal — the recruiter asked about my background, current work, what I was interested in doing next. I thought I was reasonably prepared. I talked about relevant experience, asked questions about the teams. Nothing in the conversation felt like it was going sideways.

The next day: "After discussing with the hiring team, we've decided to move forward with candidates whose experience more closely aligns with our current needs."

The recruiter screen rejection is harder to process than an onsite rejection. At least in an onsite you got to perform. Here the question is whether you failed to communicate your experience effectively, whether the hiring team had already changed requirements between when they reached out and when we talked, or whether the decision had effectively already been made and the call was a formality.

What I've heard from others who've gone through similar experiences: OpenAI's bar at every stage is unusually high. They reportedly hire the top few percent of the top few percent. Recruiter screens aren't a formality there the way they might be at a company with slower pipeline velocity. The hiring manager is often reviewing candidates before and after these calls, and a "reach out" can be withdrawn quickly when the calibration shifts.

If you're an experienced engineer and you get screened out after a recruiter call at a top AI lab: don't assume your skills are the problem. Assume the bar is extremely high and the process has limited transparency.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 23. OPENAI ──
  {
    slug: 'companies/openai',
    title: 'Six technical rounds, then rejected — the ML stats round felt like graduate information theory',
    roleTitle: 'Research Engineer',
    stage: 'ONSITE',
    year: 2026,
    username: 'oai_grad_theory_gap',
    sourceUrl: 'https://www.tryexponent.com/experiences/openai-machine-learning-engineer-interview-c7b6a2',
    body: `I got in through a referral — which I think mattered for getting the initial review. Two 60-minute technical screens first: one was a real algorithm problem, the second was about writing correct code fast. Both went fine.

Then three more technical rounds in the onsite phase. The first was practical ML and debugging — applying ML knowledge to real implementation problems, not just describing concepts. The second went similarly. The third was the one that ended it: a statistics-heavy round that felt like graduate-level information theory. Entropy, mutual information, concentration inequalities, the kind of material that's in the curriculum of an ML PhD program but not necessarily part of standard "ML engineer interview prep."

I could follow the questions. I couldn't answer them at the depth being asked. The interviewer gave me fewer hints than I was used to from other loops — which, in retrospect, is probably the point. They weren't trying to walk me to the answer. They were probing how far I could go independently.

I never made it to the hiring manager conversation that would have come after. Rejected after the technical rounds.

The honest takeaway: the Research Engineer role at a frontier AI lab is calibrated for people with strong ML research backgrounds, not just strong engineering backgrounds. If the stats round covers graduate theory, you need graduate-level stats fluency. Standard ML engineer prep — algorithms, systems, practical ML — is necessary but not sufficient.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 24. UBER ──
  {
    slug: 'companies/uber',
    title: 'Parking Lot LLD: spent 40 minutes on class diagrams, had 20 left to write the actual code',
    roleTitle: 'Software Engineer L4 (Backend)',
    stage: 'ONSITE',
    year: 2024,
    username: 'uber_lld_no_code',
    sourceUrl: 'https://khaniqbal.medium.com/uber-l4-interview-experience-5350c0e5918d',
    body: `Uber L4 backend loop: OA (4 problems, 3.5 solved), then three interview rounds.

Round one: DSA, the candy distribution problem. Got to the optimal approach with clean reasoning. Round two: another DSA problem, a priority queue/heap variant. Optimal again. Both came back with positive signals.

Round three: Low-Level Design, Parking Lot.

I've designed parking lots before. I know the entities — slots, vehicles, levels, ticketing, payment. The interviewer engaged with my class diagram immediately and we went deep: generics for different vehicle sizes, observer patterns for availability notifications, strategy pattern for pricing. It was a genuinely good technical conversation.

Then I looked at the timer. Forty minutes of design discussion, twenty minutes left to actually code.

I started writing. I got through the core classes — ParkingLot, ParkingSlot, Vehicle, Ticket. But I didn't get to the service layer. I didn't get to the ticketing flow. The session ended with a skeleton, not a working implementation.

Rejection followed. I knew it was coming.

The LLD round at Uber isn't looking for the most thorough class diagram you can articulate. It's looking for working code that demonstrates you understand OOP principles. A design I could explain in great detail and couldn't ship in time is a failed round. I now hard-cap design discussion at the halfway mark of any LLD round, regardless of how interesting the conversation gets.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 25. UBER ──
  {
    slug: 'companies/uber',
    title: 'My system design architecture was correct — I just couldn\'t defend any of the choices',
    roleTitle: 'Senior Software Engineer',
    stage: 'ONSITE',
    year: 2026,
    username: 'uber_kafka_shallow',
    sourceUrl: 'https://devbrainiac.com/blogs/82/uber-senior-software-engineer-interview-experience/',
    body: `Four rounds: two coding, one system design (real-time restaurant metrics dashboard), one LLD (vehicle rental system). Referral got me the interview, the process moved quickly.

The coding rounds were medium to hard difficulty. I solved both, explained my reasoning throughout. The interviewer cared about the thought process, not just the answer — which I understood and tried to accommodate by narrating decisions as I made them.

System design was the round that cost me. The prompt: design a real-time metrics dashboard for restaurant performance. I went through the standard steps — clarified requirements, identified the read/write patterns, sketched an ingestion layer using a streaming message queue into aggregation services with a serving layer for the dashboard.

The architecture was correct. Every component I named was appropriate. The boxes were in the right places.

Then the interviewer started pushing: "Why a message queue here over a simpler pub-sub model?" "What's your aggregation window and what happens to late events?" "How do you scale the serving layer if the dashboard query rate spikes 10x?"

My answers were surface-level. I named the right tools but I couldn't go three or four levels deep on why each choice beat the alternatives in this specific scenario. I knew Kafka was the right choice. I couldn't explain it in a way that would convince a skeptical senior engineer.

The feedback: rejected on a combination of DSA speed and insufficient depth on system design tradeoffs. At senior level, the architecture diagram is just the starting point. The interview is whether you can defend every single choice.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 26. DOORDASH ──
  {
    slug: 'companies/doordash',
    title: 'The system design interviewer grabbed lunch at the start and never put it down',
    roleTitle: 'Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'doordash_lunch_interviewer',
    sourceUrl: 'https://www.jointaro.com/interviews/companies/doordash/experiences/software-engineer-san-francisco-ca-december-1-2024-no-offer-negative-c5d2d639/',
    body: `Standard DoorDash SWE loop: two coding rounds and one system design round.

The coding rounds were fine — nothing out of the ordinary, standard problem-solving format. I wasn't thrilled about either but they weren't disasters.

Then system design. Within the first minute, the interviewer mentioned he was going to eat lunch. He never clarified whether that meant he was going to grab something quickly or eat throughout the round. It was the latter.

I spent 45 minutes designing a distributed backend system while listening to someone eat. He would nod between bites, occasionally ask a follow-up with partial attention, and then drift back into his meal. Once I genuinely lost my thread because the distraction broke my concentration mid-sentence and I couldn't pick up where I'd left off.

I kept going. What else do you do — say "can you please stop eating?" and torch what's left of the loop?

Rejected a few days later.

The rejection doesn't bother me. What sticks is that somewhere in this process, someone decided this was an acceptable way to conduct a technical interview. The interview is the best behavior a company shows you. If a senior engineer thinks it's fine to eat through a candidate's system design round, that's information about how seriously they take the time of the people they're interviewing.

Also: the interviewer mentioned in passing that DoorDash has really bad work-life balance. So there's that.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 27. DOORDASH ──
  {
    slug: 'companies/doordash',
    title: 'Recruiter called between rounds to say they weren\'t moving forward — two interviews still scheduled got canceled',
    roleTitle: 'Backend SDE',
    stage: 'ONSITE',
    year: 2024,
    username: 'doordash_mid_loop_cut',
    sourceUrl: 'https://leetcode.com/discuss/post/8288207/doordash-interview-experience-rejected-b-dbct/',
    body: `DoorDash backend SDE loop: recruiter screen, tech screen, then a two-day virtual onsite with four rounds — Bug Bash, system design, coding, and a leadership round.

The tech screen went fine. The recruiter moved me to onsite and couldn't accommodate my request to swap the system design round to day two when I'd have more prep time. Understandable.

Day one opened with Bug Bash. The catch: the codebase was in C++, and I work primarily in Python. I flagged this before we started. The interviewer said it was fine to proceed in Python, but the friction of working in an unfamiliar language still showed in how I navigated the code.

System design followed. The prompt: a job scheduler. I started with functional requirements and the first API — then the interviewer interrupted: "Let's skip ahead to the main design." I moved to database schema. That's where the round unraveled. Every time I wrote a table column, he interrupted to question whether that table was sufficient. I couldn't finish a thought before the next interruption started.

By the end of the round both interviewers seemed okay with where things landed. No major open questions. Self-assessment: lean hire.

About an hour later, I got a call from the recruiter. They weren't moving forward. The remaining two rounds — coding and leadership — were canceled.

The feedback policy is no feedback. I asked. Couldn't share it.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 28. PALANTIR ──
  {
    slug: 'companies/palantir',
    title: 'Made it through four rounds, hit task 3 of the Learning interview, then "no matching position"',
    roleTitle: 'New Grad Software Engineer',
    stage: 'ONSITE',
    year: 2024,
    username: 'palantir_learning_task3',
    sourceUrl: 'https://leetcode.com/discuss/post/2787477/palantir-sde-new-grad-usa-oct-2022-rejec-o31g/',
    body: `Palantir's new grad process is genuinely different from other companies. The application itself is extensive — "Why Palantir?", "Which role?", "Why software engineering?" The content of your application affects whether you even get an OA link.

I cleared the OA (2 hours, 120 minutes, multiple sections). Then a Karat coding interview: 2 minutes of introduction, 15 minutes of complexity analysis questions, then two medium-difficulty graph problems. Both solved.

After Karat came the behavioral CTR phone screen — 45 minutes with a technical recruiter going deep on background, motivations, why computer science, what specifically about Palantir. Not a formality. After I cleared this I was told two more rounds would follow: Decomposition (roughly system design) and Learning.

I signed an NDA before the final two rounds were scheduled.

Decomposition: 20 minutes of behavioral context, then a system design problem with API design, component diagrams, data flow optimization. Went reasonably well.

Learning interview: the one that ended it. They gave me an unfamiliar concept — a plugin dependency manager — and a series of escalating implementation tasks. I had to learn the abstraction as I went and build on it. I reached Task 3 of what appeared to be 5 total tasks, then hit a multithreading requirement I couldn't implement quickly enough.

The recruiter emailed: "We don't currently have a position matching your skillset." No elaboration. When I asked for feedback given the time I'd invested across two months, she didn't respond.

The Learning round tests adaptability under real pressure, not existing knowledge. Getting to Task 3 means you can handle the first two shifts. It doesn't mean you cleared it.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 29. YC ──
  {
    slug: 'investors/yc',
    title: 'Applied to YC W24 with five drafts and strong referrals — rejected, and it was still worth it',
    roleTitle: 'Founder',
    stage: 'SCREEN',
    year: 2024,
    username: 'yc_w24_five_drafts',
    sourceUrl: 'https://sabinagal.com/p/startup-series-part-three-applying',
    body: `Applications for the Winter 2024 batch were at a record high — over 30,000. The acceptance rate was under 1%. I applied knowing those numbers and still found myself surprised when the rejection came.

I started working on the application six weeks before the deadline and submitted draft five. Each draft tried to simplify further: what problem are we solving, what's our unique insight, and why can't we state both in one clear sentence? The final version was much simpler than the first. I'm still not sure it was simple enough.

I had five founders who'd previously gotten into YC review my application, plus one who'd been on the admissions team. Their feedback was consistent: parts of the application were clear, parts were still internally obvious in a way that doesn't translate. The single most useful test was asking each reviewer to say in one sentence what the company did. When they couldn't, I rewrote.

I also got referrals from within the YC network — genuinely supportive founders who sent notes along with my application. I was fortunate for that level of support.

None of it cleared the bar.

What I learned: YC wants you to show up with problems you've already solved, not problems you're hoping funding will help you figure out. Growth is the metric that matters most above everything else, and the batch skewed heavily toward AI products with early traction. The application process itself is valuable regardless of outcome — it forces a clarity of thought that's genuinely hard to manufacture otherwise.

I'm applying again.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },

  // ── 30. a16z ──
  {
    slug: 'investors/a16z',
    title: 'The investor scowled through our entire pitch, lectured us on CAC and LTV — I left convinced I had failed my co-founders',
    roleTitle: 'Founder',
    stage: 'SCREEN',
    year: 2025,
    username: 'a16z_scowl_pitch',
    sourceUrl: 'https://speedrun.substack.com/p/on-dealing-with-rejection',
    body: `The meeting had been described by mutual connections as "friendly." I walked in feeling reasonably prepared and optimistic. Within the first five minutes it was clear this wasn't going to be that kind of meeting.

The investor spent the session scowling and lecturing us on unit economics — CAC, LTV, ACV — in a tone that made it clear he'd already made up his mind. He wasn't asking questions to understand the business. He was explaining to us why the business didn't work, using metrics we hadn't been asked about before the meeting started.

I kept my composure through it. I answered what I could, acknowledged the concerns, didn't get defensive. But I left the room convinced I'd embarrassed myself in front of my co-founders. That I'd failed to handle a hostile room and that they'd lose trust in me as a result.

The opposite happened. My co-founders told me they'd never work with someone who conducts himself that way, and that they'd been proud of how I handled it. That moment clarified something about co-founder relationships that I'd understood abstractly but hadn't felt: the people you build with matter more than any single meeting.

The practical note for anyone pitching investors: rejection from even a well-known fund is not a verdict on the company. Firms miss great companies constantly — the miss rate in VC is extremely high even at the top tier. Investor rejection is real data, but customer rejection is the data that matters. Revenue solves problems that no investor relationship does.

We kept building.

---
*Based on a real account, adapted for anonymity. / 실제 경험을 바탕으로 각색한 글입니다.*`,
  },
]

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

  console.log('Creating seed users...')
  const userIds: Record<string, string> = {}
  for (const post of POSTS) {
    if (userIds[post.username]) continue
    const rows = await sql`
      INSERT INTO users (id, username, supabase_auth_id, karma)
      VALUES (${randomUUID()}, ${post.username}, ${randomUUID()}, 0)
      ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `
    userIds[post.username] = rows[0].id as string
  }
  console.log(`Ensured ${Object.keys(userIds).length} users`)

  console.log(`\nInserting ${POSTS.length} real-sourced posts...`)
  let inserted = 0
  let skipped = 0

  for (const post of POSTS) {
    const communityId = COMMUNITY_IDS[post.slug]
    if (!communityId) {
      console.warn(`  SKIP — no community for: ${post.slug}`)
      skipped++
      continue
    }

    const authorId = userIds[post.username]
    const bodyWithSource = post.body.trimEnd() + `\n\n*Source: [${post.sourceUrl}] — Adapted for anonymity.*`

    try {
      await sql`
        INSERT INTO posts (id, title, body, community_id, author_id, vote_score, role_title, interview_stage, rejection_year)
        VALUES (
          ${randomUUID()},
          ${post.title},
          ${bodyWithSource},
          ${communityId},
          ${authorId},
          ${Math.floor(Math.random() * 89) + 3},
          ${post.roleTitle},
          ${post.stage},
          ${post.year}
        )
        ON CONFLICT DO NOTHING
      `
      console.log(`  OK  [${post.slug}] ${post.title.slice(0, 60)}...`)
      inserted++
    } catch (error: unknown) {
      const e = error as { code?: string; message?: string }
      // Duplicate title — skip
      if (e.code === '23505') {
        console.log(`  DUP [${post.slug}] ${post.title.slice(0, 60)}`)
        skipped++
      } else {
        console.error(`  ERR [${post.slug}] ${e.message ?? 'Unknown database error'}`)
        skipped++
      }
    }
  }

  const [{ count }] = await sql`SELECT COUNT(*) FROM posts`
  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`)
  console.log(`Total posts in DB: ${count}`)

  await sql.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
