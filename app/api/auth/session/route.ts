import { NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase-admin'
import { ensureUserDoc } from '@/lib/users'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }
    const { uid, email } = await verifyIdToken(token)
    await ensureUserDoc(uid, email ?? '')
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('Session error:', err)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}
