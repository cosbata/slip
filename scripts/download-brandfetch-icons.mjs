// Downloads icon (PNG or JPEG) for each brand from brandfetch.com
// Run: node scripts/download-brandfetch-icons.mjs

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGOS_DIR = join(__dirname, '../public/logos')

if (!existsSync(LOGOS_DIR)) mkdirSync(LOGOS_DIR, { recursive: true })

const BRANDS = [
  { slug: 'airbnb',           domain: 'airbnb.com' },
  { slug: 'airtable',         domain: 'airtable.com' },
  { slug: 'anthropic',        domain: 'anthropic.com' },
  { slug: 'apple',            domain: 'apple.com' },
  { slug: 'brex',             domain: 'brex.com' },
  { slug: 'bytedance',        domain: 'bytedance.com' },
  { slug: 'cloudflare',       domain: 'cloudflare.com' },
  { slug: 'coinbase',         domain: 'coinbase.com' },
  { slug: 'databricks',       domain: 'databricks.com' },
  { slug: 'deepmind',         domain: 'deepmind.com' },
  { slug: 'doordash',         domain: 'doordash.com' },
  { slug: 'dropbox',          domain: 'dropbox.com' },
  { slug: 'figma',            domain: 'figma.com' },
  { slug: 'google',           domain: 'google.com' },
  { slug: 'instacart',        domain: 'instacart.com' },
  { slug: 'lyft',             domain: 'lyft.com' },
  { slug: 'meta',             domain: 'meta.com' },
  { slug: 'netflix',          domain: 'netflix.com' },
  { slug: 'notion',           domain: 'notion.so' },
  { slug: 'nvidia',           domain: 'nvidia.com' },
  { slug: 'palantir',         domain: 'palantir.com' },
  { slug: 'robinhood',        domain: 'robinhood.com' },
  { slug: 'shopify',          domain: 'shopify.com' },
  { slug: 'snowflake',        domain: 'snowflake.com' },
  { slug: 'spotify',          domain: 'spotify.com' },
  { slug: 'square',           domain: 'squareup.com' },
  { slug: 'stripe',           domain: 'stripe.com' },
  { slug: 'tiktok',           domain: 'tiktok.com' },
  { slug: 'twitter',          domain: 'x.com' },
  { slug: 'uber',             domain: 'uber.com' },
  { slug: 'x',               domain: 'x.com' },
  { slug: 'zoom',             domain: 'zoom.us' },
  { slug: 'amazon',           domain: 'amazon.com' },
  { slug: 'linkedin',         domain: 'linkedin.com' },
  { slug: 'microsoft',        domain: 'microsoft.com' },
  { slug: 'openai',           domain: 'openai.com' },
  { slug: 'plaid',            domain: 'plaid.com' },
  { slug: 'ramp',             domain: 'ramp.com' },
  { slug: 'rippling',         domain: 'rippling.com' },
  { slug: 'salesforce',       domain: 'salesforce.com' },
  { slug: 'slack',            domain: 'slack.com' },
  { slug: 'toast',            domain: 'toasttab.com' },
  { slug: 'twilio',           domain: 'twilio.com' },
  { slug: 'a16z',             domain: 'a16z.com' },
  { slug: 'accel',            domain: 'accel.com' },
  { slug: 'benchmark',        domain: 'benchmark.com' },
  { slug: 'general-catalyst', domain: 'generalcatalyst.com' },
  { slug: 'greylock',         domain: 'greylock.com' },
  { slug: 'index',            domain: 'indexventures.com' },
  { slug: 'kpcb',             domain: 'kleinerperkins.com' },
  { slug: 'lightspeed',       domain: 'lsvp.com' },
  { slug: 'sequoia',          domain: 'sequoiacap.com' },
  { slug: 'yc',               domain: 'ycombinator.com' },
]

async function downloadIconForBrand(page, slug, domain) {
  const url = `https://brandfetch.com/${domain}`
  console.log(`[${slug}] → ${url}`)

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 })
    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(2500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
  } catch (err) {
    console.log(`  [${slug}] ✗ navigation error: ${err.message.split('\n')[0]}`)
    return null
  }

  // Find icon image: look for /icon.png or /icon.jpeg in src
  // Prefer higher resolution (400px over 320px)
  const iconInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    const icons = imgs
      .map(img => img.src || img.getAttribute('data-src') || '')
      .filter(src => src && src.includes('cdn.brandfetch.io') && /\/icon\.(png|jpeg|jpg|webp)/.test(src))
    if (icons.length === 0) return null
    // Prefer 400px version
    const big = icons.find(s => s.includes('w/400'))
    return { url: big || icons[0], ext: (big || icons[0]).match(/\/icon\.(\w+)/)[1] }
  })

  if (!iconInfo) {
    console.log(`  [${slug}] ⚠ no icon image found on page`)
    return null
  }

  // Fetch via browser context (bypasses hotlink protection)
  const buffer = await page.evaluate(async (imgUrl) => {
    try {
      const res = await fetch(imgUrl)
      if (!res.ok) return null
      const ab = await res.arrayBuffer()
      return Array.from(new Uint8Array(ab))
    } catch {
      return null
    }
  }, iconInfo.url)

  if (!buffer || buffer.length < 100) {
    console.log(`  [${slug}] ✗ fetch failed or empty for ${iconInfo.url}`)
    return null
  }

  // Save as .png regardless of source format (rename convention)
  const outPath = join(LOGOS_DIR, `${slug}.png`)
  writeFileSync(outPath, Buffer.from(buffer))
  console.log(`  [${slug}] ✓ saved ${iconInfo.ext}→png (${(buffer.length / 1024).toFixed(1)}kb) ${iconInfo.url.split('?')[0]}`)
  return { slug, ext: iconInfo.ext }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  const ok = [], failed = []

  for (const { slug, domain } of BRANDS) {
    const result = await downloadIconForBrand(page, slug, domain)
    if (result) ok.push(slug)
    else failed.push(slug)
    await page.waitForTimeout(500)
  }

  await browser.close()

  console.log('\n=== Summary ===')
  console.log(`✓ ${ok.length} downloaded: ${ok.join(', ')}`)
  if (failed.length) console.log(`✗ ${failed.length} failed: ${failed.join(', ')}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
