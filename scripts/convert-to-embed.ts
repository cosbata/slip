import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

  const posts = await sql`
    SELECT id, title, body FROM posts
    WHERE body ILIKE '%Source:%' AND body ILIKE '%http%'
    AND (embed_url IS NULL OR embed_url = '')
  `
  console.log(`Found ${posts.length} posts`)

  let converted = 0
  for (const post of posts) {
    // Format: *Source: [https://...] — Adapted for anonymity.*
    const match = post.body?.match(/\*Source:\s*\[?(https?:\/\/[^\]\s*]+)\]?/)
    if (!match) { console.log('NO MATCH:', post.title.slice(0, 50)); continue }

    const sourceUrl = match[1].replace(/\*$/, '').trim()

    let embedType = 'link'
    if (sourceUrl.includes('reddit.com')) embedType = 'reddit'
    else if (sourceUrl.includes('teamblind.com')) embedType = 'blind'
    else if (sourceUrl.includes('medium.com')) embedType = 'medium'
    else if (sourceUrl.includes('linkedin.com')) embedType = 'linkedin'
    else if (sourceUrl.includes('leetcode.com')) embedType = 'leetcode'
    else if (sourceUrl.includes('jointaro.com')) embedType = 'jointaro'
    else if (sourceUrl.includes('ycombinator.com')) embedType = 'hackernews'
    else if (sourceUrl.includes('interviewexperiences.in')) embedType = 'interviewexp'
    else if (sourceUrl.includes('stackademic.com') || sourceUrl.includes('uxplanet.org')) embedType = 'medium'

    await sql`
      UPDATE posts SET embed_url = ${sourceUrl}, embed_type = ${embedType}, body = NULL
      WHERE id = ${post.id}
    `
    console.log(`✓ ${embedType.padEnd(14)} | ${post.title.slice(0, 52)}`)
    converted++
  }

  console.log(`\nConverted: ${converted}`)
  await sql.end()
}
main().catch(console.error)
