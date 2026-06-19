import crypto from 'node:crypto'

// Signed, server-validated sessions. The session payload is HMAC-SHA256
// signed with SESSION_SECRET, so a client cannot forge identity or role.
export const COOKIE_NAME = 'session'
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export type Session = { sub: number; role: string }

function secret() {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short (min 16 chars)')
  }
  return value
}

function sign(data: string) {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url')
}

function now() {
  return Math.floor(Date.now() / 1000)
}

export function createSessionToken(user: { id: number; role: string }) {
  const payload = {
    sub: user.id,
    role: user.role,
    iat: now(),
    exp: now() + MAX_AGE_SECONDS
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifySessionToken(token: string | undefined): Session | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  // Constant-time signature check.
  const expected = sign(body)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  let payload: { sub?: unknown; role?: unknown; exp?: unknown }
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (typeof payload.sub !== 'number' || typeof payload.role !== 'string') {
    return null
  }
  if (typeof payload.exp !== 'number' || payload.exp < now()) return null

  return { sub: payload.sub, role: payload.role }
}

export function buildSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`
}

// Expire the session cookie immediately (logout). Same attributes as the
// session cookie so the browser reliably overwrites and drops it.
export function buildClearedSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secure} SameSite=Strict; Max-Age=0`
}

function readSessionCookie(request: Request): string | undefined {
  const header = request.headers.get('cookie') || ''
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    if (part.slice(0, i).trim() === COOKIE_NAME) {
      return decodeURIComponent(part.slice(i + 1).trim())
    }
  }
  return undefined
}

export function getSession(request: Request): Session | null {
  return verifySessionToken(readSessionCookie(request))
}
