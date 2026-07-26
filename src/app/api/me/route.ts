import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { users } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ profile: null })

  const [profile] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.supabaseAuthId, user.id))

  return NextResponse.json({ profile: profile ?? null })
}
