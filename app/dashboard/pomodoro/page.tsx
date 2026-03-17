'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { usePomodoro } from '@/components/PomodoroProvider'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Exams' },
  { href: '/dashboard/homework', label: 'Homework' },
  { href: '/dashboard/planner', label: 'AI Planner' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro' },
  { href: '/dashboard/study', label: 'Study' },
]

const ACCENT = '#FF6A00'
const accentSoft = 'rgba(255, 106, 0, 0.12)'
const accentLight = 'rgba(255, 106, 0, 0.35)'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PomodoroPage() {
  const { state, setSettings, start, pause, reset } = usePomodoro()
  const [showSettings, setShowSettings] = useState(true)

  const phase = state.phase
  const total = phase === 'work' ? state.settings.workSeconds : phase === 'break' ? state.settings.breakSeconds : state.settings.workSeconds
  const progress = total > 0 ? 1 - state.remainingSeconds / total : 1
  const size = 220
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  const phaseName = phase === 'work' ? 'Work' : phase === 'break' ? 'Break' : 'Done'
  const ringColor = phase === 'done' ? '#22c55e' : ACCENT

  return (
    <>
      <Header navItems={NAV_ITEMS} />

      <main
        style={{
          minHeight: 'calc(100vh - 72px)',
          paddingBottom: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
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
        {/* Background dots / blobs like other pages */}
        <div aria-hidden className="pomodoro-blob" style={{ position: 'absolute', top: '12%', left: '10%', width: 160, height: 160, borderRadius: '50%', background: accentSoft, pointerEvents: 'none', animation: 'pomodoro-blob-float 6s ease-in-out infinite' }} />
        <div aria-hidden className="pomodoro-blob" style={{ position: 'absolute', bottom: '18%', right: '8%', width: 200, height: 200, borderRadius: '50%', background: accentSoft, pointerEvents: 'none', animation: 'pomodoro-blob-float 8s ease-in-out infinite 0.5s' }} />
        <div aria-hidden style={{ position: 'absolute', top: '50%', right: '15%', width: 90, height: 90, borderRadius: '50%', border: `2px solid ${ACCENT}`, opacity: 0.2, pointerEvents: 'none', animation: 'pomodoro-blob-float 7s ease-in-out infinite 0.2s' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '28%', left: '12%', width: 70, height: 70, borderRadius: '50%', border: `2px solid ${ACCENT}`, opacity: 0.25, pointerEvents: 'none', animation: 'pomodoro-blob-float 5.5s ease-in-out infinite 0.8s' }} />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 660,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            className="pomodoro-card"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              width: '100%',
              maxWidth: showSettings ? 660 : 340,
              padding: 28,
              background: '#ffffff',
              border: '2px solid #111',
              transition: 'max-width 0.35s ease',
              animation: 'pomodoro-card-in 0.4s ease-out forwards',
            }}
          >
          {/* Left: Pomodoro */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              flex: showSettings ? '0 1 auto' : '1 1 auto',
              minWidth: 0,
            }}
          >
          {/* Phase + count + dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#111',
                }}
              >
                {phaseName}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#666', letterSpacing: '0.04em' }}>
                {state.pomodorosCompleted} / {state.settings.targetPomodoros}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Array.from({ length: state.settings.targetPomodoros }, (_, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: i < state.pomodorosCompleted ? ACCENT : 'transparent',
                    border: `2px solid ${i < state.pomodorosCompleted ? ACCENT : '#ddd'}`,
                    flexShrink: 0,
                    transition: 'background 0.25s ease, border-color 0.25s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Circle */}
          <div style={{ position: 'relative' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#ebebeb"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.3s linear' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-logo), system-ui, sans-serif',
                  fontSize: 44,
                  fontWeight: 400,
                  lineHeight: 1,
                  color: '#111',
                }}
              >
                {phase === 'done' ? 'Done' : formatTime(state.remainingSeconds)}
              </span>
              {phase !== 'done' && (
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginTop: 6 }}>
                  {state.running ? 'Running' : 'Paused'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {phase !== 'done' ? (
              <>
                {state.running ? (
                  <button
                    type="button"
                    onClick={pause}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid #111',
                      background: '#fff',
                      color: '#111',
                      font: 'inherit',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Pause
                  </button>
                ) : (
                  <button type="button" onClick={start} className="btn-primary" style={{ padding: '12px 24px', fontSize: 12 }}>
                    Start
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    padding: '12px 20px',
                    border: '2px solid #111',
                    background: 'transparent',
                    color: '#111',
                    font: 'inherit',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </>
            ) : (
              <button type="button" onClick={reset} className="btn-primary" style={{ padding: '12px 28px', fontSize: 12 }}>
                Reset
              </button>
            )}

            {/* Settings trigger */}
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              aria-label="Settings"
              aria-expanded={showSettings}
              style={{
                width: 40,
                height: 40,
                marginLeft: 8,
                border: '2px solid #111',
                background: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
          </div>

          {/* Vertical bar + Right: Settings (when open) */}
          {showSettings && (
            <>
              <div style={{ flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'stretch', animation: 'pomodoro-settings-in 0.3s ease-out forwards' }} aria-hidden>
                <div style={{ width: 2, background: '#111' }} />
              </div>
              <div
                style={{
                  flex: '1 1 280px',
                  minWidth: 280,
                  paddingLeft: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  animation: 'pomodoro-settings-in 0.3s ease-out forwards',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444' }}>
                  Period settings
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 600, color: '#333' }}>
                  Work (minutes)
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={Math.round(state.settings.workSeconds / 60)}
                    onChange={(e) => setSettings({ workSeconds: clamp(Number(e.target.value) || 25, 1, 240) * 60 })}
                    className="input-field"
                    disabled={state.running}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 600, color: '#333' }}>
                  Break (minutes)
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={Math.round(state.settings.breakSeconds / 60)}
                    onChange={(e) => setSettings({ breakSeconds: clamp(Number(e.target.value) || 5, 1, 120) * 60 })}
                    className="input-field"
                    disabled={state.running}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 600, color: '#333' }}>
                  Pomodoros per session
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={state.settings.targetPomodoros}
                    onChange={(e) => setSettings({ targetPomodoros: clamp(Number(e.target.value) || 4, 1, 24) })}
                    className="input-field"
                    disabled={state.running}
                  />
                </label>
                <p style={{ margin: '8px 0 0', fontSize: 11, color: '#666' }}>
                  Locked while timer is running. Use Reset to change.
                </p>
              </div>
            </>
          )}
          </div>
        </div>
      </main>
    </>
  )
}
