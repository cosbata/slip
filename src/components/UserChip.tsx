'use client'

import { useState, useRef } from 'react'

interface UserChipProps {
  username: string | null | undefined
  size?: number
  isAnonymous?: boolean
}

interface UserData {
  id: string
  username: string
  karma: number
  createdAt: string
}

export function UserChip({ username, size = 18, isAnonymous }: UserChipProps) {
  const name = username ?? 'deleted'
  const [imgOk, setImgOk] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const fetchedRef = useRef(false)

  if (isAnonymous) {
    return (
      <span style={{ color: '#818384', fontSize: 'inherit', display: 'inline-flex', alignItems: 'center' }}>
        anonymous
      </span>
    )
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

  function handleMouseEnter() {
    setHovered(true)
    if (!fetchedRef.current && username) {
      fetchedRef.current = true
      fetch(`/api/users/${encodeURIComponent(username)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.user) setUserData(data.user) })
        .catch(() => {})
    }
  }

  function handleMouseLeave() {
    setHovered(false)
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <a
        href={username ? `/u/${encodeURIComponent(username)}` : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '5px', verticalAlign: 'middle' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', flexShrink: 0, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#343536',
        }}>
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              width={size}
              height={size}
              style={{ display: 'block' }}
              onError={() => setImgOk(false)}
            />
          ) : (
            <span style={{ fontSize: size * 0.55, color: '#D7DADC', fontWeight: 600, lineHeight: 1 }}>
              {name[0].toUpperCase()}
            </span>
          )}
        </span>
        <span>{name}</span>
      </a>

      {hovered && userData && (
        <span
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            backgroundColor: '#1A1A1B',
            border: '1px solid #343536',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '200px',
            zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              width: 40, height: 40, borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#343536',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                alt=""
                width={40}
                height={40}
                style={{ display: 'block' }}
              />
            </span>
            <span style={{ fontWeight: 700, color: '#D7DADC', fontSize: '14px' }}>
              {userData.username}
            </span>
          </span>
          <span style={{ display: 'block', fontSize: '12px', color: '#818384', marginBottom: '4px' }}>
            Joined: {new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span style={{ display: 'block', fontSize: '12px', color: '#818384' }}>
            Karma: {userData.karma}
          </span>
        </span>
      )}
    </span>
  )
}
