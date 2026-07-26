// Companies with a local high-quality icon in /public/logos/ (webp)
const LOCAL_WEBP = new Set([
  // Companies
  'airbnb', 'airtable', 'anthropic', 'apple', 'brex', 'bytedance',
  'cloudflare', 'coinbase', 'databricks', 'deepmind', 'doordash', 'dropbox',
  'figma', 'google', 'instacart', 'lyft', 'meta', 'netflix', 'notion',
  'nvidia', 'palantir', 'robinhood', 'shopify', 'snowflake', 'spotify',
  'square', 'stripe', 'tiktok', 'twitter', 'uber', 'x', 'zoom',
  'amazon', 'linkedin', 'microsoft', 'openai', 'plaid', 'ramp',
  'rippling', 'salesforce', 'slack', 'toast', 'twilio',
  // Investors
  'a16z', 'accel', 'benchmark', 'general-catalyst', 'greylock',
  'index', 'kpcb', 'lightspeed', 'sequoia', 'yc',
])

// Maps community slug to a domain used for favicon lookup (fallback only)
const DOMAIN_MAP: Record<string, string> = {
  'companies/airbnb': 'airbnb.com',
  'companies/airtable': 'airtable.com',
  'companies/amazon': 'amazon.com',
  'companies/anthropic': 'anthropic.com',
  'companies/apple': 'apple.com',
  'companies/brex': 'brex.com',
  'companies/bytedance': 'bytedance.com',
  'companies/cloudflare': 'cloudflare.com',
  'companies/coinbase': 'coinbase.com',
  'companies/databricks': 'databricks.com',
  'companies/deepmind': 'deepmind.com',
  'companies/doordash': 'doordash.com',
  'companies/dropbox': 'dropbox.com',
  'companies/figma': 'figma.com',
  'companies/google': 'google.com',
  'companies/instacart': 'instacart.com',
  'companies/linkedin': 'linkedin.com',
  'companies/lyft': 'lyft.com',
  'companies/meta': 'meta.com',
  'companies/microsoft': 'microsoft.com',
  'companies/netflix': 'netflix.com',
  'companies/notion': 'notion.so',
  'companies/nvidia': 'nvidia.com',
  'companies/openai': 'openai.com',
  'companies/palantir': 'palantir.com',
  'companies/plaid': 'plaid.com',
  'companies/ramp': 'ramp.com',
  'companies/rippling': 'rippling.com',
  'companies/robinhood': 'robinhood.com',
  'companies/salesforce': 'salesforce.com',
  'companies/shopify': 'shopify.com',
  'companies/slack': 'slack.com',
  'companies/snowflake': 'snowflake.com',
  'companies/spotify': 'spotify.com',
  'companies/square': 'squareup.com',
  'companies/stripe': 'stripe.com',
  'companies/tiktok': 'tiktok.com',
  'companies/toast': 'toasttab.com',
  'companies/twilio': 'twilio.com',
  'companies/twitter': 'x.com',
  'companies/uber': 'uber.com',
  'companies/x': 'x.com',
  'companies/zoom': 'zoom.us',
  'investors/a16z': 'a16z.com',
  'investors/accel': 'accel.com',
  'investors/benchmark': 'benchmark.com',
  'investors/general-catalyst': 'generalcatalyst.com',
  'investors/greylock': 'greylock.com',
  'investors/index': 'indexventures.com',
  'investors/kpcb': 'kleinerperkins.com',
  'investors/lightspeed': 'lsvp.com',
  'investors/sequoia': 'sequoiacap.com',
  'investors/yc': 'ycombinator.com',
}

function getDomain(slug: string): string | null {
  const topSlug = slug.split('/').slice(0, 2).join('/')
  return DOMAIN_MAP[topSlug] ?? null
}

export function getLogoUrl(slug: string): string | null {
  // Use the institution segment (index 1) so sub-slugs like companies/amazon/swe also resolve to amazon
  const parts = slug.split('/')
  const company = parts.length >= 2 ? parts[1] : parts[0]
  if (LOCAL_WEBP.has(company)) return `/logos/${company}.webp`
  const domain = getDomain(slug)
  if (!domain) return null
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`
}

export function getFaviconUrl(slug: string): string | null {
  const domain = getDomain(slug)
  if (!domain) return null
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}
