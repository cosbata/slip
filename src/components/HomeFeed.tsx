'use client'
import { useState } from 'react'
import { PostCard } from '@/components/PostCard'
import { SortDropdown, sortPosts } from '@/components/SortDropdown'
import type { SortOption } from '@/components/SortDropdown'
import type { PostCardData } from '@/lib/types'

type Track = 'all' | 'companies' | 'investors'

const TABS: { label: string; value: Track }[] = [
  { label: 'All', value: 'all' },
  { label: 'Companies', value: 'companies' },
  { label: 'Investors', value: 'investors' },
]

export function HomeFeed({ posts }: { posts: PostCardData[] }) {
  const [activeTrack, setActiveTrack] = useState<Track>(() => {
    if (typeof window === 'undefined') return 'all'
    const savedTrack = localStorage.getItem('fail-it-preferred-track')
    return savedTrack === 'companies' || savedTrack === 'investors' ? savedTrack : 'all'
  })
  const [sort, setSort] = useState<SortOption>('best')

  function handleTabChange(track: Track) {
    setActiveTrack(track)
    if (track !== 'all') localStorage.setItem('fail-it-preferred-track', track)
    else localStorage.removeItem('fail-it-preferred-track')
  }

  const filtered = sortPosts(
    posts.filter((p) => {
      if (activeTrack === 'all') return true
      return p.communityTrack?.toLowerCase() === activeTrack
    }),
    sort
  )

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 0 10px 0', flexWrap: 'wrap' }}>
        <SortDropdown value={sort} onChange={setSort} />
        {TABS.map((tab) => {
          const active = activeTrack === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              style={{
                padding: '6px 12px', borderRadius: '20px',
                border: `1px solid ${active ? '#818384' : '#343536'}`,
                backgroundColor: active ? '#272729' : 'transparent',
                color: active ? '#D7DADC' : '#818384',
                fontWeight: 400, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#818384', marginBottom: '8px' }}>No stories yet</p>
          <p style={{ color: '#818384', fontSize: '14px' }}>Be the first to share a rejection story</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              body={post.body ?? undefined}
              voteScore={post.voteScore}
              communitySlug={post.communitySlug}
              communityName={post.communityName}
              createdAt={post.createdAt}
              commentCount={post.commentCount}
              reactionCount={post.reactionCount}
              interviewStage={post.interviewStage}
              fundingStage={post.fundingStage}
              outcomeCategory={post.outcomeCategory}
              embedUrl={post.embedUrl}
              embedType={post.embedType}
              communityTrack={post.communityTrack}
              tags={post.tags}
              isOwnPost={post.isOwnPost}
            />
          ))}
        </div>
      )}
    </>
  )
}
