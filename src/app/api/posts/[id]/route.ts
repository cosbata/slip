import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../../drizzle'
import { posts, users } from '../../../../../drizzle/schema'
import { eq, and, isNull } from 'drizzle-orm'

async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  return profile ?? null
}

// DELETE /api/posts/[id] — soft delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [post] = await db.select({ authorId: posts.authorId })
    .from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt)))
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.authorId !== profile.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, id))
  return NextResponse.json({ ok: true })
}

// PATCH /api/posts/[id] — update title + body
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [post] = await db.select({ authorId: posts.authorId })
    .from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt)))
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.authorId !== profile.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, content } = body
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  await db.update(posts).set({
    title: title.trim(),
    body: content ?? null,
    editedAt: new Date(),
  }).where(eq(posts.id, id))

  return NextResponse.json({ ok: true })
}
