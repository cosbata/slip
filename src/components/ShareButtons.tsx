'use client'

interface Props {
  postId: string
  title: string
}

export function ShareButtons({ postId, title }: Props) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${postId}`
    : `https://slip.wtf/p/${postId}`

  function shareX() {
    const text = `${title} — via @slip_wtf`
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank', 'noopener,noreferrer'
    )
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank', 'noopener,noreferrer'
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <button
        onClick={shareX}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px',
          border: '1px solid #343536', backgroundColor: '#272729',
          color: '#D7DADC', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 400,
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#343536' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#272729' }}
      >
        <XIcon />
        Share on X
      </button>
      <button
        onClick={shareLinkedIn}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px',
          border: '1px solid #343536', backgroundColor: '#272729',
          color: '#D7DADC', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 400,
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#343536' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#272729' }}
      >
        <LinkedInIcon />
        Share on LinkedIn
      </button>
    </div>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
