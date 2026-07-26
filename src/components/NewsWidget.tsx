// Server Component — cheap cached DB read only. Background news ingestion should
// happen out-of-band; doing external fetches + DB upserts during page render made
// every navigation wait on Hacker News and Postgres.
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { db } from '../../drizzle'
import { newsItems } from '../../drizzle/schema'
import { desc } from 'drizzle-orm'

type Tag = 'layoff' | 'funding' | 'hiring'

function timeAgo(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getRecentNews = unstable_cache(
  async () => db.select().from(newsItems).orderBy(desc(newsItems.hnCreatedAt)).limit(5),
  ['recent-news-widget'],
  { revalidate: 900 }
)

const TAG_BADGE: Record<Tag, { label: string; color: string; bg: string }> = {
  layoff:  { label: 'Layoff',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  funding: { label: 'Funding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  hiring:  { label: 'Hiring',  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
}

const headerStyle: CSSProperties = {
  fontSize: '11px', color: '#818384', textTransform: 'uppercase',
  letterSpacing: '0.5px', fontWeight: 600,
  borderBottom: '1px solid #1e1f20', paddingBottom: '8px', marginBottom: '8px',
}
const itemStyle: CSSProperties = {
  display: 'block', padding: '8px 0', textDecoration: 'none', borderRadius: '4px',
}
const titleStyle: CSSProperties = {
  fontSize: '14px', color: '#D7DADC', lineHeight: 1.35, margin: '0 0 3px',
}
const metaStyle: CSSProperties = { fontSize: '11px', color: '#818384', margin: 0 }

export async function NewsWidget() {
  let items: Awaited<ReturnType<typeof getRecentNews>> = []
  try { items = await getRecentNews() } catch { return null }
  if (items.length === 0) return null

  return (
    <div>
      <div style={headerStyle}>IN THE NEWS</div>
      {items.map(item => {
        const tag = (item.tag in TAG_BADGE ? item.tag : 'layoff') as Tag
        return (
          <Link key={item.id} prefetch={false} href={`/news/${item.hnId}?tag=${tag}`} style={itemStyle}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{
                display: 'inline-block', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase',
                color: TAG_BADGE[tag].color, backgroundColor: TAG_BADGE[tag].bg,
              }}>
                {TAG_BADGE[tag].label}
              </span>
            </div>
            <p style={titleStyle}>{item.title.length > 80 ? item.title.slice(0, 80) + '…' : item.title}</p>
            <p style={metaStyle}>{item.domain ?? 'news.ycombinator.com'} · {timeAgo(item.hnCreatedAt)}</p>
          </Link>
        )
      })}
      <Link prefetch={false} href="/news" style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: '#818384', textDecoration: 'none' }}>
        View all news →
      </Link>
    </div>
  )
}
