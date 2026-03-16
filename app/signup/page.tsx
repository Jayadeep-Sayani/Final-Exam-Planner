'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'

export default function SignupPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { getFirebaseAuth } = await import('@/lib/firebase-client')
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const auth = getFirebaseAuth()
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const token = await userCred.user.getIdToken()
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Session failed')
        return
      }
      showToast('Account created successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'code' in err
        ? (err as { code: string }).code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : (err as { code: string }).code === 'auth/invalid-email'
            ? 'Invalid email address'
            : (err as { code: string }).code === 'auth/weak-password'
              ? 'Password is too weak'
              : 'Sign up failed'
        : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header rightLink={{ href: '/login', label: 'Sign in' }} />

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 40,
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            marginBottom: 20,
            fontSize: 14,
            color: '#444444',
            textDecoration: 'none',
            fontWeight: 500,
          }}
          className="link-underline"
        >
          ← Back to home
        </Link>
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#ffffff',
            border: '2px solid #111111',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #111111',
              padding: '24px 24px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: '#FF6A00',
                flexShrink: 0,
              }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                margin: 0,
                color: '#111111',
              }}
            >
              Create account
            </h2>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-logo), sans-serif',
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  color: '#111111',
                  margin: '0 0 8px',
                }}
              >
                EXAMIO
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: '#666666',
                  margin: 0,
                  maxWidth: 320,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Your final exam study planner.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {error && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: '#111111',
                    padding: 12,
                    border: '2px solid #111111',
                    background: '#f4f4f4',
                  }}
                >
                  {error}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="email"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="confirm"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: 8 }}
                disabled={loading}
              >
                {loading ? 'Signing up…' : 'Sign up'}
              </button>
            </form>

            <p style={{ fontSize: 14, color: '#444444', margin: 0, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" className="link-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
