import { NextRequest, NextResponse } from 'next/server'
import { checkEmailExists } from '@/lib/storage/hybrid-storage'

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
    
    const result = await checkEmailExists(email)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        exists: result.exists,
        fortune: result.fortune
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to check email',
        message: result.message
      }, { status: 500 })
    }
    
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking email:', error)
    }
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}