// Consolidated Admin API - handles login, data retrieval, and basic admin operations
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { getAllFortunes, deleteFortune, clearAllFortunes, verifyAdminPassword, changeAdminPassword } from '@/lib/storage/hybrid-storage'
import { generateAdminToken, authenticateAdmin, refreshTokenIfNeeded } from '@/lib/auth'
import { getStorageMode, getEnvironmentInfo } from '@/lib/environment'

// --- TYPES ---

interface AdminActionBody {
  action: 'login' | 'delete' | 'clear-all' | 'change-password'
  password?: string
  id?: string
  currentPassword?: string
  newPassword?: string
}

// --- ACTION HANDLERS ---

async function handleLogin(body: AdminActionBody) {
  const { password } = body
  if (!password) return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 })

  const isValid = await verifyAdminPassword(password)
  if (isValid) {
    return NextResponse.json({ 
      success: true, 
      message: 'Login successful', 
      token: generateAdminToken(),
      storageMode: getStorageMode()
    })
  }
  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
}

async function handleDelete(body: AdminActionBody) {
  const { id } = body
  if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
  const result = await deleteFortune(id)
  return NextResponse.json(result)
}

async function handleClearAll() {
  const result = await clearAllFortunes()
  return NextResponse.json(result)
}

async function handleChangePassword(body: AdminActionBody) {
  const { currentPassword, newPassword } = body
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, error: 'Both current and new passwords required' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 })
  }

  // Double verification for security
  if (!(await verifyAdminPassword(currentPassword))) {
    return NextResponse.json({ success: false, error: 'Current password incorrect' }, { status: 401 })
  }

  if (await changeAdminPassword(newPassword)) {
    return NextResponse.json({ success: true, message: 'Password changed successfully', token: generateAdminToken() })
  }
  return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 })
}

// --- MAIN API HANDLERS ---

// GET: Retrieve all fortune data (requires auth)
export async function GET(request: NextRequest) {
  try {
    const tokenPayload = authenticateAdmin(request)
    if (!tokenPayload) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const result = await getAllFortunes()
    const response = NextResponse.json({
      ...result,
      storageMode: getStorageMode()
    })

    const newToken = refreshTokenIfNeeded(tokenPayload)
    if (newToken) response.headers.set('X-New-Token', newToken)

    return response
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve data'
    }, { status: 500 })
  }
}

// POST: Dispatcher for Admin operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AdminActionBody
    const { action } = body

    // 1. Actions that DON'T require auth
    if (action === 'login') return await handleLogin(body)

    // 2. Actions that REQUIRE auth
    const tokenPayload = authenticateAdmin(request)
    if (!tokenPayload) return NextResponse.json({ success: false, error: 'Authorization required' }, { status: 401 })

    switch (action) {
      case 'delete': return await handleDelete(body)
      case 'clear-all': return await handleClearAll()
      case 'change-password': return await handleChangePassword(body)
      default: return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Admin operation failed'
    }, { status: 500 })
  }
}