export default function DashboardLoading() {
  return (
    <>
      <header
        style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #111111',
          padding: '0 32px',
          background: '#ffffff',
        }}
      >
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#111111',
            textDecoration: 'none',
            fontFamily: 'var(--font-logo), sans-serif',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          EXAMIO
        </a>
      </header>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)',
          padding: 24,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(255, 106, 0, 0.2)',
            borderTopColor: '#FF6A00',
            borderRadius: '50%',
            animation: 'planner-spin 0.8s linear infinite',
          }}
          aria-hidden
        />
      </div>
    </>
  )
}
