'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import type { RecentPost } from '@/components/TrackView'

const KEY = 'fail-it-recent-posts'

export function RecentPosts() {
  const [posts, setPosts] = useState<RecentPost[]>([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      queueMicrotask(() => setPosts(saved))
    } catch {}
  }, [])

  function handleClear() {
    localStorage.removeItem(KEY)
    setPosts([])
  }

  return (
    <div style={{ borderBottom: '1px solid #1e1f20', paddingBottom: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 10px', borderBottom: '1px solid #1e1f20',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 400, color: '#818384', textTransform: 'uppercase' }}>
          Recent Posts
        </span>
        {posts.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              fontSize: '12px', color: '#818384', cursor: 'pointer',
              background: 'none', border: 'none', padding: 0, fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#818384')}
          >
            Clear
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div style={{ padding: '16px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#818384', margin: 0 }}>
            No recently viewed posts
          </p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/p/${post.id}`}
              style={{
                display: 'flex', gap: '8px', padding: '8px 12px',
                textDecoration: 'none', borderBottom: '1px solid #1e1f20',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                <CommunityAvatar
                  slug={post.communitySlug}
                  name={post.communityName ?? post.communitySlug}
                  size={20}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '12px', color: '#818384', margin: '0 0 2px' }}>
                  {post.communitySlug}
                </p>
                <p style={{
                  fontSize: '13px', color: '#D7DADC', fontWeight: 400,
                  margin: 0, lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {post.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
