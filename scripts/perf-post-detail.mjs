import { chromium } from 'playwright'

const origin = process.env.PERF_ORIGIN || 'https://slip.wtf'
const postPath = '/p/f7b2c5c6-1227-47f9-90b1-1681ed44c827'
const postUrl = `${origin}${postPath}`
const pass = []
const fail = []

async function timedFetch(label, url, maxMs) {
  const start = performance.now()
  const res = await fetch(url, { redirect: 'follow' })
  await res.arrayBuffer()
  const total = performance.now() - start
  const item = `${label}: ${Math.round(total)}ms status=${res.status}`
  ;(res.ok && total <= maxMs ? pass : fail).push(item)
  return total
}

await timedFetch('warm post document 1', postUrl, 1500)
await timedFetch('warm post document 2', postUrl, 1500)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
await page.goto(origin, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('a[href^="/p/"]', { timeout: 15000 })
// Measure user-perceived click after the feed has become interactive enough
// for users to read/select a post, not the pre-hydration millisecond after DOMContentLoaded.
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
await page.waitForTimeout(500)
const firstPost = page.locator('a[href^="/p/"]').first()
await firstPost.dispatchEvent('touchstart')
await firstPost.dispatchEvent('pointerdown')
await page.waitForTimeout(300)
const clickStart = performance.now()
await firstPost.click()
await page.waitForURL(/\/p\//, { timeout: 10000 })
await page.locator('article h1').first().waitFor({ timeout: 10000 })
const clickMs = performance.now() - clickStart
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
const finalUrl = page.url()
await browser.close()

const clickLine = `mobile intent click to post title: ${Math.round(clickMs)}ms url=${finalUrl}`
;(clickMs <= 2000 && !overflow ? pass : fail).push(clickLine + ` overflow=${overflow}`)

console.log('PASS evidence:')
for (const line of pass) console.log(`- ${line}`)
if (fail.length) {
  console.error('FAIL evidence:')
  for (const line of fail) console.error(`- ${line}`)
  process.exit(1)
}
