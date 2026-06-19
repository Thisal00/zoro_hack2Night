import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if there is an auth-session cookie
  const session = request.cookies.get('auth-session')

  if (!session) {
    // If user is not authenticated, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url))
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
    '/settings/:path*'
  ]
}
