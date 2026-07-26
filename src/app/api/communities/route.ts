import { NextResponse } from 'next/server'
import { db } from '../../../../drizzle'
import { communities } from '../../../../drizzle/schema'

export const revalidate = 3600

type CommunityRow = {
  id: string
  slug: string
  name: string
  track: 'COMPANIES' | 'INVESTORS'
  parentCommunityId: string | null
  institutionLogoUrl: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const track = searchParams.get('track')
  const parentSlug = searchParams.get('parent')

  const results: CommunityRow[] = await db
    .select({
      id: communities.id,
      slug: communities.slug,
      name: communities.name,
      track: communities.track,
      parentCommunityId: communities.parentCommunityId,
      institutionLogoUrl: communities.institutionLogoUrl,
    })
    .from(communities)

  const parent = parentSlug === null ? null : results.find(p => p.slug === parentSlug)
  const filtered = results.filter(c => {
    if (track && c.track !== track) return false
    if (parentSlug !== null) return parent ? c.parentCommunityId === parent.id : false
    return true
  })

  return NextResponse.json(filtered, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
