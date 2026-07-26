import Link from 'next/link'
import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm'
import { db } from '../../../drizzle'
import { communities, posts, users } from '../../../drizzle/schema'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import { UserChip } from '@/components/UserChip'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string }>
}

function cleanQuery(value: string | undefined) {
  return (value ?? '').trim().slice(0, 80)
}

function excerpt(text: string | null | undefined, max = 180) {
  if (!text) return ''
  const cleaned = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > max ? `${cleaned.slice(0, max).trim()}…` : cleaned
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQuery } = await searchParams
  const query = cleanQuery(rawQuery)
  const pattern = `%${query}%`

  const [communityResults, postResults] = query
    ? await Promise.all([
        db
          .select({
            id: communities.id,
            slug: communities.slug,
            name: communities.name,
            track: communities.track,
            parentCommunityId: communities.parentCommunityId,
            institutionLogoUrl: communities.institutionLogoUrl,
          })
          .from(communities)
          .where(or(ilike(communities.name, pattern), ilike(communities.slug, pattern)))
          .limit(12),
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
            communitySlug: communities.slug,
            communityName: communities.name,
            authorUsername: users.username,
          })
          .from(posts)
          .leftJoin(communities, eq(posts.communityId, communities.id))
          .leftJoin(users, eq(posts.authorId, users.id))
          .where(and(
            isNull(posts.deletedAt),
            or(
              ilike(posts.title, pattern),
              ilike(posts.body, pattern),
              ilike(communities.name, pattern),
              ilike(communities.slug, pattern),
            ),
          ))
          .orderBy(desc(posts.createdAt))
          .limit(24),
      ])
    : [[], []]

  const communityById = new Map(communityResults.map(c => [c.id, c]))

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px 48px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#D7DADC', fontSize: '24px', margin: '0 0 6px', fontWeight: 600 }}>
          {query ? `Search results for “${query}”` : 'Search slip'}
        </h1>
        <p style={{ color: '#818384', fontSize: '14px', margin: 0 }}>
          Find rejection stories by company, role, stage, or community.
        </p>
      </div>

      {!query && (
        <div style={{ color: '#818384', padding: '24px 0', borderTop: '1px solid #1e1f20' }}>
          Type a company or topic in the search bar above.
        </div>
      )}

      {query && (
        <div style={{ display: 'grid', gap: '28px' }}>
          <section>
            <h2 style={{ color: '#818384', fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Communities
            </h2>
            {communityResults.length === 0 ? (
              <p style={{ color: '#818384', margin: 0 }}>No matching communities yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '2px', borderTop: '1px solid #1e1f20' }}>
                {communityResults.map(c => {
                  const parent = c.parentCommunityId ? communityById.get(c.parentCommunityId) : null
                  return (
                    <Link key={c.id} href={`/c/${c.slug}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e1f20', color: '#D7DADC', textDecoration: 'none' }}>
                      <CommunityAvatar slug={c.slug} name={c.name} size={28} institutionLogoUrl={c.institutionLogoUrl} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 500 }}>{parent ? `${parent.name} / ${c.name}` : c.name}</div>
                        <div style={{ fontSize: '12px', color: '#818384', overflowWrap: 'anywhere' }}>{c.slug}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <h2 style={{ color: '#818384', fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Stories
            </h2>
            {postResults.length === 0 ? (
              <p style={{ color: '#818384', margin: 0 }}>No matching stories yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '2px', borderTop: '1px solid #1e1f20' }}>
                {postResults.map(post => (
                  <Link key={post.id} href={`/p/${post.id}`} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid #1e1f20', color: '#D7DADC', textDecoration: 'none' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.35, marginBottom: '6px' }}>{post.title}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', color: '#818384', fontSize: '12px', marginBottom: '8px' }}>
                      {post.communitySlug && <span>{post.communitySlug}</span>}
                      <span>·</span>
                      <UserChip username={post.authorUsername ?? undefined} size={16} />
                      <span>·</span>
                      <span>{post.voteScore} points</span>
                    </div>
                    {excerpt(post.body) && <p style={{ color: '#B8BABC', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>{excerpt(post.body)}</p>}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
