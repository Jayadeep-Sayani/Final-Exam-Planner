'use client'

export function SubtleBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#f2f2f2',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at center, #FF6A00 2px, transparent 2px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '12px 12px',
          opacity: 0.14,
        }}
      />
    </div>
  )
}
