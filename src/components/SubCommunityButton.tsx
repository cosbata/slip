'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CommunityAvatar } from '@/components/CommunityAvatar'

interface Sub { id: string; slug: string; name: string }

export function SubCommunityButton({
  parentSlug,
  subCommunities,
}: {
  parentSlug: string
  subCommunities: Sub[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const filtered = query.trim()
    ? subCommunities.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.slug.toLowerCase().includes(query.toLowerCase())
      )
    : subCommunities

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 10px',
          border: '1px solid #818384',
          borderRadius: '12px',
          background: 'none',
          color: '#818384', fontSize: '12px',
          cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Sub-communities
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', left: 0, top: '30px',
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '8px',
          width: '260px', maxHeight: '340px',
          display: 'flex', flexDirection: 'column',
          zIndex: 300,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid #343536',
            fontSize: '11px', color: '#818384',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Sub-communities
          </div>

          <div style={{ padding: '8px 10px', borderBottom: '1px solid #343536', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#818384' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '6px 8px 6px 26px',
                backgroundColor: '#272729',
                border: '1px solid #343536', borderRadius: '20px',
                color: '#D7DADC', fontSize: '13px',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '14px', color: '#818384', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                No sub-communities found
              </p>
            ) : (
              filtered.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/c/${sub.slug}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 14px',
                    textDecoration: 'none',
                    borderBottom: '1px solid #343536',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#272729' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <CommunityAvatar slug={sub.slug} name={sub.name} size={24} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#D7DADC', fontWeight: 400 }}>
                      {sub.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#818384' }}>
                      {sub.slug.split('/').slice(-1)[0]}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div style={{ borderTop: '1px solid #343536', padding: '8px 14px' }}>
            <Link
              href={`/communities/create?parent=${parentSlug}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#818384', fontSize: '13px',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#D7DADC' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#818384' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Create new sub-community
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
