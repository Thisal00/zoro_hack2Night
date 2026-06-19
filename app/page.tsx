import Link from 'next/link'

export default function Home() {
  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z' },
    { label: 'Accounts', path: '/bank-accounts', icon: 'M4 4h16v16H4z M4 9h16' },
    { label: 'Bank Transfer', path: '/bank-transfer', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'Pay Bills', path: '/pay-bills', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-slate-900 overflow-hidden relative font-sans">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-orange-200/40 blur-[140px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex size-20 items-center justify-center rounded-2xl bg-orange-100 text-[#e65a28] shadow-md border border-orange-200">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-10">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </div>
        
        <h1 className="mb-5 text-6xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm text-center">
          Nova <span className="text-[#e65a28]">Bank</span>
        </h1>
        <p className="mb-14 text-xl font-medium text-slate-600 max-w-2xl text-center leading-relaxed">
          Simplicity in every transaction. Manage your finances effortlessly through our secure, minimalist ecosystem.
        </p>

        {/* Primary Actions */}
        <div className="mb-16 flex flex-wrap justify-center gap-5">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-xl bg-[#e65a28] px-8 py-4 text-lg font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d44d1e] hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30"
          >
            Access Terminal
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            Create Account
          </Link>
        </div>
        
        {/* Quick Links Grid */}
        <div className="w-full max-w-3xl">
          <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Quick Modules
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {links.map((link) => (
              <Link 
                key={link.label} 
                href={link.path}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:bg-orange-50 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md"
              >
                <svg className="size-7 text-slate-400 transition-colors group-hover:text-[#e65a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span className="text-sm font-semibold text-slate-600 transition-colors group-hover:text-[#e65a28] text-center">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
