import { chromium } from 'playwright'

const origin = process.env.PERF_ORIGIN || 'https://slip.wtf'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
let reactionGets = 0
const reactionUrls = []
page.on('request', (req) => {
  const url = req.url()
  if (req.method() === 'GET' && url.includes('/api/reactions')) {
    reactionGets += 1
    reactionUrls.push(url)
  }
})
await page.goto(origin, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('article', { timeout: 15000 })
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
await page.goto(`${origin}/c/companies/google/swe`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.community-hero h1', { timeout: 15000 })
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
await browser.close()
console.log(JSON.stringify({ reactionGets, reactionUrls: reactionUrls.slice(0, 5) }, null, 2))
if (reactionGets !== 0) process.exit(1)
