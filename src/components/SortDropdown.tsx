'use client'
import { useState, useEffect, useRef } from 'react'

export type SortOption = 'best' | 'hot' | 'new' | 'top' | 'rising'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'best',   label: 'Best' },
  { value: 'hot',    label: 'Hot' },
  { value: 'new',    label: 'New' },
  { value: 'top',    label: 'Top' },
  { value: 'rising', label: 'Rising' },
]

interface Props {
  value: SortOption
  onChange: (v: SortOption) => void
}

export function SortDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = OPTIONS.find(o => o.value === value)!

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '6px 12px', borderRadius: '20px', border: 'none',
          backgroundColor: '#272729', color: '#D7DADC',
          fontWeight: 400, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {current.label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px',
          minWidth: '140px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 12px 4px', fontSize: '11px', color: '#818384', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sort by
          </div>
          {OPTIONS.map(opt => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 16px', background: active ? '#272729' : 'transparent',
                  border: 'none', color: active ? '#D7DADC' : '#818384',
                  fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#272729' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Sort posts client-side
export function sortPosts<T extends { voteScore: number; reactionCount?: number; createdAt: Date | string }>(
  posts: T[],
  sort: SortOption
): T[] {
  const now = Date.now()
  const h = 3600_000
  return [...posts].sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime()
    const bDate = new Date(b.createdAt).getTime()
    switch (sort) {
      case 'new':
        return bDate - aDate
      case 'top':
        return b.voteScore - a.voteScore || bDate - aDate
      case 'hot': {
        const aAge = Math.max(1, (now - aDate) / h)
        const bAge = Math.max(1, (now - bDate) / h)
        const aEngagement = (a.reactionCount ?? 0) * 3 + (a.voteScore ?? 0)
        const bEngagement = (b.reactionCount ?? 0) * 3 + (b.voteScore ?? 0)
        return (bEngagement * Math.pow(0.95, bAge)) - (aEngagement * Math.pow(0.95, aAge))
      }
      case 'rising': {
        // Only posts from last 6h, sorted by score
        const cutoff = now - 6 * h
        const aRecent = aDate > cutoff ? 1 : 0
        const bRecent = bDate > cutoff ? 1 : 0
        if (bRecent !== aRecent) return bRecent - aRecent
        return b.voteScore - a.voteScore || bDate - aDate
      }
      case 'best':
      default: {
        // Hot-ish: score with mild recency decay
        const aAge = Math.max(1, (now - aDate) / h)
        const bAge = Math.max(1, (now - bDate) / h)
        return (b.voteScore / Math.pow(bAge, 0.5)) - (a.voteScore / Math.pow(aAge, 0.5))
      }
    }
  })
}
