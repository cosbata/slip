'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.match(/^[a-zA-Z0-9_-]{3,20}$/)) {
      setError('Username must be 3-20 chars, letters/numbers/- only')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, supabaseAuthId: user.id }),
    })
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Username taken')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 p-6 border rounded-lg">
        <h1 className="text-2xl font-bold">Choose your username</h1>
        <p className="text-sm text-muted-foreground">
          This is how you appear on slip. Pseudonymous — no real name needed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="rejecteddev42"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Setting up...' : 'Get started'}
          </Button>
        </form>
      </div>
    </div>
  )
}
