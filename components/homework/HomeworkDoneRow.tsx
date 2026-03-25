'use client'

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
  editingHw: { id: string; field: 'assignment' | 'course' } | null
  editHwText: string
  updatingId: string | null
  startEditHw: (hw: Homework, field: 'assignment' | 'course') => void
  saveHwField: () => void
  cancelEditHw: () => void
  setEditHwText: (v: string) => void
  removeHomework: (id: string) => void
}

export function HomeworkDoneRow({
  hw,
  daysLabel,
  editingHw,
  editHwText,
  updatingId,
  startEditHw,
  saveHwField,
  cancelEditHw,
  setEditHwText,
  removeHomework,
}: Props) {
  return (
    <li
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
      <div
        style={{
          width: 22,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#111111', fontSize: 18 }} aria-hidden>✓</span>
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
              textDecoration: 'line-through',
              opacity: 0.7,
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
        <span style={{ fontSize: 13, marginLeft: 8, color: '#666666', fontWeight: 600 }}>{daysLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#666666', textTransform: 'uppercase' }}>Done</span>
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
