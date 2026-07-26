import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { comments, users } from '../../../../drizzle/schema'
import { and, asc, eq, isNull } from 'drizzle-orm'


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  const rows = await db.select({ comment: comments, author: users })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt))
    .limit(50)

  return NextResponse.json({
    comments: rows.map(({ comment, author }) => ({
      id: comment.id,
      body: comment.body,
      voteScore: comment.voteScore,
      authorUsername: author?.username ?? null,
    })),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { postId, text, replyToId } = await request.json()
  if (!postId || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const [comment] = await db.insert(comments).values({
    body: text,
    postId,
    authorId: profile.id,
    parentCommentId: replyToId ?? null,
  }).returning()

  return NextResponse.json(comment, { status: 201 })
}
