'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandleDots } from '@/components/DragHandleDots'

type Homework = {
  id: string
  courseName: string
  assignmentName: string
  dueDate: string
  status: 'not_started' | 'in_progress' | 'done'
  estimatedHours?: number
}

type Props = {
  hw: Homework
  daysLabel: string
  urgency: string
  editingHw: { id: string; field: 'assignment' | 'course' } | null
  editHwText: string
  updatingId: string | null
  startEditHw: (hw: Homework, field: 'assignment' | 'course') => void
  saveHwField: () => void
  cancelEditHw: () => void
  setEditHwText: (v: string) => void
  setStatus: (id: string, status: Homework['status']) => void
  setHomeworkToMarkDone: (hw: Homework | null) => void
  setShowDoneConfirm: (v: boolean) => void
  removeHomework: (id: string) => void
}

export function HomeworkSortableRow({
  hw,
  daysLabel,
  urgency,
  editingHw,
  editHwText,
  updatingId,
  startEditHw,
  saveHwField,
  cancelEditHw,
  setEditHwText,
  setStatus,
  setHomeworkToMarkDone,
  setShowDoneConfirm,
  removeHomework,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: hw.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: '12px 16px',
    border: '2px solid #111111',
    background: '#ffffff',
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
  }

  return (
    <li ref={setNodeRef} style={style}>
      <div
        style={{
          width: 22,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          {...listeners}
          {...attributes}
          style={{
            touchAction: 'none',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Drag to reorder"
        >
          <DragHandleDots />
        </button>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {editingHw?.id === hw.id && editingHw.field === 'assignment' ? (
          <input
            type="text"
            value={editHwText}
            onChange={(e) => setEditHwText(e.target.value)}
            onBlur={saveHwField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveHwField()
              }
              if (e.key === 'Escape') cancelEditHw()
            }}
            autoFocus
            disabled={updatingId === hw.id}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#111111',
              padding: '4px 8px',
              border: '2px solid #111111',
              background: '#fff',
              font: 'inherit',
              minWidth: 120,
              flex: '1 1 140px',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => startEditHw(hw, 'assignment')}
            disabled={updatingId === hw.id}
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#111111',
              padding: 0,
              border: 'none',
              background: 'none',
              font: 'inherit',
              cursor: 'text',
              textAlign: 'left',
            }}
          >
            {hw.assignmentName}
          </button>
        )}
        <span
          aria-hidden
          style={{
            color: '#d4d4d4',
            fontSize: 18,
            fontWeight: 300,
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          |
        </span>
        {editingHw?.id === hw.id && editingHw.field === 'course' ? (
          <input
            type="text"
            value={editHwText}
            onChange={(e) => setEditHwText(e.target.value)}
            onBlur={saveHwField}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                saveHwField()
              }
              if (e.key === 'Escape') cancelEditHw()
            }}
            autoFocus
            disabled={updatingId === hw.id}
            style={{
              fontSize: 12,
              color: '#888888',
              padding: '4px 8px',
              border: '2px solid #111111',
              background: '#fff',
              font: 'inherit',
              fontWeight: 400,
              minWidth: 100,
              flex: '1 1 120px',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => startEditHw(hw, 'course')}
            disabled={updatingId === hw.id}
            style={{
              fontSize: 12,
              color: '#888888',
              fontWeight: 400,
              padding: 0,
              border: 'none',
              background: 'none',
              font: 'inherit',
              cursor: 'text',
              textAlign: 'left',
            }}
          >
            {hw.courseName}
          </button>
        )}
        <span style={{ fontSize: 13, marginLeft: 8, color: urgency, fontWeight: 600 }}>{daysLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['not_started', 'in_progress'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(hw.id, s)}
              disabled={updatingId === hw.id}
              style={{
                padding: '6px 12px',
                border: '2px solid #111111',
                background: hw.status === s ? '#FF6A00' : '#ffffff',
                color: hw.status === s ? '#ffffff' : '#111111',
                font: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: updatingId === hw.id ? 'not-allowed' : 'pointer',
              }}
            >
              {s === 'not_started' ? 'Not started' : 'In progress'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setHomeworkToMarkDone(hw)
              setShowDoneConfirm(true)
            }}
            disabled={updatingId === hw.id}
            style={{
              padding: '6px 12px',
              border: '2px solid #111111',
              background: '#ffffff',
              color: '#111111',
              font: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: updatingId === hw.id ? 'not-allowed' : 'pointer',
            }}
          >
            Mark as done
          </button>
        </div>
        <button
          type="button"
          onClick={() => removeHomework(hw.id)}
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
            cursor: 'pointer',
          }}
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    </li>
  )
}
