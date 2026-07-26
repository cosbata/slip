export const revalidate = 3600

import Link from 'next/link'
import { EmbedCard } from '@/components/EmbedCard'

interface HNItem {
  objectID: string
  title: string
  url?: string | null
  author: string
  created_at_i: number
  points: number
  num_comments: number
  story_text?: string | null
}

const TAG_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  layoff:  { label: 'Layoff',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  funding: { label: 'Funding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  hiring:  { label: 'Hiring',  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
}

function timeAgo(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function UpArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1 1 0 00.71-1.71l-8-8a1 1 0 00-1.42 0l-8 8A1 1 0 004 14z" />
    </svg>
  )
}
function DownArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 10h-4V3a1 1 0 00-1-1H9a1 1 0 00-1 1v7H4a1 1 0 00-.71 1.71l8 8a1 1 0 001.42 0l8-8A1 1 0 0020 10z" />
    </svg>
  )
}

function NewsIcon() {
  return (
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      backgroundColor: '#272729', border: '4px solid #1A1A1B',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#818384" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-8H7v8M7 4v4h8"/>
      </svg>
    </div>
  )
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tag?: string }>
}) {
  const { id } = await params
  const { tag } = await searchParams

  const res = await fetch(
    `https://hn.algolia.com/api/v1/items/${id}`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) {
    return (
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '40px 24px', color: '#818384' }}>
        News item not found.
      </div>
    )
  }

  const item: HNItem = await res.json()
  const badge = tag ? (TAG_BADGE[tag] ?? null) : null
  const ago = timeAgo(item.created_at_i)
  const domain = item.url ? new URL(item.url).hostname.replace(/^www\./, '') : 'news.ycombinator.com'

  // Pre-filled submit URL for "Post to slip"
  const submitUrl = `/submit?title=${encodeURIComponent(item.title)}${item.url ? `&link=${encodeURIComponent(item.url)}` : ''}`

  return (
    <div>
      {/* Banner */}
      <div style={{ backgroundColor: '#1A1A1B', height: '80px', width: '100%' }} />

      {/* Community-style header */}
      <div style={{ backgroundColor: '#1A1A1B', borderBottom: '1px solid #343536' }}>
        <div style={{ maxWidth: '1072px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '12px', marginTop: '-20px' }}>
            <NewsIcon />
            <div style={{ paddingBottom: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1 }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#D7DADC', margin: 0, lineHeight: 1.2 }}>
                  Tech News
                </h1>
                <p style={{ fontSize: '14px', color: '#818384', margin: '2px 0 0' }}>in-the-news</p>
              </div>
              <Link href="/news" style={{
                padding: '6px 16px', borderRadius: '20px',
                border: '1px solid #343536', color: '#818384',
                fontSize: '14px', textDecoration: 'none',
              }}>
                ← Back to News
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2-column body */}
      <div style={{ maxWidth: '1072px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '24px' }}>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
          <article style={{
            backgroundColor: 'transparent', border: 'none',
            borderBottom: '1px solid #1e1f20', padding: '20px 0',
          }}>
            {/* Category badge */}
            {badge && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  display: 'inline-block', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '3px',
                  textTransform: 'uppercase', color: badge.color, backgroundColor: badge.bg,
                }}>
                  {badge.label}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#D7DADC', margin: '0 0 10px', lineHeight: 1.35 }}>
              {item.title}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#818384', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#D7DADC', fontWeight: 500 }}>{item.author}</span>
              <span>·</span>
              <span>{ago}</span>
              <span>·</span>
              <span>{domain}</span>
              <span>·</span>
              <span>{item.points} points</span>
            </div>

            {/* External article embed */}
            {item.url && (
              <EmbedCard url={item.url} embedType="link" />
            )}

            {/* Ask HN / Show HN body text */}
            {item.story_text && (
              <div
                style={{ fontSize: '15px', lineHeight: 1.65, color: '#D7DADC', margin: item.url ? '16px 0 0' : '0' }}
                dangerouslySetInnerHTML={{ __html: item.story_text }}
              />
            )}

            {/* If no url and no story_text, show HN link as embed */}
            {!item.url && !item.story_text && (
              <EmbedCard
                url={`https://news.ycombinator.com/item?id=${item.objectID}`}
                embedType="hackernews"
              />
            )}
          </article>

          {/* Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0 20px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: '#272729', borderRadius: '20px', height: '32px', padding: '0 4px',
            }}>
              <span style={{ padding: '6px 10px', color: '#818384', display: 'flex', alignItems: 'center' }}><UpArrow /></span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: '#D7DADC', minWidth: '16px', textAlign: 'center' }}>
                {item.points}
              </span>
              <span style={{ padding: '6px 10px', color: '#818384', display: 'flex', alignItems: 'center' }}><DownArrow /></span>
            </div>
            <span style={{ fontSize: '12px', color: '#818384', padding: '0 4px' }}>
              {item.num_comments} comments on HN
            </span>
          </div>

          {/* Post to slip CTA */}
          <div style={{
            backgroundColor: '#1A1A1B', border: '1px solid #343536',
            borderRadius: '8px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#D7DADC', margin: '0 0 3px', fontWeight: 500 }}>
                Start a discussion on slip
              </p>
              <p style={{ fontSize: '12px', color: '#818384', margin: 0 }}>
                Share your thoughts and let others comment
              </p>
            </div>
            <Link href={submitUrl} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', backgroundColor: 'transparent', border: '1px solid #818384', borderRadius: '20px',
              color: '#818384', fontSize: '13px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Post to slip
            </Link>
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{ width: '240px', minWidth: '240px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '68px' }}>
            <div style={{
              backgroundColor: '#1A1A1B', border: '1px solid #343536',
              borderRadius: '8px', overflow: 'hidden',
            }}>
              <div style={{ backgroundColor: '#272729', padding: '10px 14px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#D7DADC', margin: 0 }}>
                  Tech News
                </p>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '13px', color: '#818384', margin: 0, lineHeight: 1.5 }}>
                  Layoffs, funding, and hiring news from Hacker News.
                </p>
                <Link href="/news" style={{
                  display: 'block', padding: '8px',
                  backgroundColor: 'transparent', border: '1px solid #D7DADC', borderRadius: '20px',
                  color: '#D7DADC', fontSize: '13px', fontWeight: 500,
                  textDecoration: 'none', textAlign: 'center',
                }}>
                  View all news
                </Link>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" style={{
                    display: 'block', padding: '8px',
                    border: '1px solid #343536', borderRadius: '20px',
                    color: '#818384', fontSize: '13px',
                    textDecoration: 'none', textAlign: 'center',
                  }}>
                    Read original article ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
