import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../../drizzle'
import { votes, comments, users } from '../../../../../drizzle/schema'
import { and, eq, sql } from 'drizzle-orm'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { commentId, value } = await request.json()
  if (![1, -1].includes(value)) return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })

  await db.transaction(async (tx) => {
    const existing = await tx.select().from(votes)
      .where(and(
        eq(votes.userId, profile.id),
        eq(votes.targetType, 'COMMENT'),
        eq(votes.targetId, commentId)
      ))
    const oldValue = existing[0]?.value ?? 0

    if (existing[0] && existing[0].value === value) {
      // Toggle-off: same direction clicked again → remove vote
      await tx.delete(votes).where(and(
        eq(votes.userId, profile.id),
        eq(votes.targetType, 'COMMENT'),
        eq(votes.targetId, commentId)
      ))
      await tx.update(comments)
        .set({ voteScore: sql`${comments.voteScore} - ${oldValue}` })
        .where(eq(comments.id, commentId))
    } else {
      // New vote or direction change
      const delta = value - oldValue
      await tx.insert(votes)
        .values({ userId: profile.id, targetType: 'COMMENT', targetId: commentId, value })
        .onConflictDoUpdate({
          target: [votes.userId, votes.targetType, votes.targetId],
          set: { value },
        })
      await tx.update(comments)
        .set({ voteScore: sql`${comments.voteScore} + ${delta}` })
        .where(eq(comments.id, commentId))
    }
  })

  const [updated] = await db.select({ voteScore: comments.voteScore }).from(comments).where(eq(comments.id, commentId))
  return NextResponse.json({ voteScore: updated?.voteScore ?? 0 })
}
