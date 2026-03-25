'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandleDots } from '@/components/DragHandleDots'

type Topic = { id: string; label: string; difficulty: 'hard' | 'medium' | 'easy' }

type Props = {
  topic: Topic
  editingTopicId: string | null
  editingLabel: string
  setEditingLabel: (v: string) => void
  saveEditingTopic: () => void
  cancelEditingTopic: () => void
  startEditingTopic: (t: Topic) => void
  setTopicDifficulty: (id: string, d: 'hard' | 'medium' | 'easy') => void
  removeTopic: (id: string) => void
  saving: boolean
}

export function TopicSortableRow({
  topic,
  editingTopicId,
  editingLabel,
  setEditingLabel,
  saveEditingTopic,
  cancelEditingTopic,
  startEditingTopic,
  setTopicDifficulty,
  removeTopic,
  saving,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: topic.id,
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
}
