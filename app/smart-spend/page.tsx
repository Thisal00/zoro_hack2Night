// Trigger hot reload
import Link from 'next/link'

export default function SmartSpendPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Spend</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the Smart Spend page!
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  )
}
