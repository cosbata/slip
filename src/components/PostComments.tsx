'use client'

import { useEffect, useState } from 'react'
import { CreateComment } from '@/components/CreateComment'
import { ReportButton } from '@/components/ReportButton'
import { UserChip } from '@/components/UserChip'

type CommentRow = {
  id: string
  body: string
  voteScore: number
  authorUsername: string | null
}

export function PostComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : { comments: [] })
      .then((data) => {
        if (!cancelled) setComments(Array.isArray(data.comments) ? data.comments : [])
      })
      .catch(() => {
        if (!cancelled) setComments([])
      })
    return () => { cancelled = true }
  }, [postId])

  const count = comments?.length ?? 0

  return (
    <section className="post-comments" style={{ backgroundColor: 'transparent', border: 'none', borderRadius: '0', padding: '20px 24px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#D7DADC', margin: '0 0 16px 0' }}>
        {comments === null ? 'Comments' : `${count} ${count === 1 ? 'Comment' : 'Comments'}`}
      </h2>
      <CreateComment postId={postId} isLoggedIn={false} />
      {comments === null ? (
        <p style={{ fontSize: '14px', color: '#818384', textAlign: 'center', padding: '20px 0' }}>
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#818384', textAlign: 'center', padding: '20px 0' }}>
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ borderLeft: '2px solid #2d2d2d', paddingLeft: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
                <span style={{ color: '#D7DADC', fontWeight: 500 }}><UserChip username={comment.authorUsername} size={16} /></span>
                <span>·</span>
                <span>{comment.voteScore} points</span>
                <span style={{ marginLeft: 'auto' }}><ReportButton targetType="COMMENT" targetId={comment.id} /></span>
              </div>
              <p style={{ fontSize: '14px', color: '#D7DADC', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
