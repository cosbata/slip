export const revalidate = 60
export const dynamic = 'force-static'

import { db } from '../../../../drizzle'
import { posts, communities, users } from '../../../../drizzle/schema'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ReportButton } from '@/components/ReportButton'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { CommunityRules } from '@/components/CommunityRules'
import { UserChip } from '@/components/UserChip'
import { EmbedCard } from '@/components/EmbedCard'
import Link from 'next/link'
import { TrustExplainer } from '@/components/TrustExplainer'
import { TrackView } from '@/components/TrackView'
import { ShareButtons } from '@/components/ShareButtons'
import { PostComments } from '@/components/PostComments'
import type { Metadata } from 'next'
import { cache } from 'react'

interface Props {
  params: Promise<{ postId: string }>
}


function titleCaseSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getInstitutionView(community: typeof communities.$inferSelect | null) {
  if (!community) return null
  const parts = community.slug.split('/')
  if (parts.length >= 3) {
    const institutionSlug = parts.slice(0, 2).join('/')
    return {
      slug: institutionSlug,
      name: titleCaseSlug(parts[1] ?? community.name),
      createdAt: community.createdAt,
      institutionLogoUrl: community.institutionLogoUrl,
      sidebarRules: community.sidebarRules,
      isParent: true,
    }
  }
  return {
    slug: community.slug,
    name: community.name,
    createdAt: community.createdAt,
    institutionLogoUrl: community.institutionLogoUrl,
    sidebarRules: community.sidebarRules,
    isParent: false,
  }
}

export async function generateStaticParams() {
  const rows = await db.select({ postId: posts.id })
    .from(posts)
    .where(isNull(posts.deletedAt))
    .orderBy(desc(posts.createdAt))
    .limit(100)

  return rows.map(({ postId }) => ({ postId }))
}

const getPostRow = cache(async (postId: string) => {
  const result = await db.select({ post: posts, community: communities, author: users })
    .from(posts)
    .leftJoin(communities, eq(posts.communityId, communities.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
    .limit(1)

  return result[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params

  const row = await getPostRow(postId)
  if (!row) {
    return { title: 'Post not found | slip' }
  }

  const { post, community } = row
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://slip.wtf'
  const url = `${appUrl}/p/${postId}`

  const title = `${post.title} | slip`
  const description = post.body
    ? post.body.slice(0, 160)
    : `Rejection story from ${community?.name ?? 'a company'}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'slip',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const STAGE_LABELS: Record<string, string> = {
  SCREEN: 'Resume Screen', PHONE: 'Phone', ONSITE: 'Onsite',
  FINAL: 'Final Round', OFFER_RESCINDED: 'Offer Rescinded',
}
const OUTCOME_LABELS: Record<string, string> = {
  HIRED_ELSEWHERE: 'Got hired elsewhere', RAISED_FUNDING: 'Raised funding',
  STARTED_COMPANY: 'Started a company', JOINED_PROGRAM: 'Joined a program',
  STILL_SEARCHING: 'Still searching', PIVOTED_CAREERS: 'Pivoted careers', OTHER: 'Other',
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params

  const row = await getPostRow(postId)
  if (!row) notFound()
  const { post, community, author } = row

  // Derive the top-level institution from the community slug instead of doing a
  // second DB round-trip. This keeps post detail cache-miss generation fast.
  const institutionCommunity = getInstitutionView(community)
  const isSubCommunity = !!institutionCommunity?.isParent

  const defaultRules = [
    'No real names of individuals (interviewers, recruiters, partners)',
    'Share experiences, not rumors',
    'Be respectful — rejection is hard for everyone',
    'Mark sensitive content appropriately',
    'No verbatim questions',
  ]
  const customRules = (institutionCommunity?.sidebarRules ?? '').split('\n').filter(r => r.trim())
  const rules = customRules.length ? customRules : defaultRules
  const institutionName = institutionCommunity?.name ?? ''
  const institutionSlug = institutionCommunity?.slug ?? ''

  const createdDate = institutionCommunity
    ? new Date(institutionCommunity.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <div>
      <TrackView post={{
        id: post.id,
        title: post.title,
        communitySlug: community?.slug ?? '',
        communityName: community?.name ?? null,
      }} />
      {/* Banner */}
      <div className="community-banner" style={{ backgroundColor: '#1A1A1B', height: '80px', width: '100%' }} />

      {/* Community header */}
      <div className="community-hero" style={{ backgroundColor: '#1A1A1B', borderBottom: '1px solid #343536' }}>
        <div className="community-hero__inner" style={{ maxWidth: '1072px', margin: '0 auto', padding: '0 24px' }}>
          <div className="community-hero__row" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '12px', marginTop: '-20px' }}>
            <div style={{ borderRadius: '50%', border: '4px solid #1A1A1B', flexShrink: 0, lineHeight: 0 }}>
              {institutionCommunity && (
                <CommunityAvatar slug={institutionSlug} name={institutionCommunity.name} size={80} institutionLogoUrl={institutionCommunity.institutionLogoUrl} />
              )}
            </div>
            <div className="community-hero__title-row" style={{ paddingBottom: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1 }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#D7DADC', margin: 0, lineHeight: 1.2 }}>
                  {isSubCommunity ? (
                    <><Link prefetch={false} href={`/c/${institutionSlug}`} style={{ color: '#D7DADC', textDecoration: 'none' }}>{institutionCommunity?.name}</Link>
                    <span style={{ color: '#818384', fontWeight: 300 }}> / {community?.name}</span></>
                  ) : (
                    <Link prefetch={false} href={`/c/${institutionSlug}`} style={{ color: '#D7DADC', textDecoration: 'none' }}>{institutionCommunity?.name}</Link>
                  )}
                </h1>
                <p style={{ fontSize: '14px', color: '#818384', margin: '2px 0 0' }}>
                  {community?.slug}
                </p>
              </div>
              <Link prefetch={false} href={`/c/${community?.slug}`} style={{
                padding: '6px 16px', borderRadius: '20px',
                border: '1px solid #343536', color: '#818384',
                fontSize: '14px', textDecoration: 'none',
              }}>
                ← Back to community
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body: 2-column */}
      <div className="two-column-layout" style={{ maxWidth: '1072px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '24px' }}>

        {/* Main: post + comments */}
        <main className="content-column" style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>

          {/* Post card */}
          <article className="post-article" style={{
            backgroundColor: 'transparent', border: 'none',
            borderBottom: '1px solid #1e1f20',
            borderRadius: '0', padding: '20px 24px', marginBottom: '0',
          }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#D7DADC', margin: '0 0 10px 0', lineHeight: 1.35 }}>
              {post.title}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#818384', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#D7DADC', fontWeight: 500 }}><UserChip username={author?.username} size={20} /></span>
              <span>·</span>
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span>·</span>
              <span>{post.voteScore} points</span>
              {post.editedAt && <><span>·</span><span>edited</span></>}
              <span style={{ marginLeft: 'auto' }}><ReportButton targetType="POST" targetId={post.id} /></span>
            </div>

            {/* Structured metadata */}
            {(post.roleTitle || post.interviewStage || post.rejectionYear || post.fundingStage || post.industryVertical) && (
              <div style={{ fontSize: '13px', color: '#818384', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                {[
                  post.roleTitle,
                  post.interviewStage ? (STAGE_LABELS[post.interviewStage] ?? post.interviewStage) : null,
                  post.rejectionYear ? String(post.rejectionYear) : null,
                  post.fundingStage,
                  post.industryVertical,
                ].filter(Boolean).map((item, i, arr) => (
                  <span key={i}>
                    <span style={{ color: '#9a9b9c' }}>{item}</span>
                    {i < arr.length - 1 && <span style={{ margin: '0 6px', color: '#555' }}>·</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Platform embed card */}
            {post.embedUrl && post.embedType && (
              <EmbedCard url={post.embedUrl} embedType={post.embedType} />
            )}

            {/* Body */}
            {post.body && (() => {
              const DISCLAIMER_KO = '\uc2e4\uc81c \uacbd\ud5d8\uc744 \ubc14\ud0d5\uc73c\ub85c'
              const hasDisclaimer = post.body!.includes('Based on a real account') || post.body!.includes(DISCLAIMER_KO)
              const bodyIsHtml = /<[a-z][\s\S]*>/i.test(post.body!)
              const cleaned = bodyIsHtml
                ? post.body!
                    .replace(/Based on a real account[^\n<]*/g, '')
                    .trim()
                : post.body!
                    .split('\n')
                    .filter(line => !/^\*\*[^*]+\*\*\s*:/.test(line.trim()))
                    .filter(line => !/\*Based on a real account\*/.test(line) && !line.includes(DISCLAIMER_KO))
                    .filter(line => !/^---\s*$/.test(line.trim()))
                    .join('\n')
                    .replace(/\*\*([^*]+)\*\*/g, '$1')
                    .replace(/\n{3,}/g, '\n\n')
                    .replace(/^[\s\n-]+/, '')
                    .trim()
              return (
                <>
                  {cleaned ? (
                    bodyIsHtml ? (
                      <div
                        style={{ fontSize: '15px', lineHeight: 1.65, color: '#D7DADC', margin: 0 }}
                        dangerouslySetInnerHTML={{ __html: cleaned }}
                      />
                    ) : (
                      <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#D7DADC', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {cleaned}
                      </p>
                    )
                  ) : null}
                  {hasDisclaimer && (
                    <p style={{ fontSize: '11px', color: '#555657', textAlign: 'right', marginTop: '16px', fontStyle: 'italic', margin: '16px 0 0 0' }}>
                      Based on a real account, adapted for anonymity
                    </p>
                  )}
                </>
              )
            })()}

            {/* Outcome */}
            {post.outcomeCategory && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #343536' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#4ade80', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What happened next</p>
                <p style={{ fontSize: '14px', color: '#D7DADC', margin: 0 }}>{OUTCOME_LABELS[post.outcomeCategory] ?? post.outcomeCategory}</p>
                {post.outcomeStory && <p style={{ fontSize: '14px', color: '#D7DADC', margin: '6px 0 0 0' }}>{post.outcomeStory}</p>}
              </div>
            )}
          </article>

          {/* Share */}
          <div style={{ padding: '0 24px 20px' }}>
            <ShareButtons postId={post.id} title={post.title} />
          </div>

          {/* Comments load after the story so post navigation is not blocked by comment queries. */}
          <PostComments postId={post.id} />
        </main>

        {/* Sidebar */}
        <aside className="right-sidebar" style={{ width: '312px', minWidth: '312px', display: 'flex', flexDirection: 'column' }}>

          {/* About */}
          <div style={{ backgroundColor: 'transparent', borderRadius: '0', marginBottom: '12px', padding: '16px', borderBottom: '1px solid #1e1f20' }}>
            <p style={{ fontSize: '14px', color: '#D7DADC', lineHeight: 1.6, margin: '0 0 12px' }}>
              Share and discover rejection stories from {institutionName}.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#818384', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Created: {createdDate}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#818384', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              Public
            </div>
            <TrustExplainer compact />

            <Link prefetch={false} href={`/submit?community=${community?.slug}`} style={{
              display: 'block', width: '100%', textAlign: 'center',
              padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '20px',
              color: '#0D0D0D', fontWeight: 400, fontSize: '14px',
              textDecoration: 'none', boxSizing: 'border-box',
            }}>
              + Create Post
            </Link>
          </div>

          {/* Rules */}
          <CommunityRules rules={rules} institution={institutionName} />

        </aside>
      </div>
    </div>
  )
}
