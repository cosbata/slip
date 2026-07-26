export const dynamic = 'force-dynamic'

import { db } from '../../../drizzle'
import { communities, posts } from '../../../drizzle/schema'
import { isNull, count } from 'drizzle-orm'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import Link from 'next/link'

export default async function CommunitiesPage() {
  // Top-level communities only (no parent)
  const parents = await db
    .select()
    .from(communities)
    .where(isNull(communities.parentCommunityId))
    .orderBy(communities.track, communities.name)

  // Post counts per community
  const counts = await db
    .select({ communityId: posts.communityId, n: count() })
    .from(posts)
    .where(isNull(posts.deletedAt))
    .groupBy(posts.communityId)

  const postCount = Object.fromEntries(counts.map((c) => [c.communityId, c.n]))

  const companies = parents
    .filter((c) => c.track === 'COMPANIES')
    .sort((a, b) => (postCount[b.id] ?? 0) - (postCount[a.id] ?? 0))

  const investors = parents
    .filter((c) => c.track === 'INVESTORS')
    .sort((a, b) => (postCount[b.id] ?? 0) - (postCount[a.id] ?? 0))

  return (
    <div style={{ maxWidth: '1072px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 400, color: '#D7DADC', marginBottom: '24px' }}>
        All Communities
      </h1>

      {/* Companies */}
      <Section title="Companies" communities={companies} postCount={postCount} />

      {/* Investors */}
      {investors.length > 0 && (
        <Section title="Investors" communities={investors} postCount={postCount} />
      )}
    </div>
  )
}

type Community = {
  id: string
  slug: string
  name: string
  track: string
  institutionLogoUrl: string | null
}

function Section({
  title,
  communities,
  postCount,
}: {
  title: string
  communities: Community[]
  postCount: Record<string, number>
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2
        style={{
          fontSize: '12px',
          fontWeight: 400,
          color: '#818384',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #1e1f20',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '8px',
        }}
      >
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              textDecoration: 'none',
              color: '#D7DADC',
            }}
          >
            <CommunityAvatar
              slug={c.slug}
              name={c.name}
              size={32}
              institutionLogoUrl={c.institutionLogoUrl}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#D7DADC',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.name}
              </div>
              <div style={{ fontSize: '12px', color: '#818384', marginTop: '2px' }}>
                {c.slug}
              </div>
            </div>
            {(postCount[c.id] ?? 0) > 0 && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#818384',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {postCount[c.id]} posts
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
