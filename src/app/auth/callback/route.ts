import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '../../../../drizzle'
import { users } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const next = searchParams.get('next') || '/'
      const safeNext = next.startsWith('/') ? next : '/'
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [profile] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.supabaseAuthId, user.id))
        if (profile) {
          return NextResponse.redirect(`${origin}${safeNext}`)
        }
      }
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
