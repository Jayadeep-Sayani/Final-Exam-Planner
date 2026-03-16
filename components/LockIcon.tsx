export function LockIcon({ size = 24 }: { size?: number }) {
  const stroke = Math.max(2, size * 0.12)
  const bodyW = size * 0.52
  const bodyH = size * 0.58
  const shackleW = size * 0.9
  const shackleH = size * 0.22
  return (
    <div
      style={{
        position: 'relative',
        width: shackleW,
        height: size,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: shackleW, height: stroke, background: '#FF6A00' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: shackleW, marginTop: -1 }}>
          <div style={{ width: stroke, height: shackleH, background: '#FF6A00' }} />
          <div style={{ width: stroke, height: shackleH, background: '#FF6A00' }} />
        </div>
      </div>
      <div
        style={{
          width: bodyW,
          height: bodyH,
          background: '#FF6A00',
          margin: '-1px auto 0',
        }}
      />
    </div>
  )
}
