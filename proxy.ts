import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Optimistic auth gate. This only checks for the presence of the session
// cookie to drive redirects — it does NOT verify the signature (that requires
// node:crypto, which isn't available in the edge runtime). Real authorization
// is enforced server-side in every /api route via getSession(). A forged cookie
// gets past this redirect but still gets 401s from the API and sees no data.
const COOKIE_NAME = 'session'

const PROTECTED = [
  '/dashboard',
  '/bank-accounts',
  '/bank-transfer',
  '/pay-bills',
  '/smart-spend',
  '/e-statement',
  '/profile'
]

const AUTH_PAGES = ['/login', '/sign-up']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value)

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (AUTH_PAGES.includes(pathname) && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/bank-accounts/:path*',
    '/bank-transfer/:path*',
    '/pay-bills/:path*',
    '/smart-spend/:path*',
    '/e-statement/:path*',
    '/profile/:path*',
    '/login',
    '/sign-up'
  ]
}
