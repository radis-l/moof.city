import { NextRequest, NextResponse } from 'next/server'
import { deleteFortuneData } from '@/lib/storage/hybrid-storage'

// Delete fortune data by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID parameter is required'
      }, { status: 400 })
    }
    
    const result = await deleteFortuneData(id)
    
    return NextResponse.json({
      success: result.success,
      message: result.message
    }, { status: result.success ? 200 : 404 })
    
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting data:', error)
    }
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}