'use client'

interface Props {
  url: string
  embedType: string
}

const PLATFORM_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  reddit:       { label: 'Reddit',           color: '#FF4500', bg: 'rgba(255,69,0,0.1)',     icon: <RedditIcon /> },
  blind:        { label: 'Blind',            color: '#00a8ff', bg: 'rgba(0,168,255,0.1)',    icon: <BlindIcon /> },
  medium:       { label: 'Medium',           color: '#a8a8a8', bg: 'rgba(168,168,168,0.1)',  icon: <MediumIcon /> },
  leetcode:     { label: 'LeetCode Discuss', color: '#ffa116', bg: 'rgba(255,161,22,0.1)',   icon: <LeetCodeIcon /> },
  jointaro:     { label: 'Jointaro',         color: '#6c47ff', bg: 'rgba(108,71,255,0.1)',   icon: <LinkIcon /> },
  hackernews:   { label: 'Hacker News',      color: '#ff6600', bg: 'rgba(255,102,0,0.1)',    icon: <HNIcon /> },
  linkedin:     { label: 'LinkedIn',         color: '#0a66c2', bg: 'rgba(10,102,194,0.1)',   icon: <LinkIcon /> },
  interviewexp: { label: 'Interview Exp',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    icon: <LinkIcon /> },
  zhihu:        { label: '知乎',             color: '#0084ff', bg: 'rgba(0,132,255,0.1)',    icon: <LinkIcon /> },
  nowcoder:     { label: '牛客网',           color: '#00b38a', bg: 'rgba(0,179,138,0.1)',    icon: <LinkIcon /> },
  note:         { label: 'note.com',         color: '#41c9b4', bg: 'rgba(65,201,180,0.1)',   icon: <LinkIcon /> },
  devto:        { label: 'Dev.to',           color: '#a855f7', bg: 'rgba(168,85,247,0.1)',   icon: <LinkIcon /> },
  link:         { label: 'Original Post',    color: '#818384', bg: 'rgba(129,131,132,0.1)',  icon: <LinkIcon /> },
}

function parseSlug(url: string) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1]?.replace(/[-_]/g, ' ').slice(0, 80) ?? u.hostname
  } catch { return url.slice(0, 80) }
}

function parseDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

export function EmbedCard({ url, embedType }: Props) {
  const meta = PLATFORM_META[embedType] ?? PLATFORM_META.link
  const slug = parseSlug(url)
  const domain = parseDomain(url)

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', marginBottom: '16px' }}>
      <div style={{
        border: '1px solid #2d2d2e', borderRadius: '8px',
        padding: '14px 18px', backgroundColor: '#111112',
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2d2d2e')}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '8px', flexShrink: 0, marginTop: 2,
          backgroundColor: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#818384', marginBottom: '4px' }}>
            <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
            {domain && <span> · {domain}</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#D7DADC', lineHeight: 1.4, marginBottom: '8px', textTransform: 'capitalize' }}>
            {slug}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: meta.color, fontWeight: 500 }}>
            Open embedded source →
          </div>
          <div style={{
            marginTop: '6px',
            fontSize: '11px',
            color: '#646668',
            lineHeight: 1.35,
            overflowWrap: 'anywhere',
          }}>
            {url}
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────

function RedditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="10" fill="#FF4500"/>
      <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.08zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.71a3.58 3.58 0 01-2.85.79 3.58 3.58 0 01-2.85-.79.27.27 0 01.38-.38 3.08 3.08 0 002.47.61 3.08 3.08 0 002.47-.61.27.27 0 01.38.38zm-.19-1.71a1 1 0 111-1 1 1 0 01-1 1z" fill="white"/>
    </svg>
  )
}

function BlindIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#00a8ff"/>
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">B</text>
    </svg>
  )
}

function MediumIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#1a1a1a"/>
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">M</text>
    </svg>
  )
}

function LeetCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#1a1a1a"/>
      <text x="12" y="17" textAnchor="middle" fill="#ffa116" fontSize="11" fontWeight="bold">LC</text>
    </svg>
  )
}

function HNIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#ff6600"/>
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Y</text>
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818384" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}
