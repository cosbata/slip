import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../drizzle'
import { communities, communityRequests } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, companyName, websiteUrl, parentCommunitySlug, subCommunityName } = body

  if (type === 'COMPANY') {
    // Parse domain
    const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const slug = `companies/${companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`

    // Check duplicate
    const existing = await db.select().from(communities).where(eq(communities.slug, slug))
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: 'Community already exists.' }, { status: 400 })
    }

    // Download logo via Google Social Favicon
    let logoSaved = false
    try {
      const logoRes = await fetch(
        `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`
      )
      if (logoRes.ok) {
        const buf = Buffer.from(await logoRes.arrayBuffer())
        const logosDir = join(process.cwd(), 'public', 'logos')
        if (!existsSync(logosDir)) mkdirSync(logosDir, { recursive: true })
        const slugName = slug.split('/').pop()!
        writeFileSync(join(logosDir, `${slugName}.png`), buf)
        logoSaved = true
      }
    } catch {}

    const logoPath = logoSaved ? `/logos/${slug.split('/').pop()}.png` : null

    // Create community
    await db.insert(communities).values({
      slug,
      name: companyName,
      track: 'COMPANIES',
      institutionLogoUrl: logoPath,
      sidebarRules: `1. No real names of individuals (interviewers, recruiters, partners)\n2. Share experiences, not rumors\n3. Be respectful — rejection is hard for everyone\n4. Mark sensitive content appropriately`,
    })

    // Save request record
    await db.insert(communityRequests).values({
      type: 'COMPANY',
      companyName,
      websiteUrl,
      status: 'APPROVED',
      resultCommunitySlug: slug,
    })

    return NextResponse.json({ ok: true, communitySlug: slug })
  }

  if (type === 'SUBCOMMUNITY') {
    if (!parentCommunitySlug || !subCommunityName) {
      return NextResponse.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    const subSlug = `${parentCommunitySlug}/${subCommunityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`

    // Check duplicate
    const existing = await db.select().from(communities).where(eq(communities.slug, subSlug))
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: 'Community already exists.' }, { status: 400 })
    }

    // Find parent
    const [parent] = await db.select().from(communities).where(eq(communities.slug, parentCommunitySlug))
    if (!parent) {
      return NextResponse.json({ ok: false, error: 'Parent community not found.' }, { status: 404 })
    }

    await db.insert(communities).values({
      slug: subSlug,
      name: subCommunityName,
      track: parent.track,
      parentCommunityId: parent.id,
      institutionLogoUrl: parent.institutionLogoUrl,
    })

    await db.insert(communityRequests).values({
      type: 'SUBCOMMUNITY',
      companyName: parent.name,
      websiteUrl: '',
      parentCommunitySlug,
      subCommunityName,
      status: 'APPROVED',
      resultCommunitySlug: subSlug,
    })

    return NextResponse.json({ ok: true, communitySlug: subSlug })
  }

  return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 })
}

export async function GET() {
  const requests = await db
    .select()
    .from(communityRequests)
    .orderBy(communityRequests.createdAt)
  return NextResponse.json(requests.reverse())
}
