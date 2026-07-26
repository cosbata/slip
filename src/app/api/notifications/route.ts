import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { notifications, users } from '../../../../drizzle/schema'
import { and, eq, isNull } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json([])

  const unread = await db.select().from(notifications)
    .where(and(eq(notifications.userId, profile.id), isNull(notifications.readAt)))
    .limit(20)

  return NextResponse.json(unread)
}

export async function PATCH(request: Request) {
  const { id } = await request.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, id))

  return NextResponse.json({ ok: true })
}
