import { buildClearedSessionCookie } from '@/lib/session'

export async function POST() {
  const headers = new Headers()
  headers.append('set-cookie', buildClearedSessionCookie())
  return Response.json({ ok: true }, { headers })
}
