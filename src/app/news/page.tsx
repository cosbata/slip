// Server Component — revalidates every 15 minutes, reads all accumulated items from DB
import { NewsCard, type NewsItemData } from '@/components/NewsCard'
import { db } from '../../../drizzle'
import { newsItems } from '../../../drizzle/schema'
import { desc } from 'drizzle-orm'

export const revalidate = 900

interface HNHit {
  objectID: string
  title: string
  url?: string
  created_at_i: number
  points: number
  num_comments: number
}

interface HNResponse {
  hits: HNHit[]
}

type Tag = 'layoff' | 'funding' | 'hiring'

function detectTag(title: string): Tag {
  const t = title.toLowerCase()
  if (/layoff|laid.?off|job.?cut|fired|retrench|redund|downsize|warn.?act|headcount/.test(t)) return 'layoff'
  if (/fund|raise|raised|series [abcde]|valuation|invest|vc |venture|round|capital/.test(t)) return 'funding'
  if (/hir|recruit|job opening|position|talent|engineer wanted|we.re hiring/.test(t)) return 'hiring'
  return 'layoff'
}

function extractDomain(url: string | undefined): string {
  if (!url) return 'news.ycombinator.com'
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'news.ycombinator.com' }
}

async function syncFromHN() {
  const cutoff = Math.floor(Date.now() / 1000) - 259200

  const fetched: Array<{ hnId: string; title: string; url: string | null; domain: string; tag: string; points: number; numComments: number; hnCreatedAt: Date }> = []

  for (const query of ['layoff', 'funding', 'AI hiring']) {
    try {
      const res = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15&numericFilters=${encodeURIComponent(`created_at_i>${cutoff}`)}`,
        { next: { revalidate: 900 } }
      )
      if (!res.ok) continue
      const data: HNResponse = await res.json()
      for (const hit of data.hits) {
        fetched.push({
          hnId: hit.objectID,
          title: hit.title,
          url: hit.url ?? null,
          domain: extractDomain(hit.url),
          tag: detectTag(hit.title),
          points: hit.points ?? 0,
          numComments: hit.num_comments ?? 0,
          hnCreatedAt: new Date(hit.created_at_i * 1000),
        })
      }
    } catch { /* skip */ }
  }

  if (fetched.length > 0) {
    await db.insert(newsItems).values(fetched).onConflictDoNothing()
  }
}

export default async function NewsPage() {
  // Sync new items, then read all from DB
  try { await syncFromHN() } catch { /* non-fatal */ }

  const allItems = await db.select().from(newsItems).orderBy(desc(newsItems.hnCreatedAt))

  const items: NewsItemData[] = allItems.map(item => ({
    objectID: item.hnId,
    title: item.title,
    url: item.url ?? undefined,
    created_at_i: Math.floor(item.hnCreatedAt.getTime() / 1000),
    points: item.points ?? 0,
    num_comments: item.numComments ?? 0,
    tag: item.tag as Tag,
  }))

  return (
    <div style={{ maxWidth: '1072px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '24px' }}>
      <main style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
        <p style={{ fontSize: '13px', color: '#818384', marginBottom: '12px', marginTop: 0 }}>
          <span style={{ color: '#FF4500', fontWeight: 700 }}>{items.length}</span> news stories archived · updated every 15 min
        </p>

        {items.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#818384' }}>No news yet — check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {items.map(item => (
              <NewsCard key={item.objectID} item={item} />
            ))}
          </div>
        )}
      </main>

      <aside style={{ width: '240px', minWidth: '240px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '68px' }}>
          <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#272729', padding: '10px 14px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#D7DADC', margin: 0 }}>Tech News</p>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: '#818384', margin: '0 0 4px', lineHeight: 1.5 }}>
                Layoffs, funding, and hiring news from Hacker News.
              </p>
              <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>Updated every 15 minutes · all-time archive</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
