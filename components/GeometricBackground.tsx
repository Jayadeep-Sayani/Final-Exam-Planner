'use client'

import { useState, useEffect, useRef } from 'react'

const CELL = 32
const TRAIL_FADE_MS = 700
const PEAK_OPACITY = 0.14
const PRUNE_AFTER_MS = TRAIL_FADE_MS + 100

function cellAt(x: number, y: number) {
  return {
    left: Math.floor(x / CELL) * CELL,
    top: Math.floor(y / CELL) * CELL,
  }
}

type TrailCell = { left: number; top: number; createdAt: number }

export function GeometricBackground() {
  const [current, setCurrent] = useState<{ left: number; top: number } | null>(null)
  const [trail, setTrail] = useState<TrailCell[]>([])
  const [, setTick] = useState(0)
  const lastCellRef = useRef<{ left: number; top: number } | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const loop = () => {
      setTick((n) => n + 1)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now()
      setTrail((prev) => prev.filter((c) => t - c.createdAt < PRUNE_AFTER_MS))
    }, 100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cell = cellAt(e.clientX, e.clientY)
      lastCellRef.current = cell

      setCurrent((prev) => {
        if (prev && (prev.left !== cell.left || prev.top !== cell.top)) {
          const createdAt = Date.now()
          setTrail((t) => {
            const alreadyInTrail = t.some(
              (c) => c.left === prev.left && c.top === prev.top
            )
            if (alreadyInTrail) return t
            return [...t, { ...prev, createdAt }]
          })
        }
        return cell
      })
    }

    const onLeave = () => {
      const last = lastCellRef.current
      if (last) {
        const createdAt = Date.now()
        setTrail((t) => {
          const alreadyInTrail = t.some(
            (c) => c.left === last.left && c.top === last.top
          )
          if (alreadyInTrail) return t
          return [...t, { ...last, createdAt }]
        })
      }
      lastCellRef.current = null
      setCurrent(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const now = Date.now()

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'var(--color-muted)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, #111111 1px, transparent 1px),
            linear-gradient(to bottom, #111111 1px, transparent 1px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          width: '40%',
          height: '200%',
          background: 'var(--color-accent)',
          opacity: 0.08,
          transform: 'translateX(-50%) skewX(-12deg)',
        }}
      />

      {trail.map((c) => {
        const age = now - c.createdAt
        const opacity =
          age >= TRAIL_FADE_MS ? 0 : PEAK_OPACITY * (1 - age / TRAIL_FADE_MS)
        return (
          <div
            key={`${c.left}-${c.top}-${c.createdAt}`}
            style={{
              position: 'fixed',
              left: c.left,
              top: c.top,
              width: CELL,
              height: CELL,
              background: 'var(--color-accent)',
              opacity,
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {current && (
        <div
          key={`${current.left}-${current.top}`}
          className="cell-shade-fade-in"
          style={{
            position: 'fixed',
            left: current.left,
            top: current.top,
            width: CELL,
            height: CELL,
            background: 'var(--color-accent)',
          }}
        />
      )}
    </div>
  )
}
