'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    window.navigator.serviceWorker
      .register('/sw.js')
      .then(() => {})
      .catch(() => {})
  }, [])
  return null
}
