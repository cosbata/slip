export const revalidate = 60

import { db } from '../../drizzle'
import { posts, communities } from '../../drizzle/schema'
import { eq, isNull, desc, inArray, sql as drizzleSql } from 'drizzle-orm'
import { HomeFeed } from '@/components/HomeFeed'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { NewsWidget } from '@/components/NewsWidget'
import type { PostCardData } from '@/lib/types'
import Link from 'next/link'
import { dedupePostsByContent } from '@/lib/dedupePosts'
import { TrustExplainer } from '@/components/TrustExplainer'


export default async function HomePage() {
  // Keep the homepage cacheable and cheap: no per-viewer auth lookups here.
  // Auth-only UI hydrates separately in NavAuth, and write access remains
  // enforced by middleware + API routes.
  const FEATURED_SLUGS = [
    'companies/google', 'companies/openai', 'companies/anthropic',
    'companies/meta', 'companies/apple', 'companies/microsoft',
    'companies/amazon', 'companies/nvidia', 'companies/stripe',
    'companies/netflix',
  ]

  const [countRows, rows, communityRows] = await Promise.all([
    db
      .select({ count: drizzleSql<number>`count(*)::int` })
      .from(posts)
      .where(isNull(posts.deletedAt)),
    db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        voteScore: posts.voteScore,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        communitySlug: communities.slug,
        communityName: communities.name,
        communityTrack: communities.track,
        interviewStage: posts.interviewStage,
        fundingStage: posts.fundingStage,
        outcomeCategory: posts.outcomeCategory,
        embedUrl: posts.embedUrl,
        embedType: posts.embedType,
        reactionCount: posts.reactionCount,
        isAnonymous: posts.isAnonymous,
      })
      .from(posts)
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .where(isNull(posts.deletedAt))
      .orderBy(desc(posts.createdAt))
      .limit(100),
    db
      .select({ id: communities.id, slug: communities.slug, name: communities.name, institutionLogoUrl: communities.institutionLogoUrl })
      .from(communities)
      .where(inArray(communities.slug, FEATURED_SLUGS)),
  ])

  const totalPostCount = countRows[0]?.count ?? 0

  // Preserve curated order
  const communityList = FEATURED_SLUGS
    .map(s => communityRows.find(c => c.slug === s))
    .filter(Boolean) as typeof communityRows

  const allPosts: PostCardData[] = dedupePostsByContent(rows).slice(0, 50).map((p) => ({
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
    reactionCount: p.reactionCount,
    isAnonymous: p.isAnonymous,
    isOwnPost: false,
  }))

  return (
    <div
      className="two-column-layout"
      style={{
        maxWidth: '1072px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        gap: '24px',
      }}
    >
      {/* Main feed — capped at 690px per new Reddit */}
      <main className="content-column" style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
        {/* Rejection counter */}
        <p style={{ fontSize: '13px', color: '#818384', marginBottom: '12px', marginTop: 0 }}>
          <span style={{ color: '#FF4500', fontWeight: 700 }}>{totalPostCount.toLocaleString()}</span> rejections shared here
        </p>
        <TrustExplainer compact />
        <HomeFeed posts={allPosts} />
      </main>

      {/* Sidebar — communities */}
      <aside className="right-sidebar" style={{ width: '240px', minWidth: '240px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '68px' }}>
          {/* Curated top communities */}
          <p style={{ fontSize: '11px', fontWeight: 400, color: '#818384', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px', paddingBottom: '8px', borderBottom: '1px solid #1e1f20' }}>
            Communities
          </p>
          {communityList.map(c => {
            const shortName = c.slug.split('/').pop() ?? c.name
            return (
              <Link key={c.id} prefetch={false} href={`/c/${c.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', textDecoration: 'none', color: '#D7DADC' }}>
                <CommunityAvatar slug={c.slug} name={c.name} size={24} institutionLogoUrl={c.institutionLogoUrl} />
                <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortName}</span>
              </Link>
            )
          })}
          <Link prefetch={false} href="/communities" style={{ display: 'block', fontSize: '13px', color: '#818384', marginTop: '8px', textDecoration: 'none' }}>
            View all communities →
          </Link>

          {/* News widget */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #1e1f20', paddingTop: '16px' }}>
            <NewsWidget />
          </div>

        </div>
      </aside>
    </div>
  )
}
