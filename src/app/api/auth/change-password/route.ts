import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminPasswordHash, setAdminPasswordHash } from '@/lib/storage/unified-storage'

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

    // Get current password hash from database
    const currentHash = await getAdminPasswordHash()
    
    if (!currentHash) {
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

    // Save new password to database
    const success = await setAdminPasswordHash(newPassword)
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Could not update password' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password changed successfully!' 
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