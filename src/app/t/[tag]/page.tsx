export const dynamic = 'force-dynamic'

import { db } from '../../../../drizzle'
import { posts, communities, tags, postTags } from '../../../../drizzle/schema'
import { eq, isNull, desc } from 'drizzle-orm'
import { HomeFeed } from '@/components/HomeFeed'
import { RecentPosts } from '@/components/RecentPosts'
import { HomeUserCard } from '@/components/HomeUserCard'
import type { PostCardData } from '@/lib/types'

interface Props {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params

  // Resolve tag label
  const [tagRow] = await db
    .select({ id: tags.id, label: tags.label })
    .from(tags)
    .where(eq(tags.slug, tag))

  // Join: posts → postTags → tags where tags.slug = tag
  const rows = tagRow
    ? await db
        .select({
          id: posts.id,
          title: posts.title,
          body: posts.body,
          voteScore: posts.voteScore,
          createdAt: posts.createdAt,
          communitySlug: communities.slug,
          communityName: communities.name,
          communityTrack: communities.track,
          interviewStage: posts.interviewStage,
          fundingStage: posts.fundingStage,
          outcomeCategory: posts.outcomeCategory,
          embedUrl: posts.embedUrl,
          embedType: posts.embedType,
          isAnonymous: posts.isAnonymous,
          reactionCount: posts.reactionCount,
        })
        .from(posts)
        .innerJoin(postTags, eq(postTags.postId, posts.id))
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .leftJoin(communities, eq(posts.communityId, communities.id))
        .where(eq(tags.slug, tag))
        .orderBy(desc(posts.createdAt))
        .limit(50)
    : []

  const tagPosts: PostCardData[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    voteScore: p.voteScore,
    communitySlug: p.communitySlug ?? '',
    communityName: p.communityName,
    communityTrack: p.communityTrack,
    createdAt: p.createdAt,
    interviewStage: p.interviewStage,
    fundingStage: p.fundingStage,
    outcomeCategory: p.outcomeCategory,
    embedUrl: p.embedUrl,
    embedType: p.embedType,
    isAnonymous: p.isAnonymous,
    reactionCount: p.reactionCount,
  }))

  const displayLabel = tagRow?.label ?? tag

  return (
    <div
      style={{
        maxWidth: '1072px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        gap: '24px',
      }}
    >
      {/* Main feed */}
      <main style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
        {/* Tag header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#FF4500', margin: 0 }}>
            #{displayLabel}
          </h1>
          <p style={{ fontSize: '13px', color: '#818384', margin: '4px 0 0' }}>
            Posts tagged with #{tag}
          </p>
        </div>

        {tagPosts.length === 0 ? (
          <div
            style={{
              backgroundColor: '#1A1A1B',
              border: '1px solid #343536',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#818384', margin: 0 }}>
              No rejections tagged #{tag} yet. Be the first.
            </p>
          </div>
        ) : (
          <HomeFeed posts={tagPosts} />
        )}
      </main>

      {/* Sidebar */}
      <aside
        style={{
          width: '312px',
          minWidth: '312px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <RecentPosts />
        <HomeUserCard />

        <div style={{ fontSize: '12px', color: '#818384', lineHeight: 1.8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {['Help', 'About', 'Rules', 'Privacy Policy', 'Terms'].map((link) => (
              <a key={link} href="#" style={{ color: '#818384', textDecoration: 'none' }}>
                {link}
              </a>
            ))}
          </div>
          <p style={{ marginTop: '8px' }}>slip © 2026. All rights reserved.</p>
        </div>
      </aside>
    </div>
  )
}
