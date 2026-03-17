'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { POMODORO_MUSIC_VIDEO_IDS } from '@/lib/pomodoroMusic'

type PomodoroPhase = 'work' | 'break' | 'done'

type PomodoroSettings = {
  workSeconds: number
  breakSeconds: number
  targetPomodoros: number
}

type PomodoroState = {
  settings: PomodoroSettings
  phase: PomodoroPhase
  running: boolean
  endAtMs: number | null
  remainingSeconds: number
  pomodorosCompleted: number
}

type PomodoroContextValue = {
  state: PomodoroState
  hasStartedThisSession: boolean
  setSettings: (next: Partial<PomodoroSettings>) => void
  start: () => void
  pause: () => void
  reset: () => void
  musicVolume: number
  setMusicVolume: (n: number) => void
}

const STORAGE_KEY = 'examio_pomodoro_state_v2'
const accent = '#FF6A00'

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, Math.round(n)))
}

function defaultSettings(): PomodoroSettings {
  return {
    workSeconds: 25 * 60,
    breakSeconds: 5 * 60,
    targetPomodoros: 4,
  }
}

function phaseDurationSeconds(phase: Exclude<PomodoroPhase, 'done'>, settings: PomodoroSettings) {
  if (phase === 'work') return settings.workSeconds
  return settings.breakSeconds
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

function phaseLabel(phase: PomodoroPhase) {
  if (phase === 'work') return 'Work'
  if (phase === 'break') return 'Break'
  return 'Session done'
}

function loadStoredState(): PomodoroState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PomodoroState> & { settings?: Record<string, number> }
    if (!parsed || typeof parsed !== 'object') return null
    const s = parsed.settings ?? {}
    const workSeconds = clampInt((s as any).workSeconds ?? 25 * 60, 60, 4 * 60 * 60)
    const breakSeconds = clampInt(
      (s as any).breakSeconds ?? (s as any).shortBreakSeconds ?? 5 * 60,
      60,
      2 * 60 * 60
    )
    const settings: PomodoroSettings = {
      workSeconds,
      breakSeconds,
      targetPomodoros: clampInt((s as any).targetPomodoros ?? 4, 1, 24),
    }
    let phase = (parsed.phase ?? 'work') as string
    if (phase === 'short_break' || phase === 'long_break') phase = 'break'
    if (phase !== 'work' && phase !== 'break' && phase !== 'done') phase = 'work'
    const pomodorosCompleted = clampInt((parsed as any).pomodorosCompleted ?? 0, 0, 1000)
    const running = Boolean(parsed.running)
    const endAtMs = typeof parsed.endAtMs === 'number' ? parsed.endAtMs : null
    const remainingSeconds = clampInt((parsed as any).remainingSeconds ?? settings.workSeconds, 0, 24 * 60 * 60)
    return { settings, phase: phase as PomodoroPhase, running, endAtMs, remainingSeconds, pomodorosCompleted }
  } catch {
    return null
  }
}

function saveStoredState(state: PomodoroState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function playChime(audioCtx: AudioContext) {
  const now = audioCtx.currentTime
  const master = audioCtx.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.15, now + 0.02)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
  master.connect(audioCtx.destination)

  const o1 = audioCtx.createOscillator()
  const o2 = audioCtx.createOscillator()
  o1.type = 'sine'
  o2.type = 'triangle'
  o1.frequency.setValueAtTime(523.25, now) // C5
  o2.frequency.setValueAtTime(659.25, now + 0.08) // E5
  o1.connect(master)
  o2.connect(master)
  o1.start(now)
  o2.start(now + 0.08)
  o1.stop(now + 0.45)
  o2.stop(now + 0.52)
}

function playDoneBeep(audioCtx: AudioContext) {
  const now = audioCtx.currentTime
  const g = audioCtx.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
  g.connect(audioCtx.destination)

  const o = audioCtx.createOscillator()
  o.type = 'square'
  o.frequency.setValueAtTime(880, now)
  o.connect(g)
  o.start(now)
  o.stop(now + 0.22)
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider')
  return ctx
}

type YTPlayerInstance = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  setVolume: (vol: number) => void
  destroy: () => void
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const doneLoopRef = useRef<number | null>(null)
  const lastAutoTransitionAtRef = useRef<number>(0)
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null)
  const ytContainerRef = useRef<HTMLDivElement | null>(null)
  const ytReadyRef = useRef(false)
  const musicVolumeRef = useRef(70)

  const [state, setState] = useState<PomodoroState>(() => {
    return {
      settings: defaultSettings(),
      phase: 'work',
      running: false,
      endAtMs: null,
      remainingSeconds: defaultSettings().workSeconds,
      pomodorosCompleted: 0,
    }
  })
  const [hasStartedThisSession, setHasStartedThisSession] = useState(false)
  const [musicVolume, setMusicVolumeState] = useState(70)

  const [ytApiReady, setYtApiReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).YT?.Player) {
      ytReadyRef.current = true
      setYtApiReady(true)
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)
    ;(window as any).onYouTubeIframeAPIReady = () => {
      ytReadyRef.current = true
      setYtApiReady(true)
    }
  }, [])

  useEffect(() => {
    const stored = loadStoredState()
    if (!stored) return
    setState((prev) => {
      const base = { ...prev, ...stored }
      if (base.phase !== 'done' && base.remainingSeconds <= 0) {
        const d = phaseDurationSeconds(base.phase as Exclude<PomodoroPhase, 'done'>, base.settings)
        return { ...base, remainingSeconds: d, running: false, endAtMs: null }
      }
      return base
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    saveStoredState(state)
  }, [state])

  useEffect(() => {
    const t = window.setInterval(() => {
      setState((prev) => {
        if (!prev.running || !prev.endAtMs || prev.phase === 'done') return prev
        const now = Date.now()
        const remaining = Math.max(0, Math.ceil((prev.endAtMs - now) / 1000))
        if (remaining > 0) {
          if (remaining === prev.remainingSeconds) return prev
          return { ...prev, remainingSeconds: remaining }
        }

        if (now - lastAutoTransitionAtRef.current < 500) {
          return prev
        }
        lastAutoTransitionAtRef.current = now

        const ensureAudio = () => {
          if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
          if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume().catch(() => {})
          return audioCtxRef.current
        }

        const current = prev.phase
        const duckThenChime = () => {
          const vol = musicVolumeRef.current
          ytPlayerRef.current?.setVolume(0)
          const ac = ensureAudio()
          playChime(ac)
          setTimeout(() => {
            ytPlayerRef.current?.setVolume(vol)
          }, 600)
        }

        if (current === 'work') {
          const nextCompleted = prev.pomodorosCompleted + 1
          const isDone = nextCompleted >= prev.settings.targetPomodoros
          if (isDone) {
            duckThenChime()
            if (doneLoopRef.current == null) {
              doneLoopRef.current = window.setInterval(() => {
                try {
                  const ac2 = ensureAudio()
                  playDoneBeep(ac2)
                } catch {}
              }, 900)
            }
            ytPlayerRef.current?.stopVideo()
            return {
              ...prev,
              phase: 'done',
              running: false,
              endAtMs: null,
              remainingSeconds: 0,
              pomodorosCompleted: nextCompleted,
            }
          }
          duckThenChime()
          const dur = prev.settings.breakSeconds
          return {
            ...prev,
            phase: 'break',
            running: true,
            remainingSeconds: dur,
            endAtMs: now + dur * 1000,
            pomodorosCompleted: nextCompleted,
          }
        }

        if (current === 'break') {
          duckThenChime()
          const dur = phaseDurationSeconds('work', prev.settings)
          return {
            ...prev,
            phase: 'work',
            running: true,
            remainingSeconds: dur,
            endAtMs: now + dur * 1000,
          }
        }

        return prev
      })
    }, 250)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (state.phase !== 'done' && doneLoopRef.current != null) {
      window.clearInterval(doneLoopRef.current)
      doneLoopRef.current = null
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase === 'done') ytPlayerRef.current?.stopVideo()
  }, [state.phase])

  const createMusicPlayer = () => {
    if (!document.getElementById('pomodoro-yt-music') || ytPlayerRef.current || !(window as any).YT?.Player) return
    const videoId = POMODORO_MUSIC_VIDEO_IDS[Math.floor(Math.random() * POMODORO_MUSIC_VIDEO_IDS.length)]
    const player = new (window as any).YT.Player('pomodoro-yt-music', {
      videoId,
      playerVars: { autoplay: 1, mute: 0 },
      events: {
        onReady: (e: { target: YTPlayerInstance }) => {
          e.target.setVolume(musicVolumeRef.current)
          e.target.playVideo()
        },
      },
    })
    ytPlayerRef.current = player
  }

  useEffect(() => {
    if (state.running && ytApiReady && !ytPlayerRef.current && ytContainerRef.current) createMusicPlayer()
  }, [state.running, ytApiReady])

  const api: PomodoroContextValue = useMemo(() => {
    const ensureAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume().catch(() => {})
      return audioCtxRef.current
    }

    return {
      state,
      hasStartedThisSession,
      musicVolume,
      setMusicVolume: (n: number) => {
        const v = Math.max(0, Math.min(100, Math.round(n)))
        setMusicVolumeState(v)
        musicVolumeRef.current = v
        ytPlayerRef.current?.setVolume(v)
      },
      setSettings: (next) => {
        setState((prev) => {
          const merged: PomodoroSettings = {
            ...prev.settings,
            ...next,
          }
          const sanitized: PomodoroSettings = {
            workSeconds: clampInt(merged.workSeconds, 60, 4 * 60 * 60),
            breakSeconds: clampInt(merged.breakSeconds, 60, 2 * 60 * 60),
            targetPomodoros: clampInt(merged.targetPomodoros, 1, 24),
          }

          if (prev.running || prev.phase === 'done') return { ...prev, settings: sanitized }

          const basePhase = prev.phase as Exclude<PomodoroPhase, 'done'>
          const dur = phaseDurationSeconds(basePhase, sanitized)
          return { ...prev, settings: sanitized, remainingSeconds: dur, endAtMs: null }
        })
      },
      start: () => {
        setHasStartedThisSession(true)
        if (ytReadyRef.current && !ytPlayerRef.current) createMusicPlayer()
        else if (ytPlayerRef.current) ytPlayerRef.current.playVideo()
        setState((prev) => {
          if (prev.phase === 'done') return prev
          const now = Date.now()
          ensureAudio()
          return {
            ...prev,
            running: true,
            endAtMs: now + Math.max(0, prev.remainingSeconds) * 1000,
          }
        })
      },
      pause: () => {
        ytPlayerRef.current?.pauseVideo()
        setState((prev) => ({ ...prev, running: false, endAtMs: null }))
      },
      reset: () => {
        setHasStartedThisSession(false)
        if (ytPlayerRef.current) {
          try { ytPlayerRef.current.destroy() } catch {}
          ytPlayerRef.current = null
        }
        setState((prev) => {
          const s = prev.settings
          if (doneLoopRef.current != null) {
            window.clearInterval(doneLoopRef.current)
            doneLoopRef.current = null
          }
          return {
            settings: s,
            phase: 'work',
            running: false,
            endAtMs: null,
            remainingSeconds: s.workSeconds,
            pomodorosCompleted: 0,
          }
        })
      },
    }
  }, [state, hasStartedThisSession, musicVolume])

  return (
    <PomodoroContext.Provider value={api}>
      <div
        ref={ytContainerRef}
        id="pomodoro-yt-music"
        aria-hidden
        style={{
          position: 'fixed',
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      {children}
      <PomodoroBottomIndicator />
    </PomodoroContext.Provider>
  )
}

function PomodoroBottomIndicator() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) return null
  const { state, hasStartedThisSession, musicVolume, setMusicVolume } = ctx
  if (!hasStartedThisSession) return null

  const totalForPhase =
    state.phase === 'done'
      ? 1
      : phaseDurationSeconds(state.phase as Exclude<PomodoroPhase, 'done'>, state.settings)

  const pct =
    state.phase === 'done'
      ? 100
      : totalForPhase <= 0
        ? 0
        : Math.max(0, Math.min(100, (1 - state.remainingSeconds / totalForPhase) * 100))

  const label = phaseLabel(state.phase)
  const time = state.phase === 'done' ? 'Done' : formatMMSS(state.remainingSeconds)

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        borderTop: '2px solid #111111',
        background: '#ffffff',
      }}
      aria-label="Pomodoro status"
    >
      <div style={{ height: 4, background: '#f0f0f0' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, transition: 'width 0.25s linear' }} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#111111',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: state.phase === 'done' ? '#22c55e' : state.running ? accent : '#666666',
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label} • {time}
          </span>
        </span>
        <span style={{ color: '#444444', fontWeight: 700 }}>
          {state.pomodorosCompleted}/{state.settings.targetPomodoros}
        </span>
        {/* Audio: volume slider only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ width: 14, height: 14 }} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" style={{ display: 'block', width: '100%', height: '100%' }}>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            style={{ width: 72, height: 6, accentColor: accent }}
            aria-label="Music volume"
          />
        </div>
      </div>
    </div>
  )
}

