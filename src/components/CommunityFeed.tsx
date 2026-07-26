'use client'
import { useState } from 'react'
import { PostCard } from '@/components/PostCard'
import { SortDropdown, sortPosts } from '@/components/SortDropdown'
import type { SortOption } from '@/components/SortDropdown'
import Link from 'next/link'

interface FeedPost {
  id: string
  title: string
  body?: string | null
  voteScore: number
  createdAt: Date
  interviewStage?: string | null
  fundingStage?: string | null
  outcomeCategory?: string | null
  reactionCount?: number
  authorUsername?: string | null
  embedUrl?: string | null
  embedType?: string | null
}

interface Props {
  posts: FeedPost[]
  communitySlug: string
  communityName: string
  isLoggedIn: boolean
}

export function CommunityFeed({ posts, communitySlug, communityName, isLoggedIn }: Props) {
  const [sort, setSort] = useState<SortOption>('best')

  const sorted = sortPosts(posts, sort)

  if (posts.length === 0) {
    return (
      <div style={{ padding: '48px 32px', textAlign: 'center' }}>
        <p style={{ color: '#818384', marginBottom: '12px', fontSize: '14px' }}>No posts yet</p>
        {isLoggedIn ? (
          <Link prefetch={false} href={`/submit?community=${communitySlug}`} style={{
            padding: '8px 20px', backgroundColor: '#FFFFFF',
            borderRadius: '20px', color: '#0D0D0D', fontWeight: 400,
            fontSize: '14px', textDecoration: 'none',
          }}>Be the first to post</Link>
        ) : (
          <Link prefetch={false} href="/login" style={{
            padding: '8px 20px', backgroundColor: '#FFFFFF',
            borderRadius: '20px', color: '#0D0D0D', fontWeight: 400,
            fontSize: '14px', textDecoration: 'none',
          }}>Log In to Post</Link>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <SortDropdown value={sort} onChange={setSort} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {sorted.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            body={post.body ?? undefined}
            voteScore={post.voteScore}
            communitySlug={communitySlug}
            communityName={communityName}
            authorUsername={post.authorUsername ?? undefined}
            createdAt={post.createdAt}
            interviewStage={post.interviewStage}
            fundingStage={post.fundingStage}
            outcomeCategory={post.outcomeCategory}
            reactionCount={post.reactionCount}
            embedUrl={post.embedUrl}
            embedType={post.embedType}
          />
        ))}
      </div>
    </div>
  )
}
