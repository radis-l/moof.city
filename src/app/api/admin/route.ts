// Consolidated Admin API - handles login, data retrieval, and basic admin operations
import { NextRequest, NextResponse } from 'next/server'
import { getAllFortunes, deleteFortune, clearAllFortunes, verifyAdminPassword } from '@/lib/simple-storage'

// GET: Retrieve all fortune data (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Simple auth check via header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    // For simplicity, just check if password is correct (in production, use proper JWT)
    const password = authHeader.replace('Bearer ', '')
    const isValid = await verifyAdminPassword(password)
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const result = await getAllFortunes()
    return NextResponse.json(result)
  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve data' 
    }, { status: 500 })
  }
}

// POST: Admin login
export async function POST(request: NextRequest) {
  try {
    const { action, password, id } = await request.json()
    
    // Login action
    if (action === 'login') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 })
      }
      
      const isValid = await verifyAdminPassword(password)
      
      if (isValid) {
        return NextResponse.json({ 
          success: true, 
          message: 'Login successful',
          token: password // Simplified: return password as token for dev
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid password' 
        }, { status: 401 })
      }
    }
    
    // Delete single fortune (requires auth)
    if (action === 'delete') {
      const isValid = await verifyAdminPassword(password)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
      }
      
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
      }
      
      const result = await deleteFortune(id)
      return NextResponse.json(result)
    }
    
    // Clear all fortunes (requires auth)
    if (action === 'clear-all') {
      const isValid = await verifyAdminPassword(password)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
      }
      
      const result = await clearAllFortunes()
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Admin operation failed' 
    }, { status: 500 })
  }
}