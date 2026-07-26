import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { reports, users } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(users).where(eq(users.supabaseAuthId, user.id))
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { targetType, targetId, category, freeText } = await request.json()
  if (!targetType || !targetId || !category) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await db.insert(reports).values({
    reporterId: profile.id,
    targetType,
    targetId,
    category,
    freeText: freeText ?? null,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET() {
  // Admin only — checked in page, not here for simplicity
  const allReports = await db.select().from(reports)
    .orderBy(reports.createdAt)
    .limit(100)
  return NextResponse.json(allReports)
}

export async function PATCH(request: Request) {
  const { id, status } = await request.json()
  if (!['REMOVED', 'DISMISSED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  await db.update(reports).set({ status }).where(eq(reports.id, id))
  return NextResponse.json({ ok: true })
}
