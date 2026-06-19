import Link from 'next/link'

export default function NotFound() {
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
      <p style={{ fontSize: '4rem', fontWeight: 800, color: '#450043' }}>404</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>
        Page not found
      </h1>
      <p style={{ color: '#555', maxWidth: '28rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: '0.5rem',
          background: '#9a5c97',
          color: 'white',
          fontWeight: 600,
          padding: '0.85rem 2rem',
          borderRadius: '999px',
          textDecoration: 'none'
        }}
      >
        Back to Dashboard
      </Link>
    </main>
  )
}
