import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getAdminPasswordHash, initializeAdminPassword } from '@/lib/storage/admin-config-storage'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    // Initialize default password if none exists
    await initializeAdminPassword('Punpun12')

    // Get current password hash from database
    const ADMIN_PASSWORD_HASH = await getAdminPasswordHash()

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use bcrypt to compare password with hash
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    
    if (isValidPassword) {
      // Create a session token
      const sessionToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      const response = NextResponse.json(
        { success: true, message: 'Authentication successful' },
        { status: 200 }
      )
      
      // Set secure HTTP-only cookie
      const isProduction = Boolean(process.env.NODE_ENV === 'production' || process.env.VERCEL)
      
      response.cookies.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        expires: expiresAt,
        path: '/',
        domain: isProduction ? undefined : 'localhost'
      })
      
      return response
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}