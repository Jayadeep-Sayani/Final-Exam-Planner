'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Exams' },
  { href: '/dashboard/homework', label: 'Homework' },
  { href: '/dashboard/planner', label: 'AI Planner' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro' },
]

type ScheduleItem = { id: string; label: string; done: boolean }
type Schedule = { date: string; items: ScheduleItem[] }

const accent = '#FF6A00'
const accentLight = 'rgba(255, 106, 0, 0.35)'
const accentSoft = 'rgba(255, 106, 0, 0.12)'

function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 16)}px solid ${accentSoft}`,
        borderTopColor: accent,
        borderRadius: '50%',
        animation: 'planner-spin 0.8s linear infinite',
        flexShrink: 0,
      }}
      aria-hidden
    />
  )
}

function AITalkingIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="60" cy="60" r="52" stroke={accent} strokeWidth="2" fill="none" opacity="0.4" />
      <circle cx="60" cy="60" r="44" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="60" cy="60" r="36" stroke={accent} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 28 60 Q 44 48, 60 60 Q 76 72, 92 60" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M 32 60 Q 44 52, 60 60 Q 76 68, 88 60" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 36 60 Q 44 56, 60 60 Q 76 64, 84 60" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="60" cy="60" r="22" fill="#111111" />
      <circle cx="54" cy="54" r="3" fill={accent} />
      <circle cx="66" cy="54" r="3" fill={accent} />
      <circle cx="60" cy="64" r="2.5" fill="#ffffff" opacity="0.9" />
    </svg>
  )
}

export default function PlannerPage() {
  const { showToast } = useToast()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/planner/schedule', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { schedule: null }))
      .then((data) => {
        if (!cancelled && data.schedule) setSchedule(data.schedule)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/planner/generate', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok && data.schedule) {
        setSchedule(data.schedule)
        showToast('Successfully generated')
      } else {
        showToast(data.error || 'Failed to generate schedule')
      }
    } catch {
      showToast('Failed to generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  async function toggleDone(itemId: string, done: boolean) {
    setTogglingId(itemId)
    try {
      const res = await fetch('/api/planner/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, done }),
      })
      const data = await res.json()
      if (res.ok && data.schedule) {
        setSchedule(data.schedule)
      }
    } finally {
      setTogglingId(null)
    }
  }

  async function handleConfirmSignOut() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      showToast('Signed out successfully')
      setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <Header
        navItems={NAV_ITEMS}
        rightButton={{ label: 'Sign out', onClick: () => setShowLogoutModal(true) }}
      />

      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => !loggingOut && setShowLogoutModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #111111',
              padding: 32,
              maxWidth: 400,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', margin: '0 0 12px', color: '#111111' }}>
              Sign out?
            </h3>
            <p style={{ fontSize: 16, color: '#444444', margin: '0 0 24px' }}>Are you sure you want to sign out?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                style={{ padding: '12px 24px', border: '2px solid #111111', background: '#ffffff', color: '#111111', font: 'inherit', fontSize: 14, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: loggingOut ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>
              <button type="button" onClick={handleConfirmSignOut} disabled={loggingOut} className="btn-primary">
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          paddingBottom: 110,
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse 100% 80% at 50% 50%, ${accentLight} 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 45%, ${accentSoft} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,106,0,0.06) 0%, transparent 40%),
            #fafafa
          `,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '12%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: accentSoft,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: accentSoft,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '18%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: `2px solid ${accent}`,
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '30%',
            left: '15%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `2px solid ${accent}`,
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#444444', fontSize: 14 }}>Loading…</p>
          ) : schedule ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#111111', margin: 0 }}>
                  Today’s plan
                </h2>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 20px',
                    border: '2px solid #111111',
                    background: '#ffffff',
                    color: '#111111',
                    font: 'inherit',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: generating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {generating && <LoadingSpinner size={20} />}
                  {generating ? 'Generating…' : 'Regenerate'}
                </button>
              </div>
              {generating && (
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#444444' }}>
                  Building your to-do list…
                </p>
              )}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, opacity: generating ? 0.6 : 1 }}>
                {schedule.items.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 10,
                      padding: '14px 16px',
                      border: '2px solid #111111',
                      background: '#ffffff',
                    }}
                  >
                    {item.done ? (
                      <span style={{ color: '#111111', fontSize: 18 }} aria-hidden>✓</span>
                    ) : (
                      <span style={{ width: 8, height: 8, background: accent, flexShrink: 0 }} aria-hidden />
                    )}
                    <span
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#111111',
                        textDecoration: item.done ? 'line-through' : 'none',
                        opacity: item.done ? 0.7 : 1,
                      }}
                    >
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDone(item.id, !item.done)}
                      disabled={togglingId === item.id}
                      style={{
                        padding: '6px 14px',
                        border: '2px solid #111111',
                        background: item.done ? '#f2f2f2' : accent,
                        color: item.done ? '#444444' : '#ffffff',
                        font: 'inherit',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: togglingId === item.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {item.done ? 'Undo' : 'Done'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div
              style={{
                width: '100%',
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
                border: '3px solid #111111',
                background: '#ffffff',
                boxShadow: '0 0 0 0 rgba(255, 106, 0, 0.4)',
              }}
            >
              {generating ? (
                <>
                  <LoadingSpinner />
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#111111',
                      margin: 0,
                    }}
                  >
                    Generating…
                  </h1>
                  <p style={{ fontSize: 14, color: '#444444', margin: 0 }}>
                    Building your to-do list from exams & homework
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 24,
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget.closest('div')
                    if (card) {
                      card.style.transform = 'scale(1.02)'
                      card.style.boxShadow = '0 8px 32px rgba(255, 106, 0, 0.25), 0 0 0 3px rgba(255, 106, 0, 0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget.closest('div')
                    if (card) {
                      card.style.transform = 'scale(1)'
                      card.style.boxShadow = '0 0 0 0 rgba(255, 106, 0, 0.4)'
                    }
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <AITalkingIcon />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h1
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#111111',
                        margin: '0 0 8px',
                      }}
                    >
                      Generate schedule
                    </h1>
                    <p style={{ fontSize: 14, color: '#444444', margin: 0, maxWidth: 320 }}>
                      AI-powered to-do for today based on your exams & homework. Saved until end of day.
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent }}>
                    Tap to build today’s plan
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
