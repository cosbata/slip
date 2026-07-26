'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMe } from '@/components/MeProvider'

interface Props {
  postId: string
  isLoggedIn: boolean
}

export function CreateComment({ postId, isLoggedIn }: Props) {
  const { profile } = useMe()
  const canComment = isLoggedIn || !!profile
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!canComment) {
    return (
      <div style={{
        padding: '16px', backgroundColor: '#1A1A1B',
        border: '1px solid #343536', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '14px', color: '#818384' }}>
          Log in or sign up to leave a comment
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/login" style={{
            padding: '6px 16px', border: '1px solid #D7DADC',
            borderRadius: '20px', color: '#D7DADC', fontSize: '13px',
            textDecoration: 'none',
          }}>Log In</a>
          <a href="/login" style={{
            padding: '6px 16px', backgroundColor: '#FFFFFF',
            borderRadius: '20px', color: '#0D0D0D', fontSize: '13px',
            textDecoration: 'none',
          }}>Sign Up</a>
        </div>
      </div>
    )
  }

  async function submit() {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text }),
      })
      if (res.status === 401) { window.location.href = '/login'; return }
      if (res.ok) { setText(''); router.refresh() }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What are your thoughts?"
        rows={3}
        style={{
          width: '100%', padding: '12px 14px',
          backgroundColor: '#272729', border: '1px solid #343536',
          borderRadius: '8px', color: '#D7DADC', fontSize: '14px',
          resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          boxSizing: 'border-box', lineHeight: 1.5,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#818384' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          style={{
            padding: '7px 20px',
            backgroundColor: text.trim() ? '#FFFFFF' : '#343536',
            border: 'none', borderRadius: '20px',
            color: text.trim() ? '#0D0D0D' : '#818384',
            fontSize: '13px', fontWeight: 500,
            cursor: text.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </div>
  )
}
