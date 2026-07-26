'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PostCard } from '@/components/PostCard'

interface UserData {
  id: string
  username: string
  karma: number
  createdAt: string
}

interface UserPost {
  id: string
  title: string
  body?: string | null
  voteScore: number
  createdAt: string
  interviewStage: string | null
  fundingStage: string | null
  outcomeCategory: string | null
  communitySlug: string | null
  communityName: string | null
  embedUrl?: string | null
  embedType?: string | null
  isAnonymous?: boolean
}

interface UserComment {
  id: string
  body: string
  voteScore: number
  createdAt: string
  postId: string
}

function timeAgo(date: string) {
  const s = (Date.now() - new Date(date).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [tab, setTab] = useState<'posts' | 'comments'>('posts')

  const [user, setUser] = useState<UserData | null>(null)
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [userComments, setUserComments] = useState<UserComment[]>([])
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`

  useEffect(() => {
    if (!username) return
    fetch(`/api/users/${encodeURIComponent(username)}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null }
        return res.json()
      })
      .then(data => {
        if (!data) return
        setUser(data.user)
        setUserPosts(data.posts ?? [])
        setUserComments(data.comments ?? [])
        setIsOwnProfile(data.isOwnProfile ?? false)
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px', color: '#818384', textAlign: 'center' }}>
      Loading...
    </div>
  )

  if (notFound || !user) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px', color: '#818384', textAlign: 'center' }}>
      User not found.
    </div>
  )

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? '#D7DADC' : '#818384',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #D7DADC' : '2px solid transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
  })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 0 40px 0' }}>

      {/* Banner */}
      <div style={{ height: '100px', backgroundColor: '#272729', borderRadius: '0 0 0 0' }} />

      {/* Avatar + name row */}
      <div style={{ padding: '0 24px', position: 'relative' }}>
        {/* Avatar overlapping banner */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          overflow: 'hidden', border: '4px solid #0D0D0D',
          backgroundColor: '#343536',
          position: 'relative', marginTop: '-40px', marginBottom: '12px',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="" width={80} height={80} style={{ display: 'block' }} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#D7DADC', margin: '0 0 4px 0' }}>
          {user.username}
        </h1>
        <div style={{ fontSize: '13px', color: '#818384', display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span>Karma {user.karma.toLocaleString()}</span>
          <span>·</span>
          <span>Joined {joinedDate}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #343536', padding: '0 24px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle(tab === 'posts')} onClick={() => setTab('posts')}>
          Posts {userPosts.length}
        </button>
        <button style={tabStyle(tab === 'comments')} onClick={() => setTab('comments')}>
          Comments {userComments.length}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* Posts tab */}
        {tab === 'posts' && (
          userPosts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#818384', fontSize: '14px' }}>
              No posts yet.
            </div>
          ) : (
            <div>
              {userPosts.map(p => (
                <PostCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  body={p.body ?? undefined}
                  voteScore={p.voteScore}
                  communitySlug={p.communitySlug ?? ''}
                  communityName={p.communityName}
                  authorUsername={p.isAnonymous ? 'anonymous' : user.username}
                  createdAt={p.createdAt}
                  interviewStage={p.interviewStage}
                  fundingStage={p.fundingStage}
                  outcomeCategory={p.outcomeCategory}
                  embedUrl={p.embedUrl}
                  embedType={p.embedType}
                  isAnonymous={p.isAnonymous}
                  isOwnAnonymousPost={isOwnProfile && p.isAnonymous}
                  isOwnPost={isOwnProfile}
                />
              ))}
            </div>
          )
        )}

        {/* Comments tab */}
        {tab === 'comments' && (
          userComments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#818384', fontSize: '14px' }}>
              No comments yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userComments.map(c => (
                <a
                  key={c.id}
                  href={`/p/${c.postId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    backgroundColor: 'transparent', border: 'none',
                    borderBottom: '1px solid #1e1f20',
                    borderRadius: '0', padding: '14px 16px',
                    transition: 'background-color 0.1s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0f0f0f')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ fontSize: '12px', color: '#818384', marginBottom: '6px', display: 'flex', gap: '8px' }}>
                      <span>{timeAgo(c.createdAt)}</span>
                      <span>·</span>
                      <span>{c.voteScore} points</span>
                    </div>
                    <p style={{
                      fontSize: '14px', color: '#D7DADC', margin: 0,
                      lineHeight: 1.5, whiteSpace: 'pre-wrap',
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {c.body}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
