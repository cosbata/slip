export const revalidate = 60
export const dynamic = 'force-static'

import { db } from '../../../../../../drizzle'
import { communities, posts, users } from '../../../../../../drizzle/schema'
import { eq, and, isNull, desc, ne } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/PostCard'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { CommunityRules } from '@/components/CommunityRules'
import { CommunityActions } from '@/components/CommunityActions'
import { SubCommunityButton } from '@/components/SubCommunityButton'
import { CommunitySwitcher } from '@/components/CommunitySwitcher'
import { getCommunityStats } from '@/lib/stats'
import Link from 'next/link'
import { dedupePostsByContent } from '@/lib/dedupePosts'
import { TrustExplainer } from '@/components/TrustExplainer'

interface Props {
  params: Promise<{ track: string; institution: string; sub: string }>
}


export async function generateStaticParams() {
  const rows = await db.select({ slug: communities.slug }).from(communities)

  return rows
    .map(({ slug }) => slug.split('/'))
    .filter((parts) => parts.length === 3)
    .map(([track, institution, sub]) => ({ track, institution, sub }))
}

export default async function SubCommunityPage({ params }: Props) {
  const { track, institution, sub } = await params
  const slug = `${track}/${institution}/${sub}`
  const parentSlug = `${track}/${institution}`

  const [community] = await db.select().from(communities).where(eq(communities.slug, slug))
  if (!community) notFound()

  const [parent, subSubs, siblings, postRows, stats] = await Promise.all([
    db.select().from(communities).where(eq(communities.slug, parentSlug)).then((rows) => rows[0]),
    db
      .select()
      .from(communities)
      .where(eq(communities.parentCommunityId, community.id)),
    community.parentCommunityId
      ? db
          .select()
          .from(communities)
          .where(
            and(
              eq(communities.parentCommunityId, community.parentCommunityId),
              ne(communities.id, community.id)
            )
          )
      : Promise.resolve([]),
    db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        voteScore: posts.voteScore,
        createdAt: posts.createdAt,
        interviewStage: posts.interviewStage,
        fundingStage: posts.fundingStage,
        outcomeCategory: posts.outcomeCategory,
        reactionCount: posts.reactionCount,
        authorUsername: users.username,
        embedUrl: posts.embedUrl,
        embedType: posts.embedType,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(and(eq(posts.communityId, community.id), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt))
      .limit(50),
    getCommunityStats(community.id),
  ])
  const recentPosts = dedupePostsByContent(postRows).slice(0, 15)
  const rules = (community.sidebarRules ?? '').split('\n').filter((r) => r.trim())
  const parentName = parent?.name ?? institution
  const createdDate = new Date(community.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div>
      {/* Banner */}
      <div className="community-banner" style={{ backgroundColor: '#272729', height: '80px', width: '100%' }} />

      {/* Community header */}
      <div className="community-hero" style={{ backgroundColor: '#1A1A1B', borderBottom: '1px solid #343536' }}>
        <div className="community-hero__inner" style={{ maxWidth: '1072px', margin: '0 auto', padding: '0 24px' }}>
          <div className="community-hero__row" style={{
            display: 'flex', alignItems: 'flex-end', gap: '16px',
            paddingBottom: '12px', marginTop: '-20px',
          }}>
            {/* Avatar — parent's logo */}
            <div style={{ borderRadius: '50%', border: '4px solid #1A1A1B', flexShrink: 0, lineHeight: 0 }}>
              <CommunityAvatar
                slug={parentSlug}
                name={parentName}
                size={80}
                institutionLogoUrl={parent?.institutionLogoUrl ?? null}
              />
            </div>

            <div className="community-hero__title-row" style={{
              paddingBottom: '8px', display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', flex: 1,
            }}>
              <div>
                {/* Big title: "Airbnb / SWE" */}
                <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#D7DADC', margin: 0, lineHeight: 1.2 }}>
                  <Link prefetch={false} href={`/c/${parentSlug}`} style={{ color: '#D7DADC', textDecoration: 'none' }}>
                    {parentName}
                  </Link>
                  <span style={{ color: '#818384', margin: '0 10px', fontWeight: 300 }}>/</span>
                  {community.name}
                </h1>
                {/* Small slug + navigation buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '14px', color: '#818384', margin: 0 }}>
                    <Link prefetch={false} href={`/c/${parentSlug}`} style={{ color: '#818384', textDecoration: 'none' }}>
                      {parentSlug}
                    </Link>
                    <span style={{ margin: '0 4px' }}>/</span>
                    {sub}
                  </p>
                  <CommunitySwitcher
                    currentSlug={slug}
                    parentSlug={parentSlug}
                    parentName={parentName}
                    siblings={siblings}
                  />
                  {subSubs.length > 0 && (
                    <SubCommunityButton parentSlug={slug} subCommunities={subSubs} />
                  )}
                </div>
              </div>
              <CommunityActions slug={slug} institution={institution} communityId={community.id} initialJoined={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="two-column-layout" style={{
        maxWidth: '1072px', margin: '0 auto', padding: '20px 24px',
        display: 'flex', gap: '24px',
      }}>
        {/* Feed */}
        <main className="content-column" style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
          {recentPosts.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <p style={{ color: '#818384', marginBottom: '12px', fontSize: '14px' }}>No posts yet</p>
              <TrustExplainer compact />

            <Link prefetch={false} href={`/submit?community=${slug}`} style={{
                padding: '8px 20px', backgroundColor: '#FFFFFF',
                borderRadius: '20px', color: '#0D0D0D',
                fontWeight: 400, fontSize: '14px', textDecoration: 'none',
              }}>
                Be the first to post
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body ?? undefined}
                  voteScore={post.voteScore}
                  communitySlug={slug}
                  communityName={`${parentName} / ${community.name}`}
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
          )}
        </main>

        {/* Sidebar */}
        <aside className="right-sidebar" style={{ width: '312px', minWidth: '312px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            backgroundColor: 'transparent', borderRadius: '0',
            marginBottom: '12px', padding: '16px',
            borderBottom: '1px solid #1e1f20',
          }}>
            <p style={{ fontSize: '14px', color: '#D7DADC', lineHeight: 1.6, margin: '0 0 12px' }}>
              Share and discover rejection stories from {parentName} {community.name}.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#818384', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Created: {createdDate}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#818384', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              Public
            </div>
            {stats && stats.totalStories > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #1e1f20',
              }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC' }}>{stats.totalStories.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#818384' }}>Members</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC' }}>{Math.max(1, Math.floor(stats.totalStories * 0.3)).toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#818384' }}>Contributors</div>
                </div>
              </div>
            )}
            <TrustExplainer compact />

            <Link prefetch={false} href={`/submit?community=${slug}`} style={{
              display: 'block', width: '100%', textAlign: 'center',
              padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '20px',
              color: '#0D0D0D', fontWeight: 400, fontSize: '14px',
              textDecoration: 'none', boxSizing: 'border-box',
            }}>
              + Create Post
            </Link>
          </div>

          <CommunityRules rules={rules} institution={sub} />
        </aside>
      </div>
    </div>
  )
}
