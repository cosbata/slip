import { chromium } from 'playwright'

const origin = process.env.PERF_ORIGIN || 'https://slip.wtf'
const threshold = Number(process.env.PERF_ME_MAX || '1')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
})

let meGets = 0
const urls = []

page.on('request', (request) => {
  const url = request.url()
  if (request.method() === 'GET' && url.includes('/api/me')) {
    meGets += 1
    urls.push(url)
  }
})

try {
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('a[href^="/c/"]', { timeout: 15000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

  const communityLink = page.locator('a[href="/c/companies/google/swe"], a[href^="/c/"]').first()
  await communityLink.dispatchEvent('touchstart').catch(() => {})
  await communityLink.dispatchEvent('pointerdown').catch(() => {})
  await page.waitForTimeout(300)
  await communityLink.click({ timeout: 15000 })
  await page.waitForURL(/\/c\//, { timeout: 15000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

  const result = { origin, meGets, threshold, urls: urls.slice(0, 10) }
  console.log(JSON.stringify(result, null, 2))

  if (meGets > threshold) {
    throw new Error(`Expected <=${threshold} /api/me GETs, saw ${meGets}`)
  }
} finally {
  await browser.close()
}
