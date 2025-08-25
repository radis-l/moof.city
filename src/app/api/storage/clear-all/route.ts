import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FORTUNE_FILE = path.join(DATA_DIR, 'fortune-data.json')

// Clear all fortune data
export async function DELETE() {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    
    // Write empty array to file
    fs.writeFileSync(FORTUNE_FILE, '[]')
    
    return NextResponse.json({
      success: true,
      message: 'All fortune data cleared successfully'
    }, { status: 200 })
    
  } catch (error: unknown) {
    console.error('Error clearing all data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}