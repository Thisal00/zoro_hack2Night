export default function AccountsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-auto bg-slate-50 px-4 py-8 font-geist sm:px-8">
      {/* Subtle background glow effect matching the login/landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-[1176px]">{children}</div>
    </main>
  )
}
