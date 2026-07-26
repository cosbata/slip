'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Profile = { username: string } | null

type MeContextValue = {
  profile: Profile
  loaded: boolean
}

type MeResponse = {
  profile?: { username?: unknown } | null
} | null

const MeContext = createContext<MeContextValue>({ profile: null, loaded: false })

let mePromise: Promise<Profile> | null = null
let cachedProfile: Profile | undefined

function normalizeProfile(data: MeResponse): Profile {
  const username = data?.profile?.username
  return typeof username === 'string' && username.length > 0 ? { username } : null
}

function fetchMeOnce(): Promise<Profile> {
  if (cachedProfile !== undefined) return Promise.resolve(cachedProfile)

  if (!mePromise) {
    mePromise = fetch('/api/me', { cache: 'no-store' })
      .then(async (res): Promise<MeResponse> => (res.ok ? res.json() : null))
      .then((data): Profile => {
        const nextProfile = normalizeProfile(data)
        cachedProfile = nextProfile
        return nextProfile
      })
      .catch((): Profile => {
        cachedProfile = null
        return null
      })
  }

  return mePromise
}

export function MeProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(cachedProfile ?? null)
  const [loaded, setLoaded] = useState(cachedProfile !== undefined)

  useEffect(() => {
    let cancelled = false

    fetchMeOnce().then((nextProfile) => {
      if (cancelled) return
      setProfile(nextProfile)
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ profile, loaded }), [profile, loaded])
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>
}

export function useMe() {
  return useContext(MeContext)
}
