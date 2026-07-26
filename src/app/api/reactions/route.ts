import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { reactions, posts, users } from '../../../../drizzle/schema'
import { and, eq, sql } from 'drizzle-orm'

const VALID_TYPES = ['BEEN_THERE', 'I_FEEL_THIS', 'NOT_ALONE', 'SAME_HERE'] as const
type ReactionType = typeof VALID_TYPES[number]

function emptyReactionCounts() {
  return { BEEN_THERE: 0, I_FEEL_THIS: 0, NOT_ALONE: 0, SAME_HERE: 0 }
}

async function getReactionData(postId: string, userId?: string) {
  const counts = await db
    .select({ type: reactions.type, count: sql<number>`count(*)::int` })
    .from(reactions)
    .where(eq(reactions.postId, postId))
    .groupBy(reactions.type)

  const reactionCounts = { ...emptyReactionCounts() }
  for (const row of counts) {
    reactionCounts[row.type as ReactionType] = row.count
  }

  let userReactions: string[] = []
  if (userId) {
    const userRows = await db
      .select({ type: reactions.type })
      .from(reactions)
      .where(and(eq(reactions.postId, postId), eq(reactions.userId, userId)))
    userReactions = userRows.map(r => r.type)
  }

  return { reactionCounts, userReactions }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userId: string | undefined
  if (user) {
    const [profile] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseAuthId, user.id))
    userId = profile?.id
  }

  const data = await getReactionData(postId, userId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { postId, type } = await request.json()
  if (!postId || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const existing = await db
    .select()
    .from(reactions)
    .where(and(
      eq(reactions.userId, profile.id),
      eq(reactions.postId, postId),
      eq(reactions.type, type)
    ))

  if (existing[0]) {
    // Toggle off: delete reaction and decrement count
    await db.delete(reactions).where(and(
      eq(reactions.userId, profile.id),
      eq(reactions.postId, postId),
      eq(reactions.type, type)
    ))
    await db.update(posts)
      .set({ reactionCount: sql`${posts.reactionCount} - 1` })
      .where(eq(posts.id, postId))
  } else {
    // Toggle on: insert reaction and increment count
    await db.insert(reactions).values({
      userId: profile.id,
      postId,
      type,
    })
    await db.update(posts)
      .set({ reactionCount: sql`${posts.reactionCount} + 1` })
      .where(eq(posts.id, postId))
  }

  const data = await getReactionData(postId, profile.id)
  return NextResponse.json(data)
}
