import { db } from '../../../../../drizzle'
import { posts, users } from '../../../../../drizzle/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { EditPostForm } from './EditPostForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [post] = await db.select().from(posts)
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
  if (!post) notFound()

  // Only allow the author to edit
  const [profile] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile || post.authorId !== profile.id) notFound()

  return <EditPostForm post={{ id: post.id, title: post.title, body: post.body }} />
}
