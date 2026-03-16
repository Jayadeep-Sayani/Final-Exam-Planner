'use client'

import { usePathname } from 'next/navigation'
import { GeometricBackground } from './GeometricBackground'
import { SubtleBackground } from './SubtleBackground'

export function BackgroundSwitch() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  return isDashboard ? <SubtleBackground /> : <GeometricBackground />
}
