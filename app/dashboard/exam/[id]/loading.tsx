export default function ExamLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '2px solid rgba(255, 106, 0, 0.2)',
          borderTopColor: '#FF6A00',
          borderRadius: '50%',
          animation: 'planner-spin 0.8s linear infinite',
        }}
        aria-hidden
      />
    </div>
  )
}
