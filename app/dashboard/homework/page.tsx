'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { HomeworkDoneRow } from '@/components/homework/HomeworkDoneRow'
import { HomeworkSortableRow } from '@/components/homework/HomeworkSortableRow'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'
import { parseLocalDate, getTodayLocalDateString } from '@/lib/dateUtils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Exams' },
  { href: '/dashboard/homework', label: 'Homework' },
  { href: '/dashboard/planner', label: 'AI Planner' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro' },
  { href: '/dashboard/study', label: 'Study' },
]

type Homework = {
  id: string
  courseName: string
  assignmentName: string
  dueDate: string
  status: 'not_started' | 'in_progress' | 'done'
  estimatedHours?: number
}

function daysLeft(dueDate: string): number {
  const due = parseLocalDate(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

function urgencyColor(days: number): string {
  if (days > 7) return '#666666'
  if (days >= 1) return '#FF6A00'
  return '#dc2626'
}

function orderHomeworkDisplay(list: Homework[]): Homework[] {
  const unfinished = list.filter((h) => h.status !== 'done')
  const done = list.filter((h) => h.status === 'done')
  return [...unfinished, ...done]
}

export default function HomeworkPage() {
  const { showToast } = useToast()
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDoneConfirm, setShowDoneConfirm] = useState(false)
  const [homeworkToMarkDone, setHomeworkToMarkDone] = useState<Homework | null>(null)
  const [courseName, setCourseName] = useState('')
  const [assignmentName, setAssignmentName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingHw, setEditingHw] = useState<{ id: string; field: 'assignment' | 'course' } | null>(null)
  const [editHwText, setEditHwText] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/homework', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { homework: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.homework)) setHomeworks(orderHomeworkDisplay(data.homework))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function openAddModal() {
    setCourseName('')
    setAssignmentName('')
    setDueDate(getTodayLocalDateString())
    setEstimatedHours('')
    setShowAddModal(true)
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    const c = courseName.trim()
    const a = assignmentName.trim()
    if (!c || !a) return
    setSubmitting(true)
    try {
      const hours = estimatedHours.trim() ? parseFloat(estimatedHours) : undefined
      const payload: { courseName: string; assignmentName: string; dueDate: string; estimatedHours?: number } = {
        courseName: c,
        assignmentName: a,
        dueDate: dueDate || getTodayLocalDateString(),
      }
      if (typeof hours === 'number' && !Number.isNaN(hours) && hours >= 0) payload.estimatedHours = hours
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data.homework)) {
        setHomeworks(orderHomeworkDisplay(data.homework))
        setShowAddModal(false)
        showToast('Homework added')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function setStatus(id: string, status: Homework['status']) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/homework/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (res.ok && data.homework) {
        setHomeworks((prev) => orderHomeworkDisplay(prev.map((h) => (h.id === id ? data.homework : h))))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  async function confirmMarkAsDone() {
    if (!homeworkToMarkDone) return
    const id = homeworkToMarkDone.id
    setHomeworkToMarkDone(null)
    setShowDoneConfirm(false)
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/homework/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'done' as const }),
      })
      const data = await res.json()
      if (res.ok && data.homework) {
        setHomeworks((prev) => orderHomeworkDisplay(prev.map((h) => (h.id === id ? data.homework : h))))
        showToast('Assignment finished')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  async function removeHomework(id: string) {
    const res = await fetch(`/api/homework/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) {
      setHomeworks((prev) => prev.filter((h) => h.id !== id))
    }
  }

  function startEditHw(hw: Homework, field: 'assignment' | 'course') {
    setEditingHw({ id: hw.id, field })
    setEditHwText(field === 'assignment' ? hw.assignmentName : hw.courseName)
  }

  function cancelEditHw() {
    setEditingHw(null)
    setEditHwText('')
  }

  async function saveHwField() {
    if (!editingHw) return
    const trimmed = editHwText.trim()
    if (!trimmed) {
      cancelEditHw()
      return
    }
    const id = editingHw.id
    const field = editingHw.field
    setUpdatingId(id)
    try {
      const body =
        field === 'assignment' ? { assignmentName: trimmed } : { courseName: trimmed }
      const res = await fetch(`/api/homework/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.homework) {
        setHomeworks((prev) => orderHomeworkDisplay(prev.map((h) => (h.id === id ? data.homework : h))))
        showToast('Updated')
      }
    } finally {
      setUpdatingId(null)
      cancelEditHw()
    }
  }

  const sortedHomeworks = orderHomeworkDisplay(homeworks)

  async function persistHomeworkOrder(next: Homework[]) {
    const prev = homeworks
    setHomeworks(next)
    try {
      const res = await fetch('/api/homework/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: next.map((h) => h.id) }),
      })
      if (!res.ok) {
        setHomeworks(prev)
        showToast('Could not save order')
      }
    } catch {
      setHomeworks(prev)
      showToast('Could not save order')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleHomeworkDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ordered = orderHomeworkDisplay(homeworks)
    const unfinished = ordered.filter((h) => h.status !== 'done')
    const done = ordered.filter((h) => h.status === 'done')
    const oldIndex = unfinished.findIndex((h) => h.id === active.id)
    const newIndex = unfinished.findIndex((h) => h.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const nextU = arrayMove(unfinished, oldIndex, newIndex)
    void persistHomeworkOrder([...nextU, ...done])
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

      {showAddModal && (
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
          onClick={() => !submitting && setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #111111',
              padding: 32,
              maxWidth: 420,
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
              Add homework
            </h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="hw-course" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Course name</label>
                <input
                  id="hw-course"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="hw-assignment" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Assignment name</label>
                <input
                  id="hw-assignment"
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="hw-due" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Due date</label>
                <input
                  id="hw-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="hw-estimated-hours" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#444444' }}>Estimated time to finish (hours, optional)</label>
                <input
                  id="hw-estimated-hours"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 2"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
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
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDoneConfirm && homeworkToMarkDone && (
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
          onClick={() => setShowDoneConfirm(false)}
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
              Mark as done?
            </h3>
            <p style={{ fontSize: 16, color: '#444444', margin: '0 0 24px' }}>
              Mark <strong>{homeworkToMarkDone.assignmentName}</strong> as done?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowDoneConfirm(false); setHomeworkToMarkDone(null) }}
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
              <button type="button" onClick={confirmMarkAsDone} className="btn-primary">
                Mark done
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 40,
          minHeight: 'calc(100vh - 72px)',
          paddingBottom: 110,
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
              Homework
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
              {loading ? 'Loading…' : homeworks.length === 0 ? 'No homework yet.' : `${homeworks.length} homework${homeworks.length === 1 ? '' : 's'}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="btn-primary"
            style={{ border: '2px solid #111111' }}
          >
            Add homework
          </button>
        </div>

        {homeworks.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: '#666666', marginBottom: 8 }}>
            No homework yet, add one.
          </p>
        ) : null}
        {(() => {
          const unfinished = sortedHomeworks.filter((h) => h.status !== 'done')
          const done = sortedHomeworks.filter((h) => h.status === 'done')
          const rowProps = {
            editingHw,
            editHwText,
            updatingId,
            startEditHw,
            saveHwField,
            cancelEditHw,
            setEditHwText,
            removeHomework,
          }
          return (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHomeworkDragEnd}>
                <SortableContext items={unfinished.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {unfinished.map((hw) => {
                      const d = daysLeft(hw.dueDate)
                      const daysLabel =
                        d > 0
                          ? `${d} day${d === 1 ? '' : 's'} left`
                          : d === 0
                            ? 'Due today'
                            : `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`
                      const urgency = urgencyColor(d)
                      return (
                        <HomeworkSortableRow
                          key={hw.id}
                          hw={hw}
                          daysLabel={daysLabel}
                          urgency={urgency}
                          setStatus={setStatus}
                          setHomeworkToMarkDone={setHomeworkToMarkDone}
                          setShowDoneConfirm={setShowDoneConfirm}
                          {...rowProps}
                        />
                      )
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {done.map((hw) => {
                  const d = daysLeft(hw.dueDate)
                  const daysLabel =
                    d > 0
                      ? `${d} day${d === 1 ? '' : 's'} left`
                      : d === 0
                        ? 'Due today'
                        : `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`
                  return <HomeworkDoneRow key={hw.id} hw={hw} daysLabel={daysLabel} {...rowProps} />
                })}
              </ul>
            </>
          )
        })()}
      </main>
    </>
  )
}
