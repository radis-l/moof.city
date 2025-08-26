'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MoofLogo } from '@/assets/logo'
import { MobileLayout } from '@/components/layout'
import { generateFortune } from '@/lib/fortune-generator'
import type { UserData, FortuneResult } from '@/types'

function FortuneResultPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [fortune, setFortune] = useState<FortuneResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const saveAttempted = useRef(false)

  const loadExistingFortune = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/storage/check-email?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      
      if (result.success && result.exists && result.fortune) {
        setUserData(result.fortune.userData)
        setFortune(result.fortune.fortuneResult)
      } else {
        // Email not found, redirect to home
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error loading existing fortune:', error)
      router.push('/')
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const email = searchParams.get('email')
    const existing = searchParams.get('existing') === 'true'
    const ageRange = searchParams.get('ageRange')
    const birthDay = searchParams.get('birthDay')
    const bloodGroup = searchParams.get('bloodGroup')

    if (!email) {
      router.push('/')
      return
    }

    if (existing) {
      // Existing user - load their fortune from API
      loadExistingFortune(email)
    } else {
      // New user - require all parameters for fortune generation
      if (!ageRange || !birthDay || !bloodGroup) {
        router.push('/')
        return
      }

      const user: UserData = {
        email,
        ageRange,
        birthDay,
        bloodGroup
      }

      setUserData(user)
      
      // Generate fortune
      const generatedFortune = generateFortune(user)
      setFortune(generatedFortune)
      
      // Save to storage only once
      if (!saveAttempted.current) {
        saveAttempted.current = true
        saveFortune(user, generatedFortune)
      } else {
        setLoading(false)
      }
    }
  }, [searchParams, router, loadExistingFortune])

  const saveFortune = async (userData: UserData, fortuneResult: FortuneResult) => {
    setSaving(true)
    try {
      const response = await fetch('/api/storage/save-fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userData,
          fortuneResult
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        console.warn('Failed to save fortune:', result.error)
        // Don't show error to user, just log it
      }
    } catch (error) {
      console.error('Error saving fortune:', error)
      // Don't show error to user, just log it
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const handleStartOver = () => {
    router.push('/')
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <MoofLogo />
          <p className="mt-4 text-gray-300">กำลังอ่านดวงของคุณ...</p>
        </div>
      </div>
    )
  }

  if (!fortune || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">เกิดข้อผิดพลาด</p>
          <Button onClick={handleStartOver}>กลับหน้าแรก</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileLayout>
        {/* Main Result Content */}
        <main className="flex flex-col items-center justify-start min-h-[75vh] px-6 relative z-10 pt-8">
          <div className="w-full max-w-md space-y-6">

            {/* Header - Title */}
            <div className="text-center mb-2">
              <h1 
                className="font-heading text-white font-bold"
                style={{ 
                  fontSize: 'var(--text-3xl)',
                  textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                }}
              >
                ดวงของคุณ
              </h1>
            </div>

            {/* Sub-header - User Info Only */}
            <div className="text-center mb-6">
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <div className="font-body text-gray-400" style={{ fontSize: 'var(--text-xs)' }}>อายุ</div>
                  <div className="font-body text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.ageRange}</div>
                </div>
                <div>
                  <div className="font-body text-gray-400" style={{ fontSize: 'var(--text-xs)' }}>เกิดวัน</div>
                  <div className="font-body text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.birthDay}</div>
                </div>
                <div>
                  <div className="font-body text-gray-400" style={{ fontSize: 'var(--text-xs)' }}>กรุ๊ปเลือด</div>
                  <div className="font-body text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.bloodGroup}</div>
                </div>
              </div>
            </div>

            {/* Lucky Number */}
            <div className="card-mystical text-center">
              <h2 
                className="font-heading text-white font-bold mb-4"
                style={{ fontSize: 'var(--text-xl)' }}
              >
  เลขนำโชค
              </h2>
              <div 
                className="text-white font-heading font-bold"
                style={{ fontSize: '4rem', lineHeight: '1' }}
              >
                {fortune.luckyNumber}
              </div>
            </div>

            {/* Fortune Predictions - Combined Card */}
            <div className="card-mystical">
              {/* Relationship */}
              <div className="mb-6">
                <h3 
                  className="font-heading font-bold mb-3 text-pink-300 flex items-center gap-2"
                  style={{ fontSize: 'var(--text-lg)' }}
                >
                  💝 เรื่องรัก
                </h3>
                <p 
                  className="font-body text-gray-200 leading-relaxed whitespace-pre-line"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  {fortune.relationship}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-600/30 my-6"></div>

              {/* Work */}
              <div className="mb-6">
                <h3 
                  className="font-heading font-bold mb-3 text-blue-300 flex items-center gap-2"
                  style={{ fontSize: 'var(--text-lg)' }}
                >
                  💼 การงาน
                </h3>
                <p 
                  className="font-body text-gray-200 leading-relaxed whitespace-pre-line"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  {fortune.work}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-600/30 my-6"></div>

              {/* Health */}
              <div>
                <h3 
                  className="font-heading font-bold mb-3 text-green-300 flex items-center gap-2"
                  style={{ fontSize: 'var(--text-lg)' }}
                >
                  🏥 สุขภาพ
                </h3>
                <p 
                  className="font-body text-gray-200 leading-relaxed whitespace-pre-line"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  {fortune.health}
                </p>
                </div>
            </div>

            {/* Bottom padding for floating button */}
            <div style={{ paddingBottom: '100px' }}></div>

            {/* Saving Status */}
            {saving && (
              <div className="text-center">
                <p 
                  className="font-body text-gray-400"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  กำลังบันทึกข้อมูล...
                </p>
              </div>
            )}
          </div>
        </main>
      </MobileLayout>

      {/* Enhanced Floating Button - Fixed Outside Layout */}
      <div className="mobile-sticky-button">
        <div className="floating-button-bg">
          <div className="flex justify-center max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="px-8"
              size="lg"
            >
              หน้าแรก
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function FortuneResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <FortuneResultPageContent />
    </Suspense>
  )
}