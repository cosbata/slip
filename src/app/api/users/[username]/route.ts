import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../../drizzle'
import { users, posts, communities, comments } from '../../../../../drizzle/schema'
import { eq, and, ne, desc } from 'drizzle-orm'

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const [user] = await db.select().from(users).where(eq(users.username, username))
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Determine if the viewer is the profile owner
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let isOwnProfile = false
  if (authUser) {
    const [viewer] = await db.select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.supabaseAuthId, authUser.id))
    isOwnProfile = viewer?.username === username
  }

  const baseQuery = db.select({
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
    embedUrl: posts.embedUrl,
    embedType: posts.embedType,
    isAnonymous: posts.isAnonymous,
  })
  .from(posts)
  .leftJoin(communities, eq(posts.communityId, communities.id))

  const userPosts = isOwnProfile
    // Own profile: show all posts including anonymous ones
    ? await baseQuery
        .where(eq(posts.authorId, user.id))
        .orderBy(desc(posts.createdAt))
        .limit(30)
    // Other profile: hide anonymous posts entirely
    : await baseQuery
        .where(and(eq(posts.authorId, user.id), ne(posts.isAnonymous, true)))
        .orderBy(desc(posts.createdAt))
        .limit(30)

  const userComments = await db.select({
    id: comments.id,
    body: comments.body,
    voteScore: comments.voteScore,
    createdAt: comments.createdAt,
    postId: comments.postId,
  })
  .from(comments)
  .where(eq(comments.authorId, user.id))
  .orderBy(desc(comments.createdAt))
  .limit(30)

  return NextResponse.json({ user, posts: userPosts, comments: userComments, isOwnProfile })
}
