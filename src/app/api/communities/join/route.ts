import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../../drizzle'
import { communityMembers, users } from '../../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseAuthId, user.id))
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { communityId } = await req.json()
  if (!communityId) return NextResponse.json({ error: 'communityId required' }, { status: 400 })

  await db.insert(communityMembers).values({ userId: dbUser.id, communityId }).onConflictDoNothing()

  return NextResponse.json({ joined: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.supabaseAuthId, user.id))
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { communityId } = await req.json()
  if (!communityId) return NextResponse.json({ error: 'communityId required' }, { status: 400 })

  await db.delete(communityMembers).where(
    and(eq(communityMembers.userId, dbUser.id), eq(communityMembers.communityId, communityId))
  )

  return NextResponse.json({ joined: false })
}
