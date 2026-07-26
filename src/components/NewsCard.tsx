'use client'

import Link from 'next/link'
import { useState } from 'react'

type Tag = 'layoff' | 'funding' | 'hiring'

export interface NewsItemData {
  objectID: string
  title: string
  url?: string
  created_at_i: number
  points: number
  num_comments: number
  tag: Tag
  story_text?: string | null
}

const TAG_BADGE: Record<Tag, { label: string; color: string; bg: string }> = {
  layoff:  { label: 'Layoff',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  funding: { label: 'Funding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  hiring:  { label: 'Hiring',  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
}

const pillStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#272729', borderRadius: '20px',
  padding: '0 12px', border: 'none', color: '#818384',
  fontSize: '12px', fontWeight: 400, cursor: 'default',
  height: '32px', boxSizing: 'border-box',
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
function CommentIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function timeAgo(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function extractDomain(url: string | undefined): string {
  if (!url) return ''
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return '' }
}

export function NewsCard({ item }: { item: NewsItemData }) {
  const [hovered, setHovered] = useState(false)
  const badge = TAG_BADGE[item.tag]
  const ago = timeAgo(item.created_at_i)
  const domain = extractDomain(item.url)

  return (
    <Link prefetch={false} href={`/news/${item.objectID}?tag=${item.tag}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        style={{
          backgroundColor: hovered ? '#0f0f0f' : 'transparent',
          border: 'none', borderBottom: '1px solid #1e1f20',
          padding: '12px 16px 8px', cursor: 'pointer',
          transition: 'background-color 0.1s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%', backgroundColor: '#272729',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: '10px', color: '#818384', fontWeight: 700,
          }}>N</div>
          <span style={{ fontSize: '12px', color: '#D7DADC' }}>in-the-news</span>
          <span style={{ color: '#818384', fontSize: '12px' }}>•</span>
          <span style={{ color: '#818384', fontSize: '12px' }}>{ago}</span>
        </div>

        {/* Badge */}
        <div style={{ marginBottom: '4px' }}>
          <span style={{
            display: 'inline-block', fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '3px',
            textTransform: 'uppercase', color: badge.color, backgroundColor: badge.bg,
          }}>
            {badge.label}
          </span>
        </div>

        {/* Title + domain */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC', margin: 0, lineHeight: 1.3 }}>
            {item.title}
          </h3>
          {domain && (
            <span style={{ fontSize: '12px', color: '#818384', whiteSpace: 'nowrap' }}>
              ({domain})
            </span>
          )}
        </div>

        {/* Body preview — Ask HN story_text or nothing for link posts */}
        {item.story_text && (() => {
          const plain = item.story_text
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          if (!plain) return null
          return (
            <p style={{
              fontSize: '14px', color: '#9a9b9c', lineHeight: 1.6,
              margin: '0 0 10px', whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {plain}
            </p>
          )
        })()}

        {/* Action bar — PostCard style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          {/* Vote pill */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#272729', borderRadius: '20px', height: '32px' }}>
            <span style={{ padding: '6px 8px', color: '#818384', display: 'flex', alignItems: 'center' }}><UpArrow /></span>
            <span style={{ fontSize: '12px', fontWeight: 400, color: '#D7DADC', minWidth: '16px', textAlign: 'center' }}>{item.points}</span>
            <span style={{ padding: '6px 8px', color: '#818384', display: 'flex', alignItems: 'center' }}><DownArrow /></span>
          </div>

          {/* Comments pill */}
          <div style={pillStyle}>
            <CommentIcon />
            {item.num_comments}
          </div>
        </div>
      </article>
    </Link>
  )
}
