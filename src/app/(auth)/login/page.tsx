'use client'
import { createClient } from '@/lib/supabase/client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Mode = 'password' | 'magic'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  backgroundColor: '#111', border: '1px solid #343536',
  borderRadius: '6px', color: '#D7DADC', fontSize: '14px',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('password')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const supabase = createClient()

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }

  async function handlePasswordLogin() {
    if (!email.trim() || !password.trim()) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email.trim()) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', paddingTop: '100px',
    }}>
      <div style={{ width: '100%', maxWidth: '340px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px', height: '44px', backgroundColor: '#FFFFFF',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 12px',
            color: '#0D0D0D', fontWeight: 600, fontSize: '20px',
          }}>s</div>
          <h1 style={{ fontSize: '20px', fontWeight: 400, color: '#D7DADC', margin: 0 }}>
            Welcome to slip
          </h1>
          <p style={{ fontSize: '13px', color: '#555', margin: '6px 0 0' }}>
            Share your rejection story.
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleLogin} style={{
          width: '100%', padding: '10px 16px',
          backgroundColor: '#FFFFFF', border: 'none',
          borderRadius: '20px', color: '#0D0D0D',
          fontSize: '14px', fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px', marginBottom: '16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#222' }} />
          <span style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#222' }} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '14px', border: '1px solid #222', borderRadius: '6px', overflow: 'hidden' }}>
          {(['password', 'magic'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSent(false) }} style={{
              flex: 1, padding: '7px 0', fontSize: '12px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
              backgroundColor: mode === m ? '#1e1f20' : 'transparent',
              color: mode === m ? '#D7DADC' : '#555',
            }}>
              {m === 'password' ? 'Password' : 'Email link'}
            </button>
          ))}
        </div>

        {/* Email field (both modes) */}
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && mode === 'password' && handlePasswordLogin()}
          style={{ ...inputStyle, marginBottom: '8px' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#555' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
        />

        {/* Password field */}
        {mode === 'password' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
            style={{ ...inputStyle, marginBottom: '10px' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#555' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
          />
        )}

        {/* Error */}
        {error && (
          <p style={{ fontSize: '12px', color: '#e57373', margin: '0 0 10px' }}>{error}</p>
        )}

        {/* CTA */}
        {mode === 'password' ? (
          <button
            onClick={handlePasswordLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '10px 16px',
              backgroundColor: '#FFFFFF', border: 'none',
              borderRadius: '20px', color: '#0D0D0D',
              fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        ) : sent ? (
          <div style={{
            padding: '12px', backgroundColor: '#111',
            border: '1px solid #222', borderRadius: '6px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: '#D7DADC', margin: 0 }}>
              Check your email for the login link.
            </p>
          </div>
        ) : (
          <button
            onClick={handleMagicLink}
            disabled={loading}
            style={{
              width: '100%', padding: '10px 16px',
              backgroundColor: 'transparent', border: '1px solid #343536',
              borderRadius: '20px', color: '#D7DADC',
              fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Sending…' : 'Send sign-in link'}
          </button>
        )}

        <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '18px', lineHeight: 1.6 }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: '#555', textDecoration: 'underline' }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#555', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}


export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
