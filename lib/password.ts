import crypto from 'node:crypto'
import { promisify } from 'node:util'

// Password hashing with scrypt (built-in, memory-hard KDF). Stored format:
//   scrypt$<saltHex>$<hashHex>
const scrypt = promisify(crypto.scrypt)
const KEY_LENGTH = 64
const SALT_BYTES = 16
const PREFIX = 'scrypt'

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES)
  const derived = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer
  return `${PREFIX}$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (!stored || !stored.startsWith(`${PREFIX}$`)) return false
  const [, saltHex, hashHex] = stored.split('$')
  if (!saltHex || !hashHex) return false

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const derived = (await scrypt(plain, salt, expected.length)) as Buffer
  if (derived.length !== expected.length) return false
  return crypto.timingSafeEqual(derived, expected)
}

export function isHashed(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`)
}
