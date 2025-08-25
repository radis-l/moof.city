import { NextRequest, NextResponse } from 'next/server'
import { getRecentFortuneData } from '@/lib/storage/file-storage'

// Get recent fortune data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 10
    
    const result = await getRecentFortuneData(limit)
    
    return NextResponse.json({
      success: result.success,
      data: result.data,
      totalRecords: result.data.length,
      message: result.message
    }, { status: result.success ? 200 : 500 })
    
  } catch (error: unknown) {
    console.error('Error retrieving recent data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      totalRecords: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}