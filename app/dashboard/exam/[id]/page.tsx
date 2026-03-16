'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'
import { parseLocalDate } from '@/lib/dateUtils'

type Topic = { id: string; label: string; difficulty: 'hard' | 'medium' | 'easy' }
type Exam = {
  id: string
  name: string
  examDate: string
  startStudyingDate: string
  bufferDays: number
  topics?: Topic[]
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
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
  const deadline = parseLocalDate(exam.examDate)
  deadline.setDate(deadline.getDate() - exam.bufferDays)
  deadline.setHours(0, 0, 0, 0)
  const today = todayAtMidnight()
  const ms = deadline.getTime() - today.getTime()
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}

function getStudyProgress(exam: Exam): {
  inStudyPeriod: boolean
  totalStudyDays: number
  daysElapsed: number
  expectedProgressPct: number
  actualProgressPct: number
  status: 'ahead' | 'on_track' | 'behind'
  statusColor: string
} {
  const today = todayAtMidnight()
  const start = parseLocalDate(exam.startStudyingDate)
  start.setHours(0, 0, 0, 0)
  const end = parseLocalDate(exam.examDate)
  end.setDate(end.getDate() - exam.bufferDays)
  end.setHours(0, 0, 0, 0)
  const totalStudyDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)))
  const daysElapsed = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  const inStudyPeriod = daysUntilStartStudying(exam) <= 0 && daysLeftToStudy(exam) >= 0
  const expectedProgressPct = totalStudyDays > 0 ? Math.min(100, Math.max(0, (daysElapsed / totalStudyDays) * 100)) : 0
  const topics = exam.topics ?? []
  const totalTopics = topics.length
  const doneCount = topics.filter((t) => t.difficulty === 'easy').length
  const actualProgressPct = totalTopics > 0 ? (doneCount / totalTopics) * 100 : 0
  const diff = actualProgressPct - expectedProgressPct
  const status: 'ahead' | 'on_track' | 'behind' = diff > 10 ? 'ahead' : diff < -10 ? 'behind' : 'on_track'
  const statusColor = status === 'ahead' ? '#22c55e' : status === 'behind' ? '#dc2626' : '#eab308'
  return {
    inStudyPeriod,
    totalStudyDays,
    daysElapsed,
    expectedProgressPct,
    actualProgressPct,
    status,
    statusColor,
  }
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { showToast } = useToast()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [newTopicLabel, setNewTopicLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ name: '', examDate: '', startStudyingDate: '', bufferDays: 0 })
  const [savingSettings, setSavingSettings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/exams/${id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.exam) setExam(data.exam)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function saveTopics(topics: Topic[]) {
    setSaving(true)
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topics }),
      })
      const data = await res.json()
      if (res.ok && data.exam) setExam(data.exam)
    } finally {
      setSaving(false)
    }
  }

  function addTopic() {
    const label = newTopicLabel.trim()
    if (!label || !exam) return
    const topic: Topic = { id: generateId(), label, difficulty: 'hard' }
    const topics = [...(exam.topics ?? []), topic]
    setExam({ ...exam, topics })
    setNewTopicLabel('')
    saveTopics(topics)
  }

  function setTopicDifficulty(topicId: string, difficulty: 'hard' | 'medium' | 'easy') {
    if (!exam) return
    const topics = (exam.topics ?? []).map((t) =>
      t.id === topicId ? { ...t, difficulty } : t
    )
    setExam({ ...exam, topics })
    saveTopics(topics)
  }

  function removeTopic(topicId: string) {
    if (!exam) return
    const topics = (exam.topics ?? []).filter((t) => t.id !== topicId)
    setExam({ ...exam, topics })
    saveTopics(topics)
  }

  function startEditingTopic(topic: Topic) {
    setEditingTopicId(topic.id)
    setEditingLabel(topic.label)
  }

  function saveEditingTopic() {
    if (!exam || !editingTopicId) return
    const trimmed = editingLabel.trim()
    if (trimmed) {
      const topics = (exam.topics ?? []).map((t) =>
        t.id === editingTopicId ? { ...t, label: trimmed } : t
      )
      setExam({ ...exam, topics })
      saveTopics(topics)
    }
    setEditingTopicId(null)
    setEditingLabel('')
  }

  function cancelEditingTopic() {
    setEditingTopicId(null)
    setEditingLabel('')
  }

  function openSettingsModal() {
    if (exam) {
      setSettingsForm({
        name: exam.name,
        examDate: exam.examDate,
        startStudyingDate: exam.startStudyingDate,
        bufferDays: exam.bufferDays,
      })
      setShowDeleteConfirm(false)
      setShowSettingsModal(true)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!exam) return
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsForm),
      })
      const data = await res.json()
      if (res.ok && data.exam) {
        setExam(data.exam)
        setShowSettingsModal(false)
        showToast('Exam updated')
      }
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleDeleteExam() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        showToast('Exam deleted')
        router.push('/dashboard')
      }
    } finally {
      setDeleting(false)
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

  const topics = exam?.topics ?? []

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

      {showSettingsModal && exam && (
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
          onClick={() => !savingSettings && !deleting && setShowSettingsModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #111111',
              padding: 32,
              maxWidth: 480,
              minWidth: 360,
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
              Exam settings
            </h3>
            {!showDeleteConfirm ? (
              <>
                <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="exam-settings-name" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Name</label>
                    <input
                      id="exam-settings-name"
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="exam-settings-exam-date" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Exam date</label>
                    <input
                      id="exam-settings-exam-date"
                      type="date"
                      value={settingsForm.examDate}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, examDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="exam-settings-start-date" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Start studying date</label>
                    <input
                      id="exam-settings-start-date"
                      type="date"
                      value={settingsForm.startStudyingDate}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, startStudyingDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="exam-settings-buffer" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Buffer days</label>
                    <input
                      id="exam-settings-buffer"
                      type="number"
                      min={0}
                      value={settingsForm.bufferDays}
                      onChange={(e) => setSettingsForm((f) => ({ ...f, bufferDays: parseInt(e.target.value, 10) || 0 }))}
                      className="input-field"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleting}
                      style={{
                        padding: '12px 24px',
                        border: '2px solid #c00',
                        background: 'transparent',
                        color: '#c00',
                        font: 'inherit',
                        fontSize: 14,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Delete exam
                    </button>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        style={{
                          padding: '12px 24px',
                          border: '2px solid #111111',
                          background: '#ffffff',
                          color: '#111111',
                          font: 'inherit',
                          fontSize: 14,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={savingSettings}>
                        {savingSettings ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div>
                <p style={{ margin: '0 0 24px', fontSize: 16, color: '#111111' }}>
                  Delete this exam and all its topics? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleDeleteExam}
                    disabled={deleting}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid #c00',
                      background: '#c00',
                      color: '#ffffff',
                      font: 'inherit',
                      fontSize: 14,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid #111111',
                      background: '#ffffff',
                      color: '#111111',
                      font: 'inherit',
                      fontSize: 14,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 40,
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#111111',
            textDecoration: 'none',
            marginBottom: 32,
            background: '#f2f2f2',
            padding: '2px 6px',
          }}
          className="link-underline"
        >
          <span aria-hidden>←</span>
          <span>Back to exams</span>
        </Link>

        {loading ? (
          <p style={{ fontSize: 14, color: '#444444' }}>Loading…</p>
        ) : exam ? (
          (() => {
            const progress = getStudyProgress(exam)
            const hasTopics = (exam.topics?.length ?? 0) > 0
            const showProgress = progress.inStudyPeriod && hasTopics
            return (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 32,
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    margin: 0,
                    color: '#111111',
                    background: '#f2f2f2',
                    width: 'fit-content',
                    padding: '2px 6px',
                  }}
                >
                  {exam.name}
                </h1>
                {daysUntilStartStudying(exam) > 0 && (
                  <div
                    style={{
                      padding: '6px 12px',
                      border: '2px solid #FF6A00',
                      background: 'transparent',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#FF6A00',
                    }}
                  >
                    Start in {daysUntilStartStudying(exam)} day{daysUntilStartStudying(exam) !== 1 ? 's' : ''}
                  </div>
                )}
                {showProgress && (
                  <>
                    <span
                      style={{
                        fontSize: 14,
                        color: '#444444',
                        fontWeight: 500,
                      }}
                    >
                      {daysLeftToStudy(exam)} day{daysLeftToStudy(exam) !== 1 ? 's' : ''} left
                    </span>
                    <span
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        border: `2px solid ${progress.statusColor}`,
                        background: 'transparent',
                        color: progress.status === 'behind' ? progress.statusColor : '#111111',
                      }}
                    >
                      {progress.status === 'ahead' ? 'Ahead' : progress.status === 'behind' ? 'Behind' : 'On track'}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={openSettingsModal}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #111111',
                  background: '#ffffff',
                  font: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#111111',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Exam settings
              </button>
            </div>

            {showProgress && (
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    height: 10,
                    background: '#f0f0f0',
                    position: 'relative',
                    border: '1px solid #ddd',
                    overflow: 'visible',
                  }}
                >
                  <div
                    className="exam-progress-fill"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.min(100, progress.actualProgressPct)}%`,
                      background: '#FF6A00',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.min(100, Math.max(0, progress.expectedProgressPct))}%`,
                      top: -8,
                      bottom: 0,
                      width: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                    title={`Expected: ${progress.expectedProgressPct.toFixed(0)}%`}
                  >
                    <span
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '8px solid #111111',
                        flexShrink: 0,
                        filter: 'drop-shadow(0 0 1px #fff)',
                      }}
                      aria-hidden
                    />
                    <span
                      style={{
                        width: 3,
                        background: '#111111',
                        flex: 1,
                        minHeight: 10,
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.8)',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#666666' }}>
                  <span>Actual: {progress.actualProgressPct.toFixed(0)}%</span>
                  <span>Expected: {progress.expectedProgressPct.toFixed(0)}%</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Add topic to study"
                value={newTopicLabel}
                onChange={(e) => setNewTopicLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                style={{
                  flex: 1,
                  maxWidth: 280,
                  padding: '6px 0',
                  border: 'none',
                  borderBottom: '2px solid #111111',
                  background: 'transparent',
                  font: 'inherit',
                  fontSize: 14,
                  color: '#111111',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={addTopic}
                disabled={!newTopicLabel.trim() || saving}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Add
              </button>
            </div>

            {topics.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#666666',
                  marginBottom: 8,
                }}
              >
                No topics yet, add a topic.
              </p>
            ) : null}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {topics.map((topic) => {
                const isDone = topic.difficulty === 'easy'
                return (
                  <li
                    key={topic.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 12,
                      padding: '12px 16px',
                      border: '2px solid #111111',
                      background: '#ffffff',
                    }}
                  >
                    {isDone ? (
                      <span style={{ color: '#111111', fontSize: 18 }} aria-hidden>✓</span>
                    ) : null}
                    {editingTopicId === topic.id ? (
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={saveEditingTopic}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            saveEditingTopic()
                          }
                          if (e.key === 'Escape') cancelEditingTopic()
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          fontSize: 16,
                          color: '#111111',
                          padding: '4px 0',
                          border: 'none',
                          borderBottom: '2px solid #111111',
                          background: 'transparent',
                          font: 'inherit',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingTopic(topic)}
                        style={{
                          flex: 1,
                          textAlign: 'left',
                          fontSize: 16,
                          color: '#111111',
                          textDecoration: isDone ? 'line-through' : 'none',
                          opacity: isDone ? 0.7 : 1,
                          padding: 0,
                          border: 'none',
                          background: 'none',
                          font: 'inherit',
                          cursor: 'text',
                        }}
                      >
                        {topic.label}
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['hard', 'medium', 'easy'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setTopicDifficulty(topic.id, d)}
                            disabled={saving}
                            style={{
                              padding: '6px 12px',
                              border: '2px solid #111111',
                              background: topic.difficulty === d ? '#FF6A00' : '#ffffff',
                              color: topic.difficulty === d ? '#ffffff' : '#111111',
                              font: 'inherit',
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTopic(topic.id)}
                        disabled={saving}
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          border: 'none',
                          background: 'none',
                          color: '#c00',
                          fontSize: 18,
                          fontWeight: 700,
                          lineHeight: 1,
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                        aria-label="Remove topic"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
            );
          })()
        ) : (
          <p style={{ fontSize: 14, color: '#444444' }}>Exam not found.</p>
        )}
      </main>
    </>
  )
}
