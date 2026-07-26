import { NextResponse } from 'next/server'
import { db } from '../../../../drizzle'
import { users } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const { username, supabaseAuthId } = await request.json()

  if (!username || !supabaseAuthId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check username taken
  const existing = await db.select().from(users)
    .where(eq(users.username, username))
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Username taken' }, { status: 409 })
  }

  const [user] = await db.insert(users).values({ username, supabaseAuthId }).returning()
  return NextResponse.json(user, { status: 201 })
}
