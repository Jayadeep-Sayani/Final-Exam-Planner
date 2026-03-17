import { cookies } from 'next/headers'
import { verifyIdToken } from '@/lib/firebase-admin'

export const COOKIE_NAME = 'locked_session'

export type AuthPayload = {
  userId: string
  email: string
}

export async function getCurrentUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { uid, email } = await verifyIdToken(token)
    return { userId: uid, email: email ?? '' }
  } catch {
    return null
  }
}
