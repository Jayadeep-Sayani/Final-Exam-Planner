'use client'

import { useEffect, useRef } from 'react'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { onAuthStateChanged } from 'firebase/auth'

const REFRESH_INTERVAL_MS = 50 * 60 * 1000 // 50 minutes (Firebase ID tokens expire in 1 hour)

async function refreshSession(): Promise<void> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) return
  try {
    const token = await user.getIdToken(true)
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    })
    if (!res.ok) {
      console.warn('Session refresh failed:', res.status)
    }
  } catch (err) {
    console.warn('Session refresh error:', err)
  }
}

export function SessionRefresh() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()

    const scheduleRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      refreshSession()
      intervalRef.current = setInterval(refreshSession, REFRESH_INTERVAL_MS)
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        scheduleRefresh()
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    })

    const onFocus = () => {
      if (auth.currentUser) refreshSession()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      unsubscribe()
      window.removeEventListener('focus', onFocus)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return null
}
