'use client'

import { useCallback, useRef, useState } from 'react'

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' }

/**
 * Shared scenario-switching state machine (Dashboard/Anomalies/Telemetry all
 * fetch a new /api/telemetry read on scenario change). Ignores a load() call
 * while one is already in flight, so a slower response can never land after
 * a faster, newer one and clobber the visible state — callers should also
 * disable their trigger controls via `isLoading` for the same reason.
 */
export function useScenarioFetch<T, Args extends unknown[]>(
  initialData: T,
  fetcher: (...args: Args) => Promise<T>,
) {
  const [data, setData] = useState<T>(initialData)
  const [state, setState] = useState<Status>({ status: 'idle' })
  const loadingRef = useRef(false)

  const load = useCallback(
    async (...args: Args) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setState({ status: 'loading' })
      try {
        const next = await fetcher(...args)
        setData(next)
        setState({ status: 'idle' })
      } catch {
        setState({ status: 'error' })
      } finally {
        loadingRef.current = false
      }
    },
    [fetcher],
  )

  return { data, state, load, isLoading: state.status === 'loading' } as const
}
