'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  institution: string
  communityId: string
  initialJoined: boolean
}

export function CommunityActions({ slug, institution, communityId, initialJoined }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [joined, setJoined] = useState(initialJoined)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const btnBase: React.CSSProperties = {
    padding: '6px 16px',
    border: '1px solid #818384',
    borderRadius: '20px',
    color: '#D7DADC',
    fontWeight: 400,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }

  async function handleJoin() {
    // Optimistic update
    setJoined((prev) => !prev)
    try {
      const method = joined ? 'DELETE' : 'POST'
      const res = await fetch('/api/communities/join', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId }),
      })
      if (res.status === 401) {
        setJoined((prev) => !prev)
        router.push('/login')
        return
      }
      if (!res.ok) {
        // Revert on failure
        setJoined((prev) => !prev)
      }
    } catch {
      setJoined((prev) => !prev)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Link prefetch={false} href={`/submit?community=${slug}`} style={btnBase}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Create Post
      </Link>

      <button
        onClick={handleJoin}
        style={joined
          ? { ...btnBase, backgroundColor: '#1A1A1B', borderColor: '#818384', color: '#D7DADC' }
          : { ...btnBase, backgroundColor: '#FFFFFF', borderColor: '#FFFFFF', color: '#0D0D0D' }
        }
      >
        {joined ? 'Joined' : 'Join'}
      </button>

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="More options"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '34px', height: '34px',
            backgroundColor: 'transparent',
            border: '1px solid #818384',
            borderRadius: '50%',
            color: '#D7DADC', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: '42px',
            backgroundColor: '#1A1A1B',
            border: '1px solid #343536',
            borderRadius: '4px',
            minWidth: '210px', zIndex: 200,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}>
            {['Add to custom feed', 'Add to favorites', `Mute ${institution}`].map((item) => (
              <button
                key={item}
                style={{
                  display: 'block', width: '100%',
                  padding: '10px 16px',
                  background: 'none', border: 'none',
                  color: '#D7DADC', fontSize: '14px',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#272729' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
