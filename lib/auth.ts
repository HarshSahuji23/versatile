import crypto from 'crypto'
import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'admin_session'
const SECRET_KEY =
  process.env.ADMIN_SESSION_SECRET ||
  'varshas-versatile-admin-secret-key-salt-2026-production-token'

const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

// --------------------------------------------------------
// Password Hashing & Verification
// --------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false

  // If already hashed with scrypt
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const salt = parts[1]
    const originalHash = Buffer.from(parts[2], 'hex')
    const testHash = crypto.scryptSync(password, salt, 64)
    if (originalHash.length !== testHash.length) return false
    return crypto.timingSafeEqual(originalHash, testHash)
  }

  // Fallback for legacy plaintext password
  const bufferA = Buffer.from(password)
  const bufferB = Buffer.from(stored)
  if (bufferA.length !== bufferB.length) return false
  return crypto.timingSafeEqual(bufferA, bufferB)
}

// --------------------------------------------------------
// Session Token Generation & Verification (HMAC-SHA256)
// --------------------------------------------------------

interface SessionPayload {
  email: string
  exp: number
  iat: number
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return Buffer.from(str, 'base64').toString('utf-8')
}

function signString(data: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('base64url')
}

export function createSessionToken(email: string): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  }
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const signature = signString(payloadEncoded)
  return `${payloadEncoded}.${signature}`
}

export function verifySessionToken(token?: string | null): { valid: boolean; email?: string } {
  if (!token || typeof token !== 'string') return { valid: false }

  const parts = token.split('.')
  if (parts.length !== 2) return { valid: false }

  const [payloadEncoded, signature] = parts
  const expectedSignature = signString(payloadEncoded)

  const sigA = Buffer.from(signature)
  const sigB = Buffer.from(expectedSignature)
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return { valid: false }
  }

  try {
    const payload: SessionPayload = JSON.parse(base64UrlDecode(payloadEncoded))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return { valid: false } // Expired
    }
    return { valid: true, email: payload.email }
  } catch {
    return { valid: false }
  }
}

// --------------------------------------------------------
// Cookie & Request Helpers
// --------------------------------------------------------

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  const list: Record<string, string> = {}
  if (!cookieHeader) return list
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=')
    if (parts.length >= 2) {
      const name = parts[0].trim()
      const val = parts.slice(1).join('=').trim()
      list[name] = decodeURIComponent(val)
    }
  })
  return list
}

export function getAdminSession(req: Request): { valid: boolean; email?: string } {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    const result = verifySessionToken(token)
    if (result.valid) return result
  }

  // 2. Check Cookie header: admin_session=<token>
  const cookieHeader = req.headers.get('cookie')
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies[SESSION_COOKIE_NAME]
  if (sessionToken) {
    const result = verifySessionToken(sessionToken)
    if (result.valid) return result
  }

  return { valid: false }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY_SECONDS,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
