export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { communities, communityMembers, users } from '../../../../drizzle/schema'
import { eq, inArray, asc } from 'drizzle-orm'
import { CommunityAvatar } from '@/components/CommunityAvatar'
import Link from 'next/link'

export default async function FollowingCommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseAuthId, user.id))
  if (!dbUser) redirect('/onboarding')

  const memberships = await db
    .select({ communityId: communityMembers.communityId })
    .from(communityMembers)
    .where(eq(communityMembers.userId, dbUser.id))

  let followed: { id: string; slug: string; name: string; institutionLogoUrl: string | null }[] = []
  if (memberships.length > 0) {
    followed = await db
      .select({ id: communities.id, slug: communities.slug, name: communities.name, institutionLogoUrl: communities.institutionLogoUrl })
      .from(communities)
      .where(inArray(communities.id, memberships.map(m => m.communityId)))
      .orderBy(asc(communities.name))
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#D7DADC', margin: '0 0 24px' }}>
        My Communities
      </h1>
      {followed.length === 0 ? (
        <p style={{ color: '#818384', fontSize: '14px' }}>
          You haven&apos;t joined any communities yet.{' '}
          <Link href="/communities" style={{ color: '#0079d3' }}>Browse communities →</Link>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {followed.map(c => (
            <Link key={c.id} href={`/c/${c.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', textDecoration: 'none', color: '#D7DADC', borderBottom: '1px solid #1e1f20' }}>
              <CommunityAvatar slug={c.slug} name={c.name} size={32} institutionLogoUrl={c.institutionLogoUrl} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: '#818384' }}>{c.slug}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
