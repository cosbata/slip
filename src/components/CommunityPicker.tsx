'use client'
import { useState, useEffect, useRef } from 'react'
import { CommunityAvatar } from '@/components/CommunityAvatar'

export interface Community {
  id: string
  slug: string
  name: string
  institutionLogoUrl: string | null
  track: string
}

interface Props {
  communities: Community[]
  defaultSlug?: string
  name: string // form field name
  onChange?: (slug: string) => void
  fullWidth?: boolean
}

export function CommunityPicker({ communities, defaultSlug = '', name, onChange, fullWidth }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(defaultSlug)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleMouseDown)
    }
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const selectedCommunity = communities.find(c => c.slug === selected) ?? null

  // Default suggestions: top 8 by post count proxy (just first 8 if no query)
  const filtered = query.trim()
    ? communities.filter(
        c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.slug.toLowerCase().includes(query.toLowerCase())
      )
    : communities.slice(0, 8)

  function handleSelect(slug: string) {
    setSelected(slug)
    setOpen(false)
    setQuery('')
    onChange?.(slug)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block' }}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selected} />

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: fullWidth ? '12px 16px' : '6px 12px 6px 8px',
          backgroundColor: 'transparent',
          border: fullWidth ? '1px solid #343536' : '1px solid #D7DADC',
          borderRadius: fullWidth ? '8px' : '20px',
          color: '#D7DADC',
          fontSize: '14px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          width: fullWidth ? '100%' : undefined,
          minWidth: fullWidth ? undefined : '160px',
          boxSizing: 'border-box',
        }}
      >
        {selectedCommunity ? (
          <>
            <CommunityAvatar
              slug={selectedCommunity.slug}
              name={selectedCommunity.name}
              size={20}
              institutionLogoUrl={selectedCommunity.institutionLogoUrl}
            />
            <span style={{ fontWeight: 500 }}>
              {selectedCommunity.name}
            </span>
          </>
        ) : (
          <span style={{ color: '#818384' }}>Select a community</span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 200,
            backgroundColor: '#1A1A1B',
            border: '1px solid #343536',
            borderRadius: '8px',
            width: fullWidth ? '100%' : '320px',
            maxHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Search input */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #343536', position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#818384' }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search communities..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px 8px 32px',
                backgroundColor: '#272729',
                border: '1px solid #343536',
                borderRadius: '4px',
                color: '#D7DADC',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Community list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {!query.trim() && (
              <div style={{ padding: '6px 12px 2px', fontSize: '11px', color: '#818384', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top communities
              </div>
            )}
            {filtered.length === 0 && (
              <p style={{ padding: '16px 12px', color: '#818384', fontSize: '13px', margin: 0 }}>
                No communities found
              </p>
            )}
            {filtered.map(c => {
              const isSelected = c.slug === selected
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.slug)}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#272729'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    background: isSelected ? '#272729' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <CommunityAvatar
                    slug={c.slug}
                    name={c.name}
                    size={32}
                    institutionLogoUrl={c.institutionLogoUrl}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: '#D7DADC', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#818384', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.slug}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      style={{ marginLeft: 'auto', color: '#D7DADC', flexShrink: 0 }}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
