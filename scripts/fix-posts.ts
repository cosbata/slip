import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 5 })

  // ─── 1. Fetch current posts ───────────────────────────────────────────────
  const posts = await sql`SELECT id, title, role_title, interview_stage FROM posts ORDER BY title`
  console.log(`Current post count: ${posts.length}`)

  // ─── 2. Create 62 unique anonymous users ─────────────────────────────────
  console.log('\n=== Creating unique users... ===')
  const UNIQUE_USERS = [
    // Google
    'eu_office_swe_throwaway', 'sea_swe_anon', 'l4_graph_fail', 'ml_domain_anon',
    'googlyness_reject', 'intern_ats_anon',
    // Amazon
    'amazon_lp_gap_anon', 'amazon_sd_shock', 'pattern_blind_anon', 'new_grad_believed', 'recycled_not_rejected',
    // Meta
    'london_e5_anon', 'meta_supplemental_fail', 'behavioral_bench_anon',
    // Apple
    'comp_gate_anon', 'fit_unconvincing_anon',
    // Stripe
    'stripe_followup_anon', 'stripe_2of3_anon', 'bugsquash_fail_anon',
    // Netflix
    'returnless_intern_anon', 'ic_mgr_penalized_anon',
    // Microsoft
    'aa_round_fail_anon', 'verbal_offer_yanked', 'bst_rusty_anon', 'cant_explain_own_project',
    // Airbnb
    'airbnb_blackbox_anon', 'accountability_dispute_anon',
    // Shopify
    'production_graded_anon', 'early_finish_reject', 'format_mismatch_anon',
    // Figma
    'figma_8hrs_anon', 'figma_p1_incomplete',
    // LinkedIn
    'li_feedback_lies_anon', 'li_ghost_2wk_anon', 'li_template_reject',
    // Uber
    'uber_lld_overtalk', 'uber_kafka_anon',
    // Datadog
    'dd_one_veto_anon', 'dd_bg_mismatch_anon', 'dd_2part_nobody_told',
    // OpenAI
    'oai_all_easy_anon', 'oai_domain_gap_anon', 'oai_oa_part2_anon',
    // Coinbase
    'cb_extension_fail_anon', 'cb_silent_phone_anon',
    // ByteDance
    'bd_hudi_shallow_anon', 'bd_format_lied_anon',
    // Palantir
    'pal_learning_task3', 'pal_karat_2of3', 'pal_flesh_out_anon',
    // GitHub
    'gh_6hire_hc_no_anon', 'gh_karat_redo_anon',
    // DoorDash
    'dd_lunch_interviewer', 'dd_schema_interrupt',
    // Notion
    'notion_mystery_final', 'notion_hint_ignored',
    // Databricks
    'db_ood_surprise_anon', 'db_pos_negative_anon',
    // Ramp / Brex
    'ramp_gmail_anon', 'brex_no_leet_anon',
    // YC
    'yc_w25_5drafts', 'yc_s25_4lessons', 'yc_solo_cofounder',
  ]

  const userIds: Record<string, string> = {}
  for (const username of UNIQUE_USERS) {
    const rows = await sql`
      INSERT INTO users (id, username, supabase_auth_id, karma)
      VALUES (${randomUUID()}, ${username}, ${randomUUID()}, 0)
      ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `
    userIds[username] = rows[0].id as string
  }
  console.log(`Created ${Object.keys(userIds).length} users`)

  // ─── 3. Assign unique user per post + fix role titles ────────────────────
  // (title → {author, roleTitle} mapping)
  const POST_MAP: Record<string, { author: string; roleTitle: string }> = {
    // Google
    'Four rounds, one No Hire on a graph problem, and that was the whole loop':
      { author: 'eu_office_swe_throwaway', roleTitle: 'Software Engineer III' },
    'Three Strong Hires, made it to team matching, then the HC said no':
      { author: 'sea_swe_anon', roleTitle: 'Software Engineer L3' },
    'Overcomplicated a two-pointer problem and ignored the hint':
      { author: 'l4_graph_fail', roleTitle: 'Software Engineer L4' },
    'Aced the DSA rounds, then answered ML questions like an engineer instead of a product person':
      { author: 'ml_domain_anon', roleTitle: 'Software Engineer III (ML)' },
    'No working code on the graph round, and communication flagged in Googlyness':
      { author: 'googlyness_reject', roleTitle: 'Software Engineer L3' },
    'Got the personalized "you passed our screen" email — then rejected on an eligibility rule':
      { author: 'intern_ats_anon', roleTitle: 'Software Engineering Intern' },
    // Amazon
    'Passed every round I could see, rejected with no reason five days later':
      { author: 'amazon_lp_gap_anon', roleTitle: 'System Development Engineer (SDE L5)' },
    'Told my system design was weak — the one round I thought I crushed':
      { author: 'amazon_sd_shock', roleTitle: 'SDE II' },
    'Knew every single problem and still went completely blank on implementation':
      { author: 'pattern_blind_anon', roleTitle: 'SDE II' },
    'Three rounds, every interviewer seemed satisfied, and I still believed I had it':
      { author: 'new_grad_believed', roleTitle: 'New Grad SDE' },
    '"Moving forward with other candidates" — recycled, not rejected':
      { author: 'recycled_not_rejected', roleTitle: 'SDE II' },
    // Meta
    'Both coding rounds came back No Hire — and I genuinely thought one was a slam dunk':
      { author: 'london_e5_anon', roleTitle: 'Software Engineer E5' },
    'Crushed the middle of the loop, then the surprise supplemental round buried me':
      { author: 'meta_supplemental_fail', roleTitle: 'Software Engineer E4' },
    'My coding was fine. The behavioral rapid-fire is what actually sank me':
      { author: 'behavioral_bench_anon', roleTitle: 'Software Engineer E5' },
    // Apple
    'Passed all six rounds, talked comp, then they selected another candidate — and reposted the role next day':
      { author: 'comp_gate_anon', roleTitle: 'Software Engineer (IC3/IC4)' },
    '"Technically fine, fit unconvincing" — I aced the engineering and whiffed the team-interest question':
      { author: 'fit_unconvincing_anon', roleTitle: 'Senior Software Engineer (Platform)' },
    // Stripe
    'Solved the problem and one follow-up — at Stripe that is not enough':
      { author: 'stripe_followup_anon', roleTitle: 'Backend Engineer' },
    'New grad, solved 2 of 3 in time — and at Stripe 2 of 3 is a reject':
      { author: 'stripe_2of3_anon', roleTitle: 'Software Engineer (New Grad)' },
    'Made it to the Bug Squash round and got lost in a huge unfamiliar codebase':
      { author: 'bugsquash_fail_anon', roleTitle: 'Software Engineer (New Grad)' },
    // Netflix
    'Five months in, no return offer — did not meet the bar for a mid-level engineer':
      { author: 'returnless_intern_anon', roleTitle: 'Software Engineer (Short-Term / Internship)' },
    'Rejected from a senior IC role because I have managed before':
      { author: 'ic_mgr_penalized_anon', roleTitle: 'Senior Software Engineer (IC)' },
    // Microsoft
    'Passed every round at Microsoft, then the AA round buried me on system design':
      { author: 'aa_round_fail_anon', roleTitle: 'Software Engineer' },
    'Got an informal offer at Microsoft Redmond, then a rejection — half the loop felt hostile':
      { author: 'verbal_offer_yanked', roleTitle: 'Software Engineer' },
    'Three great onsite rounds at Microsoft, one botched data structure — and that was enough to reject me':
      { author: 'bst_rusty_anon', roleTitle: 'Software Engineer II (SDE II)' },
    'I solved the coding problem at Microsoft but could not explain my own past project':
      { author: 'cant_explain_own_project', roleTitle: 'Software Engineer' },
    // Airbnb
    'Airbnb told me I did well, then went with someone else — the rounds were a black box':
      { author: 'airbnb_blackbox_anon', roleTitle: 'Software Engineer' },
    'Passed Airbnb coding and system design — sunk by a behavioral round I still disagree with':
      { author: 'accountability_dispute_anon', roleTitle: 'Senior Software Engineer' },
    // Shopify
    'Shopify does not grade LeetCode — they grade whether your code is production-ready':
      { author: 'production_graded_anon', roleTitle: 'Software Engineer' },
    'Crushed Shopify coding challenge, finished 20 minutes early — and got cut at screening anyway':
      { author: 'early_finish_reject', roleTitle: 'Senior Software Engineer' },
    'Shopify called it a real-world implementation problem — it was DSA and I was not ready':
      { author: 'format_mismatch_anon', roleTitle: 'Software Engineer' },
    // Figma
    'Two months and 8 hours of interviews at Figma — rejected on coding after three strong rounds':
      { author: 'figma_8hrs_anon', roleTitle: 'Software Engineer' },
    'Fun pair-programming round at Figma — but I did not finish part one':
      { author: 'figma_p1_incomplete', roleTitle: 'Software Engineer' },
    // LinkedIn
    'Solved both coding problems in under an hour. Rejected. Then told I needed lots of hints.':
      { author: 'li_feedback_lies_anon', roleTitle: 'Senior Software Engineer (SDE-3 equivalent)' },
    'Ghosted for two weeks after 5 onsite rounds, had to beg a different recruiter for the rejection':
      { author: 'li_ghost_2wk_anon', roleTitle: 'Staff Software Engineer' },
    'Infrastructure SWE: passed every round, rejected for "slightly more experience" — felt like a template':
      { author: 'li_template_reject', roleTitle: 'Software Engineer, Infrastructure' },
    // Uber
    'Backend loop: nailed three coding rounds, then burned my LLD round talking instead of typing':
      { author: 'uber_lld_overtalk', roleTitle: 'Software Engineer (L4 / SDE-2)' },
    'Senior SWE: drew a clean Kafka pipeline, rejected for not defending the trade-offs deeply enough':
      { author: 'uber_kafka_anon', roleTitle: 'Senior Software Engineer' },
    // Datadog
    'Made it through the full onsite — one interviewer was not satisfied and that was the whole ballgame':
      { author: 'dd_one_veto_anon', roleTitle: 'Software Engineer II' },
    'Behavioral interviewer kept cutting me off. Tech interviewer quizzed a backend hire on frontend JS trivia.':
      { author: 'dd_bg_mismatch_anon', roleTitle: 'Senior Software Engineer' },
    'The CoderPad exercise had two parts. Nobody told me. I solved one and got rejected.':
      { author: 'dd_2part_nobody_told', roleTitle: 'Senior Software Engineer' },
    // OpenAI
    'Every onsite round felt easy. I got rejected anyway and have no idea what I would even fix.':
      { author: 'oai_all_easy_anon', roleTitle: 'Staff Engineer' },
    'AI companies make you design the systems they actually run — my system design was not ready for that':
      { author: 'oai_domain_gap_anon', roleTitle: 'Full-stack Engineer' },
    'OA was multi-part and I did not finish the second section':
      { author: 'oai_oa_part2_anon', roleTitle: 'Software Engineer' },
    // Coinbase
    'New grad backend: ran out of time on the second extension and got cut':
      { author: 'cb_extension_fail_anon', roleTitle: 'New Grad Backend Engineer (G2501)' },
    'Thought I nailed the DSA phone screen — the next call never came':
      { author: 'cb_silent_phone_anon', roleTitle: 'Software Engineer' },
    // ByteDance/TikTok
    'One shallow answer on big data tech and the data infrastructure loop ended that day':
      { author: 'bd_hudi_shallow_anon', roleTitle: 'Junior Engineer, Data Infrastructure (TikTok)' },
    'HR said regular technical — it was system design heavy and my LeetCode prep was useless':
      { author: 'bd_format_lied_anon', roleTitle: 'Backend Engineer (TikTok)' },
    // Palantir
    'New grad: reached task 3 of the Learning round and got "no matching position"':
      { author: 'pal_learning_task3', roleTitle: 'Software Engineer (New Grad)' },
    'Onsite day: passed the coding but did not flesh out the answer enough':
      { author: 'pal_flesh_out_anon', roleTitle: 'Software Engineer' },
    // GitHub (Atlassian-sourced)
    'Six rounds, six Hire ratings — the hiring committee said no anyway':
      { author: 'gh_6hire_hc_no_anon', roleTitle: 'Software Engineer (SDE-2)' },
    'Did really well on the Karat redo — they judged me on the first one anyway':
      { author: 'gh_karat_redo_anon', roleTitle: 'Software Engineer' },
    // DoorDash
    'System design interview where the interviewer ate lunch the entire time':
      { author: 'dd_lunch_interviewer', roleTitle: 'Software Engineer' },
    'Recruiter called it after the system design round and canceled my remaining interviews':
      { author: 'dd_schema_interrupt', roleTitle: 'SDE (Backend)' },
    // Notion
    'Six rounds of positive feedback, then a mystery rejection on the final UI exercise':
      { author: 'notion_mystery_final', roleTitle: 'Senior Software Engineer' },
    'No Hire after I defended my solution instead of exploring the interviewer hint':
      { author: 'notion_hint_ignored', roleTitle: 'Software Engineer' },
    // Databricks
    'New grad loop ended on an OOD/LLD round I had no idea was Amazon-style':
      { author: 'db_ood_surprise_anon', roleTitle: 'Software Engineer (New Grad)' },
    'Interviewers said I solved every problem correctly, then rejected me to improve technical skills':
      { author: 'db_pos_negative_anon', roleTitle: 'Software Engineer' },
    // Ramp
    'Coding interview delivered through Gmail while I navigated Calendar live on Zoom':
      { author: 'ramp_gmail_anon', roleTitle: 'Software Engineer' },
    // Brex
    'Solved every phone-screen problem in time, rejected with zero feedback at a non-LeetCode company':
      { author: 'brex_no_leet_anon', roleTitle: 'Software Engineer' },
    // YC
    'W25 rejection after 5 drafts and 6 weeks — even strong founder referrals did not save it':
      { author: 'yc_w25_5drafts', roleTitle: 'Founder (Smart Home Startup)' },
    'First YC rejection (S25): four concrete lessons beat one vague disappointment':
      { author: 'yc_s25_4lessons', roleTitle: 'Founder (Travel Tech Startup)' },
    'Three profitable micro-SaaS as a solo founder. YC rejected me: no cofounder.':
      { author: 'yc_solo_cofounder', roleTitle: 'Solo Founder' },
  }

  // Update posts
  let updated = 0
  for (const post of posts) {
    const mapping = POST_MAP[post.title]
    if (!mapping) {
      console.warn(`No mapping: ${post.title.slice(0, 50)}`)
      continue
    }
    const authorId = userIds[mapping.author]
    if (!authorId) {
      console.warn(`No user ID found: ${mapping.author}`)
      continue
    }
    await sql`
      UPDATE posts SET author_id = ${authorId}, role_title = ${mapping.roleTitle}
      WHERE id = ${post.id as string}
    `
    updated++
  }
  console.log(`\nPosts updated: ${updated}/${posts.length}`)

  // ─── 4. Create Datadog community ──────────────────────────────────────────
  console.log('\n=== Creating Datadog community ===')
  const sysUser = await sql`SELECT id FROM users LIMIT 1`
  const creatorId = sysUser[0].id as string

  const ddParent = await sql`
    INSERT INTO communities (id, slug, name, track, sidebar_rules, created_by_id)
    VALUES (${randomUUID()}, 'companies/datadog', 'Datadog', 'COMPANIES',
      '1. No real names of individuals\n2. Share experiences, not rumors\n3. Be respectful',
      ${creatorId})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  const ddParentId = ddParent[0].id as string

  const ddSwe = await sql`
    INSERT INTO communities (id, slug, name, track, parent_community_id, created_by_id)
    VALUES (${randomUUID()}, 'companies/datadog/swe', 'SWE', 'COMPANIES', ${ddParentId}, ${creatorId})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  const ddInfra = await sql`
    INSERT INTO communities (id, slug, name, track, parent_community_id, created_by_id)
    VALUES (${randomUUID()}, 'companies/datadog/infra', 'Infrastructure', 'COMPANIES', ${ddParentId}, ${creatorId})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `
  console.log(`Datadog community created: ${ddParentId}`)

  // Reassign Datadog posts from Databricks → Datadog/swe
  const ddSweCommunityId = ddSwe[0].id as string
  const reassigned = await sql`
    UPDATE posts SET community_id = ${ddSweCommunityId}
    WHERE (title ILIKE '%datadog%' OR body ILIKE '%Company**: Datadog%')
      AND community_id = (SELECT id FROM communities WHERE slug = 'companies/databricks/swe')
  `
  console.log(`Datadog posts reassigned`)

  // ─── 5. Add sub-communities based on post data ────────────────────────────
  console.log('\n=== Adding sub-communities (based on post data) ===')

  // Sub-communities to add: {slug, name, parent_slug}
  const NEW_SUBS: Array<{ slug: string; name: string; parentSlug: string }> = [
    // Google — interview types in our posts
    { slug: 'companies/google/new-grad',      name: 'New Grad / Intern',      parentSlug: 'companies/google' },
    { slug: 'companies/google/ml',            name: 'ML / AI Research',       parentSlug: 'companies/google' },
    { slug: 'companies/google/behavioral',    name: 'Behavioral / Googlyness',parentSlug: 'companies/google' },
    { slug: 'companies/google/system-design', name: 'System Design',          parentSlug: 'companies/google' },
    // Amazon
    { slug: 'companies/amazon/behavioral-lp', name: 'Behavioral / LP',        parentSlug: 'companies/amazon' },
    { slug: 'companies/amazon/system-design', name: 'System Design',          parentSlug: 'companies/amazon' },
    { slug: 'companies/amazon/new-grad',      name: 'New Grad / OA',          parentSlug: 'companies/amazon' },
    // Meta
    { slug: 'companies/meta/behavioral',      name: 'Behavioral / Jedi',      parentSlug: 'companies/meta' },
    { slug: 'companies/meta/coding',          name: 'Coding Round',           parentSlug: 'companies/meta' },
    // Apple
    { slug: 'companies/apple/culture-fit',    name: 'Culture / Team Fit',     parentSlug: 'companies/apple' },
    // Stripe
    { slug: 'companies/stripe/new-grad',      name: 'New Grad',               parentSlug: 'companies/stripe' },
    { slug: 'companies/stripe/infra',         name: 'Infrastructure / API',   parentSlug: 'companies/stripe' },
    // Netflix
    { slug: 'companies/netflix/culture-fit',  name: 'Culture Fit',            parentSlug: 'companies/netflix' },
    { slug: 'companies/netflix/infra',        name: 'Infrastructure / Platform', parentSlug: 'companies/netflix' },
    // Microsoft
    { slug: 'companies/microsoft/system-design', name: 'System Design',       parentSlug: 'companies/microsoft' },
    { slug: 'companies/microsoft/new-grad',   name: 'New Grad',               parentSlug: 'companies/microsoft' },
    // Airbnb
    { slug: 'companies/airbnb/code-review',   name: 'Code Review',            parentSlug: 'companies/airbnb' },
    { slug: 'companies/airbnb/backend',       name: 'Backend / Infra',        parentSlug: 'companies/airbnb' },
    // Shopify
    { slug: 'companies/shopify/take-home',    name: 'Take-home / Pair Programming', parentSlug: 'companies/shopify' },
    { slug: 'companies/shopify/backend',      name: 'Backend / Full-stack',   parentSlug: 'companies/shopify' },
    // Figma
    { slug: 'companies/figma/frontend',       name: 'Frontend / UI',          parentSlug: 'companies/figma' },
    // Datadog
    { slug: 'companies/datadog/infra',        name: 'Infrastructure / Observability', parentSlug: 'companies/datadog' },
    // LinkedIn
    { slug: 'companies/linkedin/infra',       name: 'Infrastructure',         parentSlug: 'companies/linkedin' },
    { slug: 'companies/linkedin/backend',     name: 'Backend',                parentSlug: 'companies/linkedin' },
    // Uber
    { slug: 'companies/uber/lld',             name: 'LLD / Machine Coding',   parentSlug: 'companies/uber' },
    { slug: 'companies/uber/backend',         name: 'Backend / Platform',     parentSlug: 'companies/uber' },
    // OpenAI
    { slug: 'companies/openai/ml',            name: 'ML / Research',          parentSlug: 'companies/openai' },
    { slug: 'companies/openai/system-design', name: 'System Design',          parentSlug: 'companies/openai' },
    // Coinbase
    { slug: 'companies/coinbase/backend',     name: 'Backend / Crypto',       parentSlug: 'companies/coinbase' },
    { slug: 'companies/coinbase/new-grad',    name: 'New Grad',               parentSlug: 'companies/coinbase' },
    // ByteDance/TikTok
    { slug: 'companies/bytedance/ml',         name: 'ML / Data',              parentSlug: 'companies/bytedance' },
    { slug: 'companies/bytedance/backend',    name: 'Backend / Infra',        parentSlug: 'companies/bytedance' },
    // Palantir
    { slug: 'companies/palantir/learning-round', name: 'Learning / Decomposition Round', parentSlug: 'companies/palantir' },
    { slug: 'companies/palantir/new-grad',    name: 'New Grad',               parentSlug: 'companies/palantir' },
    // DoorDash
    { slug: 'companies/doordash/backend',     name: 'Backend / Platform',     parentSlug: 'companies/doordash' },
    { slug: 'companies/doordash/system-design', name: 'System Design',        parentSlug: 'companies/doordash' },
    // Notion
    { slug: 'companies/notion/frontend',      name: 'Frontend / Full-stack',  parentSlug: 'companies/notion' },
    // Databricks
    { slug: 'companies/databricks/ml',        name: 'ML / Data Engineering',  parentSlug: 'companies/databricks' },
    { slug: 'companies/databricks/backend',   name: 'Backend / Infra',        parentSlug: 'companies/databricks' },
    // Ramp / Brex
    { slug: 'companies/ramp/fintech',         name: 'Fintech / Payments',     parentSlug: 'companies/ramp' },
    { slug: 'companies/brex/fintech',         name: 'Fintech / Payments',     parentSlug: 'companies/brex' },
  ]

  let subCreated = 0
  for (const sub of NEW_SUBS) {
    const parent = await sql`SELECT id FROM communities WHERE slug = ${sub.parentSlug}`
    if (parent.length === 0) { console.warn(`Parent not found: ${sub.parentSlug}`); continue }
    await sql`
      INSERT INTO communities (id, slug, name, track, parent_community_id, created_by_id)
      VALUES (${randomUUID()}, ${sub.slug}, ${sub.name}, 'COMPANIES', ${parent[0].id as string}, ${creatorId})
      ON CONFLICT (slug) DO NOTHING
    `
    subCreated++
  }
  console.log(`${subCreated} sub-communities added`)

  // ─── Final verification ───────────────────────────────────────────────────
  const finalDist = await sql`
    SELECT u.username, COUNT(p.id) as n
    FROM posts p JOIN users u ON p.author_id = u.id
    GROUP BY u.username HAVING COUNT(p.id) > 1`
  if (finalDist.length === 0) {
    console.log('\n✅ All posts have unique users')
  } else {
    console.log('\n⚠️ Duplicate users:', finalDist)
  }

  const totalComms = await sql`SELECT COUNT(*) as n FROM communities`
  console.log(`Total communities: ${totalComms[0].n}`)

  await sql.end()
}
main().catch(console.error)
