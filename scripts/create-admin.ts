/**
 * 어드민 계정 생성 스크립트
 * 실행: npx tsx scripts/create-admin.ts
 */
import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../drizzle/schema'

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 필요합니다.`)
  return value
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const DATABASE_URL = requireEnv('DATABASE_URL')
const ADMIN_EMAIL = requireEnv('FOUNDER_EMAIL')
const ADMIN_PASSWORD = requireEnv('FOUNDER_PASSWORD')
const ADMIN_USERNAME = 'admin'

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`\n계정 생성 중: ${ADMIN_EMAIL}`)

  // 1. Supabase auth 유저 생성 (이미 있으면 ID 재사용)
  const { data: existing } = await supabase.auth.admin.listUsers()
  const existingUser = existing?.users?.find(u => u.email === ADMIN_EMAIL)

  let authUserId: string

  if (existingUser) {
    console.log(`  ✓ Auth 유저 이미 존재 (${existingUser.id})`)
    authUserId = existingUser.id
    // 비밀번호 업데이트
    await supabase.auth.admin.updateUserById(authUserId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    console.log(`  ✓ 비밀번호 업데이트 완료`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (error) {
      console.error('  ✗ Auth 유저 생성 실패:', error.message)
      process.exit(1)
    }
    authUserId = data.user.id
    console.log(`  ✓ Auth 유저 생성 완료 (${authUserId})`)
  }

  // 2. DB users 테이블에 프로필 생성 (이미 있으면 스킵)
  const sql = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(sql)

  try {
    await db.insert(users).values({
      supabaseAuthId: authUserId,
      username: ADMIN_USERNAME,
      karma: 0,
    }).onConflictDoNothing()
    console.log(`  ✓ DB 프로필 생성 완료 (username: ${ADMIN_USERNAME})`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('  ✗ DB 프로필 생성 실패:', msg)
    process.exit(1)
  } finally {
    await sql.end()
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  계정 생성 완료!

  이메일:    ${ADMIN_EMAIL}
  비밀번호:  ${ADMIN_PASSWORD}
  유저명:    ${ADMIN_USERNAME}

  로그인: http://localhost:3004/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main()
