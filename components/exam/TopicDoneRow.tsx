'use client'

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

export function TopicDoneRow({
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
            textDecoration: 'line-through',
            opacity: 0.7,
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
