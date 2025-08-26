import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionCookie = request.cookies.get('admin-session')
    if (!sessionCookie?.value || sessionCookie.value.length !== 64) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new passwords are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const currentHash = process.env.ADMIN_PASSWORD_HASH || 
      // Fallback hash for testing (should match login)
      '$2b$12$EF2GHQN6FRmUQ8KbpdJ3oOv9s0CMgjMmDK54cDL650Ku2ifK7bGdq'
    
    console.log('Change password attempt - hash exists:', !!currentHash)
    
    if (!currentHash) {
      console.log('No password hash available')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Generate new hash
    const newHash = await bcrypt.hash(newPassword, 12)

    // Update .env.local file
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8')
    } catch {
      return NextResponse.json(
        { success: false, message: 'Could not read environment file' },
        { status: 500 }
      )
    }

    // Replace the password hash line
    const updatedContent = envContent.replace(
      /ADMIN_PASSWORD_HASH=.*/,
      `ADMIN_PASSWORD_HASH=${newHash}`
    )

    try {
      fs.writeFileSync(envPath, updatedContent, 'utf8')
    } catch {
      return NextResponse.json(
        { success: false, message: 'Could not update environment file' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password changed successfully. Please restart the server for changes to take effect.' 
      },
      { status: 200 }
    )

  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}