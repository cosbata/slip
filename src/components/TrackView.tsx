'use client'
import { useEffect } from 'react'

const KEY = 'fail-it-recent-posts'
const MAX = 5

export interface RecentPost {
  id: string
  title: string
  communitySlug: string
  communityName: string | null
}

export function TrackView({ post }: { post: RecentPost }) {
  useEffect(() => {
    try {
      const stored: RecentPost[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      const deduped = stored.filter(p => p.id !== post.id)
      localStorage.setItem(KEY, JSON.stringify([post, ...deduped].slice(0, MAX)))
    } catch {}
  }, [post.id])

  return null
}
