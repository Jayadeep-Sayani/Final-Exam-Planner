'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

type Toast = { id: number; message: string }

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextIdRef = useRef(0)

  const showToast = useCallback((message: string) => {
    const id = nextIdRef.current++
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '14px 20px 0',
              background: '#ffffff',
              color: '#111111',
              border: '2px solid #111111',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.03em',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            <span style={{ display: 'block', paddingBottom: 14 }}>{t.message}</span>
            <div
              style={{
                marginLeft: -20,
                marginRight: -20,
                width: 'calc(100% + 40px)',
                height: 3,
                background: '#FF6A00',
                transformOrigin: 'left',
                animation: `toast-countdown ${TOAST_DURATION}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { showToast: () => {} }
  return ctx
}
