'use client'

import { IntentPrefetchLink } from '@/components/IntentPrefetchLink'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { UserChip } from '@/components/UserChip'
import { ReactionBar } from '@/components/ReactionBar'

interface PostCardProps {
  id: string
  title: string
  body?: string
  voteScore: number
  communitySlug: string
  communityName?: string | null
  authorUsername?: string
  createdAt: Date | string
  commentCount?: number
  interviewStage?: string | null
  fundingStage?: string | null
  outcomeCategory?: string | null
  embedUrl?: string | null
  embedType?: string | null
  reactionCount?: number
  reactionCounts?: { BEEN_THERE: number; I_FEEL_THIS: number; NOT_ALONE: number; SAME_HERE: number }
  isAnonymous?: boolean
  isOwnAnonymousPost?: boolean
  communityTrack?: string | null
  tags?: string[]
  isOwnPost?: boolean
}

const STAGE_LABELS: Record<string, string> = {
  SCREEN: 'Resume Screen',
  PHONE: 'Phone Interview',
  ONSITE: 'Onsite',
  FINAL: 'Final Round',
  OFFER_RESCINDED: 'Offer Rescinded',
}
const OUTCOME_LABELS: Record<string, string> = {
  HIRED_ELSEWHERE: '✓ Hired elsewhere',
  RAISED_FUNDING: '✓ Raised funding',
  STARTED_COMPANY: '✓ Started company',
  JOINED_PROGRAM: '✓ Joined program',
  STILL_SEARCHING: '⟳ Still searching',
  PIVOTED_CAREERS: '→ Pivoted',
  OTHER: 'Other',
}

function timeAgo(date: Date | string) {
  const d = new Date(date)
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return `just now`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return '' }
}

function UpArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1 1 0 00.71-1.71l-8-8a1 1 0 00-1.42 0l-8 8A1 1 0 004 14z" />
    </svg>
  )
}
function DownArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 10h-4V3a1 1 0 00-1-1H9a1 1 0 00-1 1v7H4a1 1 0 00-.71 1.71l8 8a1 1 0 001.42 0l8-8A1 1 0 0020 10z" />
    </svg>
  )
}

const pillStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#272729',
  borderRadius: '20px',
  padding: '4px 12px',
  border: 'none',
  color: '#818384',
  fontSize: '12px',
  fontWeight: 400,
  cursor: 'pointer',
  textDecoration: 'none',
  height: '32px',
  boxSizing: 'border-box',
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#818384',
  padding: '2px',
  borderRadius: '50%',
}

function PostOptions({ id, isOwnPost }: { id: string; isOwnPost?: boolean }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  if (!isOwnPost) return null

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) { router.refresh() }
    else { alert('Failed to delete'); setDeleting(false) }
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        style={iconBtnStyle}
        aria-label="More options"
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v) }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 200,
          backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px',
          minWidth: '140px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', overflow: 'hidden',
        }}>
          <button
            onClick={e => { e.stopPropagation(); router.push(`/submit/edit/${id}`); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#D7DADC', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#272729'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Edit
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete() }}
            disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderTop: '1px solid #343536', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#272729'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

function ShareButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function share(platform: 'x' | 'linkedin') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://slip.wtf'
    const postUrl = `${origin}/p/${id}`
    let url: string
    if (platform === 'x') {
      url = `https://x.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(title)}`
    } else {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        style={pillStyle}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#343536')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = open ? '#343536' : '#272729')}
        aria-label="Share"
        aria-expanded={open}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            backgroundColor: '#1A1A1B',
            border: '1px solid #343536',
            borderRadius: '8px',
            minWidth: '140px',
            zIndex: 100,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); share('x') }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              color: '#D7DADC',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#272729')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* X (Twitter) icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); share('linkedin') }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              borderTop: '1px solid #343536',
              color: '#D7DADC',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#272729')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* LinkedIn icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  )
}

export function PostCard({
  id,
  title,
  body,
  voteScore,
  communitySlug,
  communityName,
  authorUsername,
  createdAt,
  commentCount = 0,
  interviewStage,
  fundingStage,
  outcomeCategory,
  embedUrl,
  embedType,
  reactionCount,
  reactionCounts,
  isAnonymous,
  isOwnAnonymousPost,
  communityTrack,
  tags,
  isOwnPost,
}: PostCardProps) {
  const [score, setScore] = useState(voteScore)
  const [userVote, setUserVote] = useState(0)  // -1, 0, or 1

  async function handleVote(value: 1 | -1) {
    const newValue = userVote === value ? 0 : value  // toggle off if same
    const delta = newValue - userVote
    setScore(prev => prev + delta)
    setUserVote(newValue)
    try {
      const res = await fetch('/api/posts/vote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, value: newValue === 0 ? userVote : newValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setScore(data.voteScore)
      } else {
        // revert
        setScore(prev => prev - delta)
        setUserVote(userVote)
      }
    } catch {
      setScore(prev => prev - delta)
      setUserVote(userVote)
    }
  }

  const stage = interviewStage ? STAGE_LABELS[interviewStage] : fundingStage ?? null

  // 태그나 커뮤니티 트랙에서 카테고리 결정
  const newsCategory = (() => {
    const t = (tags ?? []).map(x => x.toLowerCase())
    if (t.some(x => x.includes('layoff') || x === 'fired' || x === 'laid-off'))
      return { label: 'Layoff', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    if (t.some(x => x.includes('funding') || x.includes('invest') || x.includes('raise')))
      return { label: 'Funding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' }
    if (t.some(x => x.includes('hiring') || x.includes('job')))
      return { label: 'Hiring', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' }
    if (communityTrack === 'INVESTORS')
      return { label: 'Funding', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' }
    return null
  })()

  const linkDomain = embedType === 'link' && embedUrl ? extractDomain(embedUrl) : null

  // Strip **Key**: lines and disclaimer, then truncate to preview
  // Detect if body is HTML (new editor) or plain text/markdown (legacy seed posts)
  const bodyIsHtml = body ? /<[a-z][\s\S]*>/i.test(body) : false

  const bodyPreview = body ? (() => {
    if (bodyIsHtml) {
      return body
        .replace(/Based on a real account[^\n<]*/g, '')
        .trim() || null
    }
    // Plain text / markdown: strip structured metadata lines like **Company**: ...
    const cleaned = body
      .split('\n')
      .filter(l => !/^\*\*[^*]+\*\*\s*:/.test(l.trim()))
      .filter(l => !/Based on a real account/.test(l))
      .filter(l => !/^---\s*$/.test(l.trim()))
      .join('\n')
      .replace(/\*\*([^*]+)\*\*/g, '$1')   // strip remaining **bold**
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^[\s\n-]+/, '')
      .trim()
    return cleaned || null
  })() : null

  return (
    <article
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid #1e1f20',
        borderRadius: '0',
        marginBottom: '0',
        padding: '12px 16px 8px',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f0f0f')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <CommunityAvatar slug={communitySlug} name={communityName ?? communitySlug} size={20} />
        <IntentPrefetchLink
          href={`/c/${communitySlug}`}
          style={{
            fontWeight: 400,
            fontSize: '12px',
            color: '#D7DADC',
            textDecoration: 'none',
          }}
        >
          {communitySlug}
        </IntentPrefetchLink>
        <span style={{ color: '#818384', fontSize: '12px' }}>•</span>
        <span style={{ color: '#818384', fontSize: '12px' }}>{timeAgo(createdAt)}</span>
        {(authorUsername || isAnonymous) && (
          <>
            <span style={{ color: '#818384', fontSize: '12px' }}>•</span>
            <span style={{ fontSize: '12px', color: '#9a9b9c' }}>
              {isAnonymous ? (
                <span
                  title={isOwnAnonymousPost ? 'Your anonymous post' : undefined}
                  style={{ color: '#818384', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  anonymous{isOwnAnonymousPost ? ' 🔒' : ''}
                </span>
              ) : (
                <UserChip username={authorUsername} size={16} />
              )}
            </span>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PostOptions id={id} isOwnPost={isOwnPost} />
        </div>
      </div>

      {/* Category badge (link posts only) */}
      {newsCategory && embedType === 'link' && (
        <div style={{ marginBottom: '4px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
            padding: '2px 6px', borderRadius: '3px',
            textTransform: 'uppercase',
            color: newsCategory.color,
            backgroundColor: newsCategory.bg,
          }}>
            {newsCategory.label}
          </span>
        </div>
      )}

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <IntentPrefetchLink href={`/p/${id}`} style={{ textDecoration: 'none', flex: '1 1 auto', minWidth: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC', margin: 0, lineHeight: 1.3 }}>
            {title}
          </h3>
        </IntentPrefetchLink>
        {linkDomain && (
          <a
            href={embedUrl!}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: '12px', color: '#818384', fontWeight: 400, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D7DADC'; e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#818384'; e.currentTarget.style.textDecoration = 'none' }}
          >
            ({linkDomain}) ↗
          </a>
        )}
      </div>

      {/* Reddit embed badge */}
      {embedType === 'reddit' && embedUrl && (
        <IntentPrefetchLink href={`/p/${id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: '#ff4500', backgroundColor: 'rgba(255,69,0,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
            📌 Reddit
          </span>
        </IntentPrefetchLink>
      )}

      {/* Body preview */}
      {bodyPreview && (
        <IntentPrefetchLink href={`/p/${id}`} style={{ textDecoration: 'none' }}>
          {bodyIsHtml ? (
            <div
              style={{
                fontSize: '14px', color: '#9a9b9c', lineHeight: 1.6,
                margin: '0 0 10px 0', overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
              }}
              dangerouslySetInnerHTML={{ __html: bodyPreview }}
            />
          ) : (
            <p style={{
              fontSize: '14px', color: '#9a9b9c', lineHeight: 1.6,
              margin: '0 0 10px 0', whiteSpace: 'pre-wrap',
              display: '-webkit-box', WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {bodyPreview}
            </p>
          )}
        </IntentPrefetchLink>
      )}

      {/* Flairs/badges */}
      {(stage || outcomeCategory) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '12px',
          }}
        >
          {stage && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 400,
                padding: '2px 8px',
                backgroundColor: '#272729',
                color: '#818384',
                border: 'none',
                borderRadius: '12px',
              }}
            >
              {stage}
            </span>
          )}
          {outcomeCategory && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 400,
                padding: '2px 8px',
                backgroundColor: '#272729',
                color: '#818384',
                border: 'none',
                borderRadius: '12px',
              }}
            >
              {OUTCOME_LABELS[outcomeCategory] ?? outcomeCategory}
            </span>
          )}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        {/* Vote pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#272729',
            borderRadius: '20px',
            height: '32px',
          }}
        >
          <button
            style={{ ...iconBtnStyle, padding: '6px 8px', color: userVote === 1 ? '#D7DADC' : '#818384' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#D7DADC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = userVote === 1 ? '#D7DADC' : '#818384')}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1) }}
            aria-label="upvote"
          >
            <UpArrow />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 400, color: '#D7DADC', minWidth: '16px', textAlign: 'center' }}>
            {score}
          </span>
          <button
            style={{ ...iconBtnStyle, padding: '6px 8px', color: userVote === -1 ? '#D7DADC' : '#818384' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#D7DADC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = userVote === -1 ? '#D7DADC' : '#818384')}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(-1) }}
            aria-label="downvote"
          >
            <DownArrow />
          </button>
        </div>

        {/* Comments */}
        <IntentPrefetchLink
          href={`/p/${id}`}
          style={pillStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#343536')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#272729')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {commentCount}
        </IntentPrefetchLink>

        {/* Share dropdown */}
        <ShareButton id={id} title={title} />
      </div>

      <ReactionBar
        postId={id}
        initialCounts={reactionCounts}
        initialUserReactions={[]}
        initialTotalCount={reactionCount ?? 0}
      />
    </article>
  )
}
