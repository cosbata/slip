'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CommunityAvatar } from '@/components/CommunityAvatar'

export interface SearchCommunity {
  id: string
  slug: string
  name: string
  institutionLogoUrl: string | null
  track: 'COMPANIES' | 'INVESTORS'
  parentCommunityId?: string | null
}

interface Props {
  communities?: SearchCommunity[]
}

function resultLabel(community: SearchCommunity, allCommunities: SearchCommunity[]) {
  const parent = community.parentCommunityId
    ? allCommunities.find(c => c.id === community.parentCommunityId)
    : null
  return parent ? `${parent.name} / ${community.name}` : community.name
}

function rankCommunity(query: string, community: SearchCommunity, allCommunities: SearchCommunity[]) {
  const q = query.toLowerCase()
  const label = resultLabel(community, allCommunities).toLowerCase()
  const slug = community.slug.toLowerCase()
  if (slug === q || label === q) return 0
  if (slug.endsWith(`/${q}`) || label.split(' / ').some(part => part === q)) return 1
  if (slug.startsWith(q) || label.startsWith(q)) return 2
  if (slug.includes(q)) return 3
  if (label.includes(q)) return 4
  return 99
}

export function SearchBar({ communities: initialCommunities = [] }: Props) {
  const [communities, setCommunities] = useState<SearchCommunity[]>(initialCommunities)
  const [loaded, setLoaded] = useState(initialCommunities.length > 0)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  function loadCommunities() {
    if (loaded) return
    setLoaded(true)
    fetch('/api/communities', { cache: 'force-cache' })
      .then(async res => (res.ok ? res.json() : []))
      .then((rows: SearchCommunity[]) => {
        setCommunities(rows)
      })
      .catch(() => setCommunities([]))
  }

  const trimmedQuery = query.trim()
  const results = trimmedQuery
    ? communities
        .map(c => ({ community: c, rank: rankCommunity(trimmedQuery, c, communities) }))
        .filter(({ rank }) => rank < 99)
        .sort((a, b) => a.rank - b.rank || a.community.slug.length - b.community.slug.length)
        .slice(0, 8)
        .map(({ community }) => community)
    : []


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function navigateToSearch(value = trimmedQuery) {
    const q = value.trim()
    if (!q) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  function handleSelect(slug: string) {
    setQuery('')
    setOpen(false)
    router.push(`/c/${slug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      loadCommunities()
      setOpen(true)
      setActiveIndex(index => Math.min(index + 1, Math.max(results.length - 1, 0)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(index => Math.max(index - 1, 0))
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0) {
        handleSelect(results[Math.min(activeIndex, results.length - 1)].slug)
      } else {
        navigateToSearch()
      }
    }
  }

  return (
    <div ref={containerRef} className="site-search" style={{ flex: 1, maxWidth: '690px', position: 'relative' }}>
      <svg
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#818384',
          pointerEvents: 'none',
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        role="combobox"
        aria-expanded={open && trimmedQuery.length > 0}
        aria-controls="slip-search-results"
        aria-autocomplete="list"
        aria-activedescendant={open && results[activeIndex] ? `slip-search-result-${results[activeIndex].id}` : undefined}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setActiveIndex(0)
          setOpen(true)
          loadCommunities()
        }}
        onFocus={() => { loadCommunities(); if (trimmedQuery) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Search slip"
        style={{
          width: '100%',
          padding: '9px 16px 9px 36px',
          backgroundColor: '#272729',
          border: '1px solid #343536',
          borderRadius: '20px',
          fontSize: '14px',
          outline: 'none',
          color: '#D7DADC',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      {open && trimmedQuery && (
        <div id="slip-search-results" role="listbox" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#1A1A1B',
          border: '1px solid #343536',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          maxHeight: '340px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {results.length === 0 ? (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => navigateToSearch()}
              style={{
                width: '100%', padding: '12px 16px', fontSize: '13px', color: '#D7DADC',
                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Search for “{trimmedQuery}”
            </button>
          ) : (
            <>
              {results.map((c, index) => {
                const active = index === activeIndex
                return (
                  <button
                    id={`slip-search-result-${c.id}`}
                    role="option"
                    aria-selected={active}
                    key={c.id}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(c.slug)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      background: active ? '#272729' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <CommunityAvatar slug={c.slug} name={c.name} size={20} institutionLogoUrl={c.institutionLogoUrl} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                      <span style={{ fontSize: '13px', color: '#D7DADC', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resultLabel(c, communities)}</span>
                      <span style={{ fontSize: '11px', color: '#818384', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.slug}</span>
                    </div>
                  </button>
                )
              })}
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => navigateToSearch()}
                style={{
                  width: '100%', padding: '10px 16px', fontSize: '12px', color: '#818384',
                  background: 'none', border: 'none', borderTop: '1px solid #2d2d2e', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                See all results for “{trimmedQuery}” →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
