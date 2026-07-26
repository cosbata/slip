'use client'
import { useState } from 'react'
import { getLogoUrl, getFaviconUrl } from '@/lib/logos'

interface Props {
  slug: string
  name: string
  size?: number
  institutionLogoUrl?: string | null
}

export function CommunityAvatar({ slug, name, size = 24, institutionLogoUrl }: Props) {
  const [stage, setStage] = useState(0)

  const urls = [
    institutionLogoUrl ?? getLogoUrl(slug),
    getFaviconUrl(slug),
  ].filter((u): u is string => !!u)

  const currentUrl = stage < urls.length ? urls[stage] : null

  if (currentUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setStage((s) => s + 1)}
        style={{
          width: size, height: size,
          minWidth: size,
          borderRadius: '50%',
          objectFit: 'contain',
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          padding: '2px',
          boxSizing: 'border-box',
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      backgroundColor: '#272729',
      border: '1px solid #343536',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#D7DADC',
      fontSize: Math.round(size * 0.45),
      fontWeight: 500,
      flexShrink: 0,
      minWidth: size,
    }}>
      {name[0]?.toUpperCase() ?? 'r'}
    </div>
  )
}
