import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { posts, users, communities, tags as tagsTable, postTags } from '../../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve current user's internal profile id (null if unauthenticated)
  let currentUserId: string | null = null
  if (user) {
    const [profile] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseAuthId, user.id))
    currentUserId = profile?.id ?? null
  }

  const rows = await db.select({
    id: posts.id,
    title: posts.title,
    body: posts.body,
    voteScore: posts.voteScore,
    createdAt: posts.createdAt,
    authorId: posts.authorId,
    isAnonymous: posts.isAnonymous,
    interviewStage: posts.interviewStage,
    fundingStage: posts.fundingStage,
    outcomeCategory: posts.outcomeCategory,
    embedUrl: posts.embedUrl,
    embedType: posts.embedType,
    reactionCount: posts.reactionCount,
    communitySlug: communities.slug,
    communityName: communities.name,
    authorUsername: users.username,
  })
  .from(posts)
  .leftJoin(communities, eq(posts.communityId, communities.id))
  .leftJoin(users, eq(posts.authorId, users.id))
  .orderBy(desc(posts.createdAt))
  .limit(200)

  const masked = rows.map(row => {
    if (row.isAnonymous) {
      if (currentUserId && currentUserId === row.authorId) {
        return { ...row, authorUsername: 'anonymous', isOwnAnonymousPost: true }
      }
      return { ...row, authorUsername: 'anonymous', authorId: null, isOwnAnonymousPost: false }
    }
    return { ...row, isOwnAnonymousPost: false }
  })

  return NextResponse.json(masked)
}

const MIN_TITLE_LENGTH = 10
const MIN_CONTENT_LENGTH = 80

function plainTextLength(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
}

function normalizeOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users)
    .where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json()
  const {
    title, content, communitySlug,
    // Companies track
    roleTitle, interviewStage, rejectionYear,
    // Investors track
    fundingStage, amountSoughtRange, industryVertical,
    // Outcome
    outcomeCategory, outcomeStory,
    // Embed
    embedUrl, embedType,
    // New fields
    isAnonymous,
    tags: tagSlugs,
  } = body

  const normalizedTitle = normalizeOptionalString(title)
  const normalizedContent = normalizeOptionalString(content)
  const normalizedEmbedUrl = normalizeOptionalString(embedUrl)

  if (normalizedTitle.length < MIN_TITLE_LENGTH) {
    return NextResponse.json({ error: `Title must be at least ${MIN_TITLE_LENGTH} characters.` }, { status: 400 })
  }

  if (plainTextLength(normalizedContent) < MIN_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Add at least ${MIN_CONTENT_LENGTH} characters of story context.` }, { status: 400 })
  }

  if (normalizedEmbedUrl) {
    try { new URL(normalizedEmbedUrl) }
    catch { return NextResponse.json({ error: 'Valid link URL required.' }, { status: 400 }) }
  }

  // communityId is now optional
  let communityId: string | null = null
  if (communitySlug) {
    const [community] = await db.select().from(communities)
      .where(eq(communities.slug, communitySlug))
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    communityId = community.id
  }

  const [post] = await db.insert(posts).values({
    title: normalizedTitle,
    body: normalizedContent || null,
    communityId,
    authorId: profile.id,
    roleTitle: roleTitle || null,
    interviewStage: interviewStage || null,
    rejectionYear: rejectionYear ? parseInt(rejectionYear) : null,
    fundingStage: fundingStage || null,
    amountSoughtRange: amountSoughtRange || null,
    industryVertical: industryVertical || null,
    outcomeCategory: outcomeCategory || null,
    outcomeStory: outcomeStory || null,
    embedUrl: normalizedEmbedUrl || null,
    embedType: normalizedEmbedUrl ? (embedType || 'link') : null,
    isAnonymous: isAnonymous === true,
  }).returning()

  // Handle tags: find-or-create each slug, then insert postTag rows
  if (Array.isArray(tagSlugs) && tagSlugs.length > 0) {
    for (const slug of tagSlugs as string[]) {
      if (!slug) continue
      const normalizedSlug = slug.toLowerCase().trim()
      const label = normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1)

      // Upsert the tag row
      const [tag] = await db.insert(tagsTable).values({
        slug: normalizedSlug,
        label,
      }).onConflictDoUpdate({
        target: tagsTable.slug,
        set: { label },
      }).returning()

      // Insert postTag (ignore conflict — idempotent)
      await db.insert(postTags).values({
        postId: post.id,
        tagId: tag.id,
      }).onConflictDoNothing()
    }
  }

  return NextResponse.json(post, { status: 201 })
}
