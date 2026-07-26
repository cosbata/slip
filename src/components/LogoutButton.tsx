'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '6px 14px',
        border: '1px solid #343536',
        borderRadius: '20px',
        color: '#818384',
        fontSize: '14px',
        fontWeight: 400,
        background: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      Log Out
    </button>
  )
}
