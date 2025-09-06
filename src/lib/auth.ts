import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production'
const TOKEN_EXPIRY = '24h' // 24 hour session

interface AdminTokenPayload {
  role: 'admin'
  issuedAt: number
  expiresAt: number
}

export const generateAdminToken = (): string => {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminTokenPayload = {
    role: 'admin',
    issuedAt: now,
    expiresAt: now + (24 * 60 * 60) // 24 hours
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export const verifyAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
    
    // Additional validation
    if (decoded.role !== 'admin') {
      return null
    }
    
    // Check if token is expired (double check)
    const now = Math.floor(Date.now() / 1000)
    if (decoded.expiresAt < now) {
      return null
    }
    
    return decoded
  } catch {
    // Invalid token or expired
    return null
  }
}

export const extractTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.replace('Bearer ', '')
}

export const authenticateAdmin = (request: NextRequest): AdminTokenPayload | null => {
  const token = extractTokenFromRequest(request)
  
  if (!token) {
    return null
  }
  
  return verifyAdminToken(token)
}

export const isTokenExpiringSoon = (token: AdminTokenPayload): boolean => {
  const now = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = token.expiresAt - now
  const oneHour = 60 * 60
  
  // Token expires in less than 1 hour
  return timeUntilExpiry < oneHour
}

export const refreshTokenIfNeeded = (token: AdminTokenPayload): string | null => {
  if (isTokenExpiringSoon(token)) {
    return generateAdminToken()
  }
  
  return null
}