'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const BodyEditor = dynamic(
  () => import('@/components/BodyEditor').then(m => ({ default: m.BodyEditor })),
  { ssr: false, loading: () => <div style={{ minHeight: '200px', border: '1px solid #343536', borderRadius: '4px', padding: '14px' }} /> }
)

export function EditPostForm({ post }: { post: { id: string; title: string; body: string | null } }) {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.body ?? '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', backgroundColor: 'transparent',
    border: '1px solid #343536', borderRadius: '4px', color: '#D7DADC',
    fontSize: '14px', padding: '12px 16px', outline: 'none', fontFamily: 'inherit',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    if (res.ok) { router.refresh(); router.push(`/p/${post.id}`) }
    else { alert('Failed to save'); setLoading(false) }
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '20px 24px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#D7DADC', margin: '0 0 20px' }}>Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            required maxLength={300} placeholder="Title*"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
          />
        </div>
        <BodyEditor onChange={setContent} placeholder="Body text (optional)" initialContent={post.body ?? ''} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid #343536' }}>
          <button type="button" onClick={() => router.back()}
            style={{ padding: '8px 18px', backgroundColor: 'transparent', border: '1px solid #343536', borderRadius: '20px', color: '#818384', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !title.trim()}
            style={{ padding: '8px 20px', backgroundColor: title.trim() ? '#D7DADC' : '#343536', border: 'none', borderRadius: '20px', color: title.trim() ? '#0D0D0D' : '#818384', fontSize: '14px', fontWeight: 500, cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
