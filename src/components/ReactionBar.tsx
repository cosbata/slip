'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REACTIONS: { type: string; label: string }[] = [
  { type: 'BEEN_THERE', label: 'Been there' },
  { type: 'I_FEEL_THIS', label: 'I feel this' },
  { type: 'NOT_ALONE', label: "You're not alone" },
  { type: 'SAME_HERE', label: 'Same here' },
]

interface ReactionBarProps {
  postId: string
  initialCounts?: Record<string, number>
  initialUserReactions?: string[]
  initialTotalCount?: number
}

export function ReactionBar({ postId, initialCounts = {}, initialUserReactions = [], initialTotalCount = 0 }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts)
  const [userReactions, setUserReactions] = useState<string[]>(initialUserReactions)
  const router = useRouter()

  const countedReactions = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const totalReactions = Math.max(initialTotalCount, countedReactions)

  async function handleReaction(type: string) {
    const isActive = userReactions.includes(type)

    // Optimistic update
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) + (isActive ? -1 : 1)),
    }))
    setUserReactions(prev =>
      isActive ? prev.filter(r => r !== type) : [...prev, type]
    )

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type }),
      })
      if (res.ok) {
        const data = await res.json()
        setCounts(data.reactionCounts)
        setUserReactions(data.userReactions)
        router.refresh()
      } else if (res.status === 401) {
        // Revert optimistic update on auth failure
        setCounts(prev => ({
          ...prev,
          [type]: Math.max(0, (prev[type] ?? 0) + (isActive ? 1 : -1)),
        }))
        setUserReactions(prev =>
          isActive ? [...prev, type] : prev.filter(r => r !== type)
        )
      }
    } catch {
      // Revert on network error
      setCounts(prev => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) + (isActive ? 1 : -1)),
      }))
      setUserReactions(prev =>
        isActive ? [...prev, type] : prev.filter(r => r !== type)
      )
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      {totalReactions >= 10 && (
        <div style={{ fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
          {totalReactions} people felt this
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {REACTIONS.map(({ type, label }) => {
          const active = userReactions.includes(type)
          const count = counts[type] ?? 0
          return (
            <button
              key={type}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReaction(type) }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                border: `1px solid ${active ? '#D7DADC' : '#343536'}`,
                backgroundColor: active ? '#272729' : 'transparent',
                color: active ? '#D7DADC' : '#818384',
                fontFamily: 'inherit',
                transition: 'border-color 0.1s, background-color 0.1s, color 0.1s',
              }}
              aria-pressed={active}
              aria-label={label}
            >
              {label}
              {count > 0 && (
                <span style={{ fontWeight: 500 }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
