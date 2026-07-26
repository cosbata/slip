'use client'

import Link from 'next/link'
import { LogoutButton } from './LogoutButton'
import { useMe } from '@/components/MeProvider'

const loggedOutNav = (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <a
      href="/login"
      style={{
        padding: '6px 16px',
        border: '1px solid #D7DADC',
        borderRadius: '20px',
        color: '#D7DADC',
        fontWeight: 400,
        fontSize: '14px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Log In
    </a>
    <a
      href="/login"
      style={{
        padding: '6px 16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        color: '#0D0D0D',
        fontWeight: 400,
        fontSize: '14px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Sign Up
    </a>
  </div>
)

export function NavAuth() {
  const { profile, loaded } = useMe()

  if (!loaded || !profile) return loggedOutNav

  const initial = profile.username[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Link
        href={`/u/${profile.username}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: '#272729', border: '1px solid #343536',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#D7DADC', fontSize: '14px', fontWeight: 500, flexShrink: 0,
        }}>
          {initial}
        </div>
        <span style={{ fontSize: '14px', color: '#D7DADC', whiteSpace: 'nowrap' }}>
          {profile.username}
        </span>
      </Link>
      <LogoutButton />
    </div>
  )
}
