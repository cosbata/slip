import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema'
import { eq } from 'drizzle-orm'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client, { schema })

const DEFAULT_RULES = `1. No real names of individuals (interviewers, recruiters, partners)\n2. Share experiences, not rumors\n3. Be respectful — rejection is hard for everyone\n4. Mark sensitive content appropriately`

const COMPANIES: { slug: string; name: string; subs: string[] }[] = [
  { slug: 'companies/google', name: 'Google', subs: ['swe', 'pm', 'design'] },
  { slug: 'companies/meta', name: 'Meta', subs: ['swe', 'pm'] },
  { slug: 'companies/apple', name: 'Apple', subs: ['swe', 'design'] },
  { slug: 'companies/amazon', name: 'Amazon', subs: ['swe', 'pm'] },
  { slug: 'companies/microsoft', name: 'Microsoft', subs: ['swe', 'pm'] },
  { slug: 'companies/netflix', name: 'Netflix', subs: ['swe', 'pm'] },
  { slug: 'companies/stripe', name: 'Stripe', subs: ['swe', 'pm'] },
  { slug: 'companies/openai', name: 'OpenAI', subs: ['swe', 'research'] },
  { slug: 'companies/anthropic', name: 'Anthropic', subs: ['swe', 'research'] },
  { slug: 'companies/deepmind', name: 'DeepMind', subs: ['swe', 'research'] },
  { slug: 'companies/nvidia', name: 'NVIDIA', subs: ['swe', 'research'] },
  { slug: 'companies/salesforce', name: 'Salesforce', subs: ['swe', 'pm'] },
  { slug: 'companies/uber', name: 'Uber', subs: ['swe', 'pm'] },
  { slug: 'companies/airbnb', name: 'Airbnb', subs: ['swe', 'design'] },
  { slug: 'companies/twitter', name: 'X (Twitter)', subs: ['swe', 'pm'] },
  { slug: 'companies/linkedin', name: 'LinkedIn', subs: ['swe', 'pm'] },
  { slug: 'companies/spotify', name: 'Spotify', subs: ['swe', 'pm'] },
  { slug: 'companies/shopify', name: 'Shopify', subs: ['swe', 'pm'] },
  { slug: 'companies/coinbase', name: 'Coinbase', subs: ['swe', 'pm'] },
  { slug: 'companies/figma', name: 'Figma', subs: ['swe', 'design'] },
  { slug: 'companies/notion', name: 'Notion', subs: ['swe', 'pm'] },
  { slug: 'companies/vercel', name: 'Vercel', subs: ['swe'] },
  { slug: 'companies/databricks', name: 'Databricks', subs: ['swe', 'ml'] },
  { slug: 'companies/snowflake', name: 'Snowflake', subs: ['swe', 'pm'] },
  { slug: 'companies/palantir', name: 'Palantir', subs: ['swe', 'pm'] },
  { slug: 'companies/bytedance', name: 'ByteDance', subs: ['swe', 'pm'] },
  { slug: 'companies/samsung', name: 'Samsung', subs: ['swe', 'design'] },
  { slug: 'companies/kakao', name: 'Kakao', subs: ['swe', 'pm'] },
  { slug: 'companies/naver', name: 'Naver', subs: ['swe', 'pm'] },
  { slug: 'companies/line', name: 'LINE', subs: ['swe', 'pm'] },
  { slug: 'companies/coupang', name: 'Coupang', subs: ['swe', 'pm'] },
  { slug: 'companies/krafton', name: 'KRAFTON', subs: ['swe', 'design'] },
  { slug: 'companies/toss', name: 'Toss (Viva Republica)', subs: ['swe', 'pm'] },
  { slug: 'companies/twilio', name: 'Twilio', subs: ['swe'] },
  { slug: 'companies/cloudflare', name: 'Cloudflare', subs: ['swe'] },
  { slug: 'companies/doordash', name: 'DoorDash', subs: ['swe', 'pm'] },
  { slug: 'companies/instacart', name: 'Instacart', subs: ['swe', 'pm'] },
  { slug: 'companies/ramp', name: 'Ramp', subs: ['swe', 'pm'] },
  { slug: 'companies/brex', name: 'Brex', subs: ['swe', 'pm'] },
  { slug: 'companies/scale-ai', name: 'Scale AI', subs: ['swe', 'ml'] },
  { slug: 'companies/hugging-face', name: 'Hugging Face', subs: ['swe', 'ml'] },
  { slug: 'companies/mistral', name: 'Mistral AI', subs: ['swe', 'research'] },
  { slug: 'companies/cohere', name: 'Cohere', subs: ['swe', 'ml'] },
  { slug: 'companies/rippling', name: 'Rippling', subs: ['swe', 'pm'] },
  { slug: 'companies/retool', name: 'Retool', subs: ['swe'] },
  { slug: 'companies/airtable', name: 'Airtable', subs: ['swe', 'pm'] },
  { slug: 'companies/linear', name: 'Linear', subs: ['swe', 'design'] },
  { slug: 'companies/supabase', name: 'Supabase', subs: ['swe'] },
  { slug: 'companies/planetscale', name: 'PlanetScale', subs: ['swe'] },
  { slug: 'companies/github', name: 'GitHub', subs: ['swe', 'pm'] },
]

const INVESTORS: { slug: string; name: string; subs: string[] }[] = [
  { slug: 'investors/yc', name: 'Y Combinator', subs: ['s25', 'w25', 's24', 'w24'] },
  { slug: 'investors/a16z', name: 'Andreessen Horowitz (a16z)', subs: ['seed', 'series-a'] },
  { slug: 'investors/sequoia', name: 'Sequoia Capital', subs: ['seed', 'series-a'] },
  { slug: 'investors/benchmark', name: 'Benchmark', subs: ['series-a'] },
  { slug: 'investors/founders-fund', name: 'Founders Fund', subs: ['seed', 'series-a'] },
  { slug: 'investors/general-catalyst', name: 'General Catalyst', subs: ['seed', 'series-a'] },
  { slug: 'investors/accel', name: 'Accel', subs: ['seed', 'series-a'] },
  { slug: 'investors/lightspeed', name: 'Lightspeed', subs: ['seed', 'series-a'] },
  { slug: 'investors/greylock', name: 'Greylock', subs: ['seed', 'series-a'] },
  { slug: 'investors/index-ventures', name: 'Index Ventures', subs: ['seed', 'series-a'] },
  { slug: 'investors/bessemer', name: 'Bessemer Venture Partners', subs: ['series-a'] },
  { slug: 'investors/tiger-global', name: 'Tiger Global', subs: ['growth'] },
  { slug: 'investors/softbank', name: 'SoftBank Vision Fund', subs: ['growth'] },
  { slug: 'investors/coatue', name: 'Coatue', subs: ['growth'] },
  { slug: 'investors/khosla', name: 'Khosla Ventures', subs: ['seed', 'series-a'] },
  { slug: 'investors/neo', name: 'NEO', subs: ['seed'] },
  { slug: 'investors/first-round', name: 'First Round Capital', subs: ['seed'] },
  { slug: 'investors/initialized', name: 'Initialized Capital', subs: ['seed'] },
  { slug: 'investors/sv-angel', name: 'SV Angel', subs: ['seed'] },
  { slug: 'investors/500-startups', name: '500 Global', subs: ['pre-seed', 'seed'] },
  { slug: 'investors/techstars', name: 'Techstars', subs: ['program'] },
  { slug: 'investors/antler', name: 'Antler', subs: ['pre-seed'] },
  { slug: 'investors/kakao-ventures', name: 'Kakao Ventures', subs: ['seed', 'series-a'] },
  { slug: 'investors/kv', name: 'Korea Investment Partners', subs: ['seed', 'series-a'] },
  { slug: 'investors/strong-ventures', name: 'Strong Ventures', subs: ['seed'] },
]

async function seed() {
  console.log('Seeding communities...\n')
  let created = 0

  const allEntries = [
    ...COMPANIES.map(c => ({ ...c, track: 'COMPANIES' as const })),
    ...INVESTORS.map(c => ({ ...c, track: 'INVESTORS' as const })),
  ]

  for (const entry of allEntries) {
    // Check if already exists
    const existing = await db.select().from(schema.communities)
      .where(eq(schema.communities.slug, entry.slug))

    let parentId: string

    if (existing[0]) {
      parentId = existing[0].id
      console.log(`  SKIP  ${entry.slug} (already exists)`)
    } else {
      const [parent] = await db.insert(schema.communities).values({
        slug: entry.slug,
        name: entry.name,
        track: entry.track,
        sidebarRules: DEFAULT_RULES,
      }).returning()
      parentId = parent.id
      created++
      console.log(`  OK    ${entry.slug}`)
    }

    // Sub-communities
    for (const sub of entry.subs) {
      const subSlug = `${entry.slug}/${sub}`
      const existingSub = await db.select().from(schema.communities)
        .where(eq(schema.communities.slug, subSlug))

      if (!existingSub[0]) {
        await db.insert(schema.communities).values({
          slug: subSlug,
          name: sub.toUpperCase(),
          track: entry.track,
          parentCommunityId: parentId,
          sidebarRules: DEFAULT_RULES,
        })
        created++
        console.log(`    OK  ${subSlug}`)
      }
    }
  }

  console.log(`\nDone! Created ${created} communities.`)
  await client.end()
}

seed().catch(err => { console.error(err); process.exit(1) })
