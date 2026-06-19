'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "var(--font-bai, 'Bai Jamjuree'), system-ui, sans-serif"
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>
        Something went wrong
      </h1>
      <p style={{ color: '#555', maxWidth: '28rem' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: '0.5rem',
          background: '#9a5c97',
          color: 'white',
          fontWeight: 600,
          padding: '0.85rem 2rem',
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </main>
  )
}
