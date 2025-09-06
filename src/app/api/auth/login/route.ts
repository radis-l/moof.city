import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getAdminPasswordHash, initializeAdminPassword } from '@/lib/storage/admin-config-storage'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      console.log('Login attempt failed: No password provided')
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    // Initialize default password if none exists
    const initialized = await initializeAdminPassword('Punpun12')
    console.log('Password initialization:', initialized ? 'Created new password' : 'Password already exists')

    // Get current password hash from database
    const ADMIN_PASSWORD_HASH = await getAdminPasswordHash()

    if (!ADMIN_PASSWORD_HASH) {
      console.error('Login failed: No password hash found in storage')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('Password hash found:', ADMIN_PASSWORD_HASH?.substring(0, 20) + '...', 'proceeding with verification')
    
    // Log environment info for debugging
    const isProduction = Boolean(process.env.NODE_ENV === 'production' || process.env.VERCEL)
    const tableName = isProduction ? 'prod_admin_config' : 'dev_admin_config'
    console.log('Environment - isProduction:', isProduction, 'tableName:', tableName)

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
      console.log('Setting cookie - Production:', isProduction, 'Environment:', process.env.NODE_ENV, 'Vercel:', !!process.env.VERCEL)
      
      response.cookies.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict', // 'none' for production HTTPS
        expires: expiresAt,
        path: '/',
        domain: isProduction ? undefined : 'localhost' // Let browser handle production domain
      })
      
      console.log('Login successful - Cookie set')
      return response
    } else {
      console.log('Login failed: Invalid password')
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