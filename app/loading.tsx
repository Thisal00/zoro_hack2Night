export default function Loading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        background: '#f1f1f1',
        fontFamily: "var(--font-bai, 'Bai Jamjuree'), system-ui, sans-serif"
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e7e1e8',
          borderTopColor: '#9a5c97',
          borderRadius: '50%',
          animation: 'nb-spin 0.8s linear infinite'
        }}
      />
      <p style={{ color: '#555', fontWeight: 600 }}>Loading…</p>
      <style>{`@keyframes nb-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
