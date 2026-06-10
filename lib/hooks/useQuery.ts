'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Tiny async-data hook — no external dependency.
 * Runs `fn` on mount and whenever `deps` change, exposing
 * { data, loading, error, refetch }. Safe against unmount races.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const mounted = useRef(true)

  // keep the latest fn without forcing it into the deps array
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fnRef.current()
      .then(result => {
        if (active && mounted.current) { setData(result); setLoading(false) }
      })
      .catch((e: unknown) => {
        if (active && mounted.current) {
          setError(e instanceof Error ? e.message : 'Failed to load data')
          setLoading(false)
        }
      })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const refetch = useCallback(() => setNonce(n => n + 1), [])

  return { data, loading, error, refetch }
}
