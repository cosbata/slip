'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CommunityAvatar } from '@/components/CommunityAvatar'

interface Community { id: string; slug: string; name: string }

interface Sibling { id: string; slug: string; name: string }

export function CommunitySwitcher({
  currentSlug,
  parentSlug,
  parentName,
  siblings = [],
}: {
  currentSlug: string
  parentSlug?: string
  parentName?: string
  siblings?: Sibling[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [all, setAll] = useState<Community[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    fetch('/api/communities')
      .then(r => r.json())
      .then((data: Community[]) =>
        // top-level only (no 3rd-level slash)
        setAll(data.filter(c => !c.slug.includes('/', c.slug.indexOf('/') + 1)))
      )
      .catch(() => {})

    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function handleSelect(slug: string) {
    setOpen(false)
    router.push(`/c/${slug}`)
  }

  const filtered = query.trim()
    ? all.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.slug.toLowerCase().includes(query.toLowerCase())
      )
    : all

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={wrapRef}>
      <button
        onClick={() => setOpen(o => !o)}
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
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
        </svg>
        Change community
      </button>

      {open && (
        <div style={{
          position: 'absolute', left: 0, top: '30px',
          backgroundColor: '#1A1A1B', border: '1px solid #343536',
          borderRadius: '8px', width: '280px', maxHeight: '380px',
          display: 'flex', flexDirection: 'column', zIndex: 300,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            padding: '10px 14px 8px', borderBottom: '1px solid #343536',
            fontSize: '11px', color: '#818384',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Navigate to community
          </div>

          {/* Parent shortcut */}
          {parentSlug && (
            <button
              onClick={() => handleSelect(parentSlug)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'none',
                border: 'none', borderBottom: '1px solid #343536',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#272729' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <CommunityAvatar slug={parentSlug} name={parentName ?? parentSlug} size={24} />
              <div>
                <div style={{ fontSize: '13px', color: '#D7DADC' }}>↩ {parentName}</div>
                <div style={{ fontSize: '11px', color: '#818384' }}>Go to parent community</div>
              </div>
            </button>
          )}

          {/* Sibling sub-communities */}
          {siblings.length > 0 && (
            <>
              <div style={{ padding: '6px 14px 4px', fontSize: '11px', color: '#818384', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Other sub-communities
              </div>
              {siblings.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '8px 14px',
                    background: s.slug === currentSlug ? '#272729' : 'none',
                    border: 'none', borderBottom: '1px solid #343536',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (s.slug !== currentSlug) e.currentTarget.style.backgroundColor = '#272729' }}
                  onMouseLeave={e => { if (s.slug !== currentSlug) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <CommunityAvatar slug={s.slug} name={s.name} size={22} />
                  <div style={{ fontSize: '13px', color: s.slug === currentSlug ? '#818384' : '#D7DADC' }}>
                    {s.name}
                    {s.slug === currentSlug && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#818384' }}>current</span>}
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #343536', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#818384' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search communities..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '6px 8px 6px 26px',
                backgroundColor: '#272729', border: '1px solid #343536',
                borderRadius: '20px', color: '#D7DADC', fontSize: '13px',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Community list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.slug)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 14px',
                  background: c.slug === currentSlug ? '#272729' : 'none',
                  border: 'none', borderBottom: '1px solid #343536',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (c.slug !== currentSlug) e.currentTarget.style.backgroundColor = '#272729' }}
                onMouseLeave={e => { if (c.slug !== currentSlug) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <CommunityAvatar slug={c.slug} name={c.name} size={24} />
                <div>
                  <div style={{ fontSize: '13px', color: '#D7DADC' }}>{c.slug.split('/').pop()}</div>
                  <div style={{ fontSize: '11px', color: '#818384' }}>{c.name}</div>
                </div>
                {c.slug === currentSlug && (
                  <svg style={{ marginLeft: 'auto', color: '#818384' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
