import { NextRequest, NextResponse } from 'next/server'
import { saveFortuneData } from '@/lib/storage/hybrid-storage'
import { validateFortuneForm } from '@/lib/validation'
import type { FortuneResult } from '@/types'

// Save fortune data to local file storage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData, fortuneResult } = body
    
    // Validate user data
    const validation = validateFortuneForm(userData)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user data',
        details: validation.error
      }, { status: 400 })
    }
    
    // Validate fortune result structure
    if (!fortuneResult || !fortuneResult.luckyNumber || !fortuneResult.relationship) {
      return NextResponse.json({
        success: false,
        error: 'Invalid fortune result data'
      }, { status: 400 })
    }
    
    // Save to local file storage  
    if (!validation.data) {
      return NextResponse.json({
        success: false,
        error: 'Validation data is undefined'
      }, { status: 400 })
    }
    
    const result = await saveFortuneData(validation.data, fortuneResult as FortuneResult)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        id: result.id
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        message: 'Failed to save fortune data'
      }, { status: 500 })
    }
    
  } catch (error: unknown) {
    console.error('Error saving fortune data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}