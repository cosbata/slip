import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { db } from '../../../drizzle'
import { communities } from '../../../drizzle/schema'
import { isNull } from 'drizzle-orm'
import { SubmitForm } from './SubmitForm'
import { createClient } from '@/lib/supabase/server'
import type { Community } from '@/components/CommunityPicker'

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/submit')

  const params = await searchParams
  const defaultCommunitySlug = params.community ?? ''

  const rows = await db
    .select({
      id: communities.id,
      slug: communities.slug,
      name: communities.name,
      track: communities.track,
      institutionLogoUrl: communities.institutionLogoUrl,
    })
    .from(communities)
    .orderBy(communities.name)

  const communityList: Community[] = rows.map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    track: r.track,
    institutionLogoUrl: r.institutionLogoUrl,
  }))

  return (
    <Suspense>
      <SubmitForm
        communities={communityList}
        defaultCommunitySlug={defaultCommunitySlug}
      />
    </Suspense>
  )
}
