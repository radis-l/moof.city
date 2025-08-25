import { NextResponse } from 'next/server'
import { exportToCSV } from '@/lib/storage/hybrid-storage'

// Export fortune data as CSV
export async function GET() {
  try {
    const result = await exportToCSV()
    
    if (result.success && result.csvData) {
      return new NextResponse(result.csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fortune-data.csv"'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        message: 'Failed to export data'
      }, { status: 500 })
    }
    
  } catch (error: unknown) {
    console.error('Error exporting data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}