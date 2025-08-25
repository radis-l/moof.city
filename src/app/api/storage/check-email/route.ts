import { NextRequest, NextResponse } from 'next/server'
import { getAllFortuneData } from '@/lib/storage/file-storage'

// Check if email exists and return latest fortune
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }
    
    const result = await getAllFortuneData()
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data'
      }, { status: 500 })
    }
    
    // Find entry with matching email
    const userEntry = result.data.find(entry => entry.userData.email === email)
    
    if (userEntry) {
      return NextResponse.json({
        success: true,
        exists: true,
        fortune: userEntry
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: true,
        exists: false
      }, { status: 200 })
    }
    
  } catch (error: unknown) {
    console.error('Error checking email:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}