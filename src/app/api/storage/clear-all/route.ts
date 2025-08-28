import { NextResponse } from 'next/server'
import { clearAllFortuneData } from '@/lib/storage/hybrid-storage'

// Clear all fortune data
export async function DELETE() {
  try {
    const result = await clearAllFortuneData()
    
    return NextResponse.json({
      success: result.success,
      message: result.message
    }, { status: result.success ? 200 : 500 })
    
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error clearing all data:', error)
    }
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}