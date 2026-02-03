import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production'
const TOKEN_EXPIRY = '24h'

interface AdminTokenPayload {
  role: 'admin'
  iat: number
  exp: number
}

export const generateAdminToken = (): string => {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
    return decoded.role === 'admin' ? decoded : null
  } catch {
    return null
  }
}

export const extractTokenFromRequest = (request: NextRequest): string | null => {
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