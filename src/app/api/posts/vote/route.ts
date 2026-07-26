import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../../drizzle'
import { votes, posts, users } from '../../../../../drizzle/schema'
import { and, eq, sql } from 'drizzle-orm'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { postId, value } = await request.json() // value: 1 or -1
  if (![1, -1].includes(value)) return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })

  await db.transaction(async (tx) => {
    const existing = await tx.select().from(votes)
      .where(and(
        eq(votes.userId, profile.id),
        eq(votes.targetType, 'POST'),
        eq(votes.targetId, postId)
      ))
    const oldValue = existing[0]?.value ?? 0

    // Get post author for karma update
    const [post] = await tx.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, postId))
    const authorId = post?.authorId

    if (existing[0] && existing[0].value === value) {
      // Toggle-off: same direction clicked again → remove vote
      await tx.delete(votes).where(and(
        eq(votes.userId, profile.id),
        eq(votes.targetType, 'POST'),
        eq(votes.targetId, postId)
      ))
      await tx.update(posts)
        .set({ voteScore: sql`${posts.voteScore} - ${oldValue}` })
        .where(eq(posts.id, postId))
      // Remove karma from author
      if (authorId && authorId !== profile.id) {
        await tx.update(users).set({ karma: sql`${users.karma} - ${oldValue}` }).where(eq(users.id, authorId))
      }
    } else {
      // New vote or direction change
      const delta = value - oldValue
      await tx.insert(votes)
        .values({ userId: profile.id, targetType: 'POST', targetId: postId, value })
        .onConflictDoUpdate({
          target: [votes.userId, votes.targetType, votes.targetId],
          set: { value },
        })
      await tx.update(posts)
        .set({ voteScore: sql`${posts.voteScore} + ${delta}` })
        .where(eq(posts.id, postId))
      // Update author karma
      if (authorId && authorId !== profile.id) {
        await tx.update(users).set({ karma: sql`${users.karma} + ${delta}` }).where(eq(users.id, authorId))
      }
    }
  })

  const [updated] = await db.select({ voteScore: posts.voteScore }).from(posts).where(eq(posts.id, postId))
  return NextResponse.json({ voteScore: updated?.voteScore ?? 0 })
}
