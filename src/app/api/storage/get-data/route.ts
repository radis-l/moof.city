import { NextResponse } from 'next/server'
import { getAllFortuneData } from '@/lib/storage/hybrid-storage'

// Get all fortune data from local file storage
export async function GET() {
  try {
    const result = await getAllFortuneData()
    
    return NextResponse.json({
      success: result.success,
      data: result.data,
      totalRecords: result.totalRecords,
      message: result.message
    }, { status: result.success ? 200 : 500 })
    
  } catch (error: unknown) {
    console.error('Error retrieving data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      totalRecords: 0,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}