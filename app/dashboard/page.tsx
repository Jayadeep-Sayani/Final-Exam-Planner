'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'
import { parseLocalDate, getTodayLocalDateString } from '@/lib/dateUtils'

type Topic = { id: string; label: string; difficulty: 'hard' | 'medium' | 'easy' }
type Exam = {
  id: string
  name: string
  examDate: string
  startStudyingDate: string
  bufferDays: number
  topics?: Topic[]
}

function previewTopics(exam: Exam): Topic[] {
  const list = (exam.topics ?? []).filter((t) => t.difficulty === 'hard' || t.difficulty === 'medium')
  const hardFirst = [...list].sort((a, b) => (a.difficulty === 'hard' && b.difficulty !== 'hard' ? -1 : a.difficulty === 'medium' && b.difficulty === 'hard' ? 1 : 0))
  return hardFirst.slice(0, 3)
}

const todayAtMidnight = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysUntilStartStudying(exam: Exam): number {
  const start = parseLocalDate(exam.startStudyingDate)
  start.setHours(0, 0, 0, 0)
  const today = todayAtMidnight()
  const ms = start.getTime() - today.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

function daysLeftToStudy(exam: Exam): number {
  const examD = new Date(exam.examDate)
  const studyDeadline = new Date(examD)
  studyDeadline.setDate(studyDeadline.getDate() - exam.bufferDays)
  const today = todayAtMidnight()
  studyDeadline.setHours(0, 0, 0, 0)
  const ms = studyDeadline.getTime() - today.getTime()
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  return Math.max(0, days)
}

const SQUARE_SIZE = 268
const BANNER_H = 48

const accent = '#FF6A00'

const examCardStyle: React.CSSProperties = {
  width: SQUARE_SIZE,
  height: SQUARE_SIZE,
  background: '#ffffff',
  border: '2px solid #111111',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

function ExamBanner({ index }: { index: number }) {
  const p = index % 5
  const base = { height: BANNER_H, background: accent }
  if (p === 0) {
    return <div style={base} />
  }
  if (p === 1) {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)`,
        }}
      />
    )
  }
  if (p === 2) {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 6px)`,
        }}
      />
    )
  }
  if (p === 3) {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.1) 6px, rgba(0,0,0,0.1) 7px)`,
        }}
      />
    )
  }
  return (
    <div
      style={{
        ...base,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 8px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 8px)
        `,
      }}
    />
  )
}

const addExamBlockStyle: React.CSSProperties = {
  width: SQUARE_SIZE,
  height: SQUARE_SIZE,
  background: '#f4f4f4',
  border: '2px dashed #111111',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function DashboardPage() {
  const { showToast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [examsLoading, setExamsLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showAddExamModal, setShowAddExamModal] = useState(false)
  const [addExamName, setAddExamName] = useState('')
  const [addExamExamDate, setAddExamExamDate] = useState('')
  const [addExamStartStudyingDate, setAddExamStartStudyingDate] = useState('')
  const [addExamBufferDays, setAddExamBufferDays] = useState(0)
  const [addExamSubmitting, setAddExamSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/exams', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { exams: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.exams)) setExams(data.exams)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setExamsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function openAddExamModal() {
    setAddExamName('')
    setAddExamExamDate('')
    setAddExamStartStudyingDate('')
    setAddExamBufferDays(0)
    setShowAddExamModal(true)
  }

  function closeAddExamModal() {
    setShowAddExamModal(false)
  }

  async function handleAddExamSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addExamName.trim()) return
    setAddExamSubmitting(true)
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addExamName.trim(),
          examDate: addExamExamDate || getTodayLocalDateString(),
          startStudyingDate: addExamStartStudyingDate || getTodayLocalDateString(),
          bufferDays: Math.max(0, addExamBufferDays),
        }),
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data.exams)) {
        setExams(data.exams)
        closeAddExamModal()
        showToast('Exam added')
      }
    } finally {
      setAddExamSubmitting(false)
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
        navItems={[
          { href: '/dashboard', label: 'Exams' },
          { href: '/dashboard/homework', label: 'Homework' },
          { href: '/dashboard/planner', label: 'AI Planner' },
        ]}
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
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                color: '#111111',
              }}
            >
              Sign out?
            </h3>
            <p style={{ fontSize: 16, color: '#444444', margin: '0 0 24px' }}>
              Are you sure you want to sign out?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  font: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                disabled={loggingOut}
                className="btn-primary"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddExamModal && (
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
          onClick={closeAddExamModal}
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
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                margin: '0 0 24px',
                color: '#111111',
              }}
            >
              Add exam
            </h3>
            <form onSubmit={handleAddExamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="exam-name"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Name
                </label>
                <input
                  id="exam-name"
                  type="text"
                  placeholder="e.g. Calculus Final"
                  value={addExamName}
                  onChange={(e) => setAddExamName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="exam-date"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Exam date (when it is)
                </label>
                <input
                  id="exam-date"
                  type="date"
                  value={addExamExamDate}
                  onChange={(e) => setAddExamExamDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="start-studying-date"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Start studying date
                </label>
                <input
                  id="start-studying-date"
                  type="date"
                  value={addExamStartStudyingDate}
                  onChange={(e) => setAddExamStartStudyingDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="buffer-days"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#444444',
                  }}
                >
                  Buffer days
                </label>
                <input
                  id="buffer-days"
                  type="number"
                  min={0}
                  value={addExamBufferDays}
                  onChange={(e) => setAddExamBufferDays(parseInt(e.target.value, 10) || 0)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeAddExamModal}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #111111',
                    background: '#ffffff',
                    color: '#111111',
                    font: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addExamSubmitting}>
                  {addExamSubmitting ? 'Adding…' : 'Add exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                marginBottom: 8,
                color: '#111111',
                background: '#f2f2f2',
                width: 'fit-content',
                padding: '2px 6px',
              }}
            >
              Your exams
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#444444',
                margin: 0,
                background: '#f2f2f2',
                width: 'fit-content',
                padding: '2px 6px',
              }}
            >
              {examsLoading ? 'Loading…' : exams.length === 0 ? 'No exams yet.' : `${exams.length} exam${exams.length === 1 ? '' : 's'}.`}
            </p>
          </div>
          {exams.length > 0 && (
            <button
              type="button"
              onClick={openAddExamModal}
              className="btn-primary"
              style={{ border: '2px solid #111111' }}
            >
              Add exam
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(4, ${SQUARE_SIZE}px)`,
            gap: 24,
          }}
        >
          {exams.length === 0 ? (
            <button
              type="button"
              onClick={openAddExamModal}
              style={{
                ...addExamBlockStyle,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                font: 'inherit',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#FF6A00' }}>+ Add exam</span>
            </button>
          ) : (
            <>
              {exams.map((exam, i) => {
                const daysUntil = daysUntilStartStudying(exam)
                const daysLeft = daysLeftToStudy(exam)
                const statusText =
                  daysUntil > 0
                    ? `Don't start yet — start in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                    : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to study`
                const preview = previewTopics(exam)
                return (
                  <Link
                    key={exam.id}
                    href={`/dashboard/exam/${exam.id}`}
                    style={{
                      ...examCardStyle,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <ExamBanner index={i} />
                    <div
                      style={{
                        padding: 20,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#111111',
                          letterSpacing: '0.02em',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {exam.name}
                      </span>
                      {preview.length > 0 ? (
                        <ul
                          style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '8px 0 0 0',
                          }}
                        >
                          {preview.map((t) => (
                            <li
                              key={t.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px 0',
                                fontSize: 14,
                                color: '#444444',
                                overflow: 'hidden',
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  background: '#FF6A00',
                                  flexShrink: 0,
                                  marginRight: 12,
                                }}
                                aria-hidden
                              />
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minWidth: 0,
                                }}
                              >
                                {t.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <span
                        style={{
                          fontSize: 13,
                          color: '#444444',
                          letterSpacing: '0.03em',
                          marginTop: 'auto',
                          paddingTop: 8,
                        }}
                      >
                        {statusText}
                      </span>
                    </div>
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={openAddExamModal}
                style={{
                  ...addExamBlockStyle,
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: 'inherit',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: '#FF6A00' }}>+ Add exam</span>
              </button>
            </>
          )}
        </div>
      </main>
    </>
  )
}
