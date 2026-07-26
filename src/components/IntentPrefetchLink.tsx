'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode
  }

/**
 * Avoid viewport-wide prefetching on feeds, but still make intentional
 * navigations feel fast. The route is prefetched only after a concrete signal:
 * hover/focus on desktop or touch/pointer-down on mobile.
 */
export function IntentPrefetchLink({ href, children, onMouseEnter, onFocus, onTouchStart, onPointerDown, ...props }: Props) {
  const router = useRouter()
  const prefetchedRef = useRef(false)

  function prefetch() {
    if (prefetchedRef.current || typeof href !== 'string') return
    prefetchedRef.current = true
    router.prefetch(href)
  }

  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onMouseEnter={(event) => {
        prefetch()
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        prefetch()
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        prefetch()
        onTouchStart?.(event)
      }}
      onPointerDown={(event) => {
        prefetch()
        onPointerDown?.(event)
      }}
    >
      {children}
    </Link>
  )
}
