'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MobileLayout } from '@/components/layout'
import { generateFortune } from '@/lib/fortune-generator'
import type { UserData, FortuneResult } from '@/types'
import { trackResultView, trackFortuneGeneration, trackError, trackPageView, trackConversion, trackEngagementTime } from '@/lib/analytics'

function FortuneResultPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [fortune, setFortune] = useState<FortuneResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const saveAttempted = useRef(false)
  const [pageStartTime] = useState(Date.now())

  const loadExistingFortune = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/fortune?email=${encodeURIComponent(email)}`, {
        cache: 'no-store'
      })
      const result = await response.json()

      if (result.success && result.exists && result.fortune) {
        setUserData(result.fortune.userData)
        setFortune(result.fortune.fortuneResult)
        trackPageView('05_result_fortune_existing', 'returning_user')
        trackResultView(false, 'existing_fortune')
        trackConversion('fortune_complete', 1)
      } else {
        // Email not found, redirect to home
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error loading existing fortune:', error)
      trackError('existing_fortune_load_failed', error instanceof Error ? error.message : 'Unknown error', 'result_page')
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

      trackPageView('05_result_fortune_new', 'new_user')
      trackResultView(true, 'new_fortune')
      trackFortuneGeneration({ age: user.ageRange, bloodGroup: user.bloodGroup, birthDay: user.birthDay })
      trackConversion('fortune_complete', 1)

      // Save to storage only once
      if (!saveAttempted.current) {
        saveAttempted.current = true
        saveFortune(user)
      } else {
        setLoading(false)
      }
    }
  }, [searchParams, router, loadExistingFortune])

  const saveFortune = async (userData: UserData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (!result.success) {
        console.warn('Failed to save fortune:', result.error)
        trackError('fortune_save_failed', result.error, 'result_page')
        // Don't show error to user, just log it
      } else {
        // Update fortune with the one returned from API (in case of any differences)
        if (result.fortune) {
          setFortune(result.fortune)
        }
      }
    } catch (error) {
      console.error('Error saving fortune:', error)
      trackError('fortune_save_error', error instanceof Error ? error.message : 'Unknown error', 'result_page')
      // Don't show error to user, just log it
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const handleStartOver = () => {
    const timeSpent = Date.now() - pageStartTime;
    trackEngagementTime(timeSpent, 'result_page');
    router.push('/')
  }


  if (loading) {
    return (
      <div className="min-h-screen mystical-background text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingAnimation size="medium" className="mx-auto mb-4" />
          <p className="text-gray-300">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!fortune || !userData) {
    return (
      <div className="min-h-screen mystical-background text-white flex items-center justify-center">
        <div className="text-center">
          <LoadingAnimation size="medium" className="mx-auto mb-4" />
          <p className="text-red-400">เกิดข้อผิดพลาด</p>
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

            {/* Sub-header - User Info with Badges */}
            <div className="text-center mb-6">
              <div className="flex justify-center gap-3 flex-wrap">
                <Badge variant="mystical" className="font-body px-3 py-1">
                  <span className="text-gray-400 mr-1" style={{ fontSize: 'var(--text-xs)' }}>อายุ</span>
                  <span className="text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.ageRange}</span>
                </Badge>
                <Badge variant="mystical" className="font-body px-3 py-1">
                  <span className="text-gray-400 mr-1" style={{ fontSize: 'var(--text-xs)' }}>เกิดวัน</span>
                  <span className="text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.birthDay}</span>
                </Badge>
                <Badge variant="mystical" className="font-body px-3 py-1">
                  <span className="text-gray-400 mr-1" style={{ fontSize: 'var(--text-xs)' }}>กรุ๊ปเลือด</span>
                  <span className="text-white font-medium" style={{ fontSize: 'var(--text-sm)' }}>{userData.bloodGroup}</span>
                </Badge>
              </div>
            </div>

            {/* Lucky Number */}
            <Card className="bg-white/[0.08] backdrop-blur-xl border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle
                  className="font-heading text-white font-bold text-center"
                  style={{ fontSize: 'var(--text-xl)' }}
                >
                  เลขนำโชค
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div
                  className="text-white font-heading font-bold"
                  style={{ fontSize: '4rem', lineHeight: '1' }}
                  data-testid="fortune-numbers"
                >
                  {fortune.luckyNumber}
                </div>
              </CardContent>
            </Card>

            {/* Fortune Predictions - Combined Card */}
            <Card className="bg-white/[0.08] backdrop-blur-xl border-purple-500/30">
              <CardContent className="p-6">
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

                <Separator className="my-6 bg-gray-500/50" />

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

                <Separator className="my-6 bg-gray-500/50" />

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
              </CardContent>
            </Card>

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
    <Suspense fallback={
      <div className="min-h-screen mystical-background flex items-center justify-center text-white">
        <div className="text-center">
          <LoadingAnimation size="medium" className="mx-auto mb-4" />
          <p className="text-gray-300">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <FortuneResultPageContent />
    </Suspense>
  )
}