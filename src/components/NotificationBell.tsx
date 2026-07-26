'use client'
import { useEffect, useState } from 'react'

export function NotificationBell() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => setCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {})
  }, [])

  if (count === 0) return null

  return (
    <a href="/notifications" className="relative text-sm">
      🔔 <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{count}</span>
    </a>
  )
}
