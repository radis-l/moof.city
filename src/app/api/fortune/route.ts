// Consolidated Fortune API - handles both email checking and fortune saving
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { generateFortune } from '@/lib/fortune-generator'
import { checkEmail, saveFortune } from '@/lib/storage/hybrid-storage'
import type { UserData } from '@/types'

// GET: Check if email exists and return existing fortune
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const result = await checkEmail(email)
    return NextResponse.json(result)
  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check email' 
    }, { status: 500 })
  }
}

// POST: Generate and save new fortune
export async function POST(request: NextRequest) {
  try {
    const userData: UserData = await request.json()
    
    // Validate required fields
    if (!userData.email || !userData.ageRange || !userData.birthDay || !userData.bloodGroup) {
      return NextResponse.json({ 
        success: false, 
        error: 'All fields are required' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingResult = await checkEmail(userData.email)
    if (existingResult.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'อีเมลนี้เคยทำนายแล้ว', 
        existingFortune: existingResult.fortune 
      }, { status: 409 })
    }

    // Generate new fortune
    const fortuneResult = generateFortune(userData)
    
    // Save to database
    const saveResult = await saveFortune(userData, fortuneResult)
    
    if (!saveResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: saveResult.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fortune: fortuneResult,
      id: saveResult.id
    })
  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate fortune' 
    }, { status: 500 })
  }
}