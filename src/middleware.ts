import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Keep public pages cacheable. Auth-gated writes are enforced by API routes,
  // and the submit UI is the only page that needs middleware redirect behavior.
  matcher: ['/submit/:path*'],
}
