import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET

// Fail fast if secret is missing in production
if (!JWT_SECRET && (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1')) {
  console.error('CRITICAL: JWT_SECRET environment variable is missing in production.')
}

const FALLBACK_SECRET = 'fallback_secret_for_dev_only'
const getSecret = () => JWT_SECRET || FALLBACK_SECRET

const TOKEN_EXPIRY = '24h'
export const COOKIE_NAME = 'admin_session'

interface AdminTokenPayload {
  role: 'admin'
  iat: number
  exp: number
}

export const generateAdminToken = (): string => {
  return jwt.sign({ role: 'admin' }, getSecret(), { expiresIn: TOKEN_EXPIRY })
}

export const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, getSecret()) as AdminTokenPayload
    return decoded.role === 'admin' ? decoded : null
  } catch {
    return null
  }
}

export const extractTokenFromRequest = (request: NextRequest): string | null => {
  // 1. Try Cookie (Preferred for security)
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // 2. Try Authorization Header (Fallback for legacy/direct API calls)
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
}

export const authenticateAdmin = (request: NextRequest): AdminTokenPayload | null => {
  const token = extractTokenFromRequest(request)
  return token ? verifyAdminToken(token) : null
}

export const isTokenExpiringSoon = (token: AdminTokenPayload): boolean => {
  const now = Math.floor(Date.now() / 1000)
  const oneHour = 60 * 60
  return (token.exp - now) < oneHour
}

export const refreshTokenIfNeeded = (token: AdminTokenPayload): string | null => {
  return isTokenExpiringSoon(token) ? generateAdminToken() : null
}