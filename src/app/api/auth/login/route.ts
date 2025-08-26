import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Get password hash at runtime to ensure environment variables are loaded
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
      // Fallback hash for testing (remove in production)
      '$2b$12$EF2GHQN6FRmUQ8KbpdJ3oOv9s0CMgjMmDK54cDL650Ku2ifK7bGdq'

    // Debug logging
    console.log('Login attempt:', { passwordLength: password?.length })
    console.log('Environment hash exists:', !!ADMIN_PASSWORD_HASH)
    console.log('Environment hash preview:', ADMIN_PASSWORD_HASH?.substring(0, 10) + '...')
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('ADMIN')))

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password required' },
        { status: 400 }
      )
    }

    if (!ADMIN_PASSWORD_HASH) {
      console.log('Missing ADMIN_PASSWORD_HASH environment variable')
      console.log('Available env vars:', Object.keys(process.env).slice(0, 10))
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
      response.cookies.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt,
        path: '/'
      })
      
      return response
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}