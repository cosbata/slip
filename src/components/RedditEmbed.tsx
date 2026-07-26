'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  url: string
}

function parseRedditUrl(url: string) {
  try {
    const m = url.match(/reddit\.com\/r\/([^/]+)\/comments\/([^/]+)\/([^/?]*)/)
    if (!m) return null
    return { subreddit: m[1], id: m[2], slug: m[3] }
  } catch { return null }
}

export function RedditEmbed({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Start with fallback on localhost/dev, try embed on production
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [failed, setFailed] = useState(isLocalhost)
  const meta = parseRedditUrl(url)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = `
      <blockquote class="reddit-embed-bq" style="height:500px" data-embed-height="500">
        <a href="${url}">View on Reddit</a>
      </blockquote>
    `

    const script = document.createElement('script')
    script.src = 'https://embed.reddit.com/widgets.js'
    script.async = true
    script.charset = 'UTF-8'

    // Detect embed failure (localhost / non-HTTPS blocks)
    const timer = setTimeout(() => {
      const iframe = containerRef.current?.querySelector('iframe')
      if (!iframe) setFailed(true)
    }, 3500)

    script.onerror = () => { clearTimeout(timer); setFailed(true) }
    containerRef.current.appendChild(script)

    return () => { clearTimeout(timer) }
  }, [url])

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', marginBottom: '16px' }}
      >
        <div style={{
          border: '1px solid #343536', borderRadius: '8px',
          padding: '16px 20px', backgroundColor: '#1A1A1B',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
        }}>
          {/* Reddit logo */}
          <svg width="32" height="32" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="10" cy="10" r="10" fill="#FF4500"/>
            <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.08zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.71a3.58 3.58 0 01-2.85.79 3.58 3.58 0 01-2.85-.79.27.27 0 01.38-.38 3.08 3.08 0 002.47.61 3.08 3.08 0 002.47-.61.27.27 0 01.38.38zm-.19-1.71a1 1 0 111-1 1 1 0 01-1 1z" fill="white"/>
          </svg>
          <div>
            <div style={{ fontSize: '12px', color: '#818384', marginBottom: '4px' }}>
              r/{meta?.subreddit ?? 'reddit'} · Original post
            </div>
            <div style={{ fontSize: '14px', color: '#D7DADC', lineHeight: 1.4, marginBottom: '8px' }}>
              {meta?.slug?.replace(/_/g, ' ') ?? 'View on Reddit'}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: '#ff4500', fontWeight: 500,
            }}>
              View on Reddit →
            </div>
          </div>
        </div>
      </a>
    )
  }

  return (
    <div ref={containerRef} style={{ marginBottom: '16px', minHeight: '300px' }} />
  )
}
