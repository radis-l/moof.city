'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MoofLogo } from '@/assets/logo'
import { ParticleBackground } from '@/components/ui/particle-background'
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

  const handleNewFortune = () => {
    router.push(`/fortune?email=${encodeURIComponent(userData?.email || '')}`)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />
      {/* Header */}
      <div className="flex justify-between items-center p-4 relative z-10">
        <div className="text-sm text-gray-400">
          ดูดวงฟรีกับ <span className="font-bold text-white font-museo-moderno">MOOF</span>
        </div>
        <div className="text-sm text-gray-400">
          &lt;/&gt;
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative z-10">
        {/* Logo */}
        <div className="mb-8">
          <MoofLogo />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8">
          ดวงของคุณ ✨
        </h1>

        {/* User Info */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6 w-full max-w-md">
          <p className="text-sm text-gray-300 text-center">
            <span className="text-white">{userData.email}</span>
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
            <span>อายุ: {userData.ageRange}</span>
            <span>เกิด: {userData.birthDay}</span>
            <span>เลือด: {userData.bloodGroup}</span>
          </div>
        </div>

        {/* Lucky Number */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-center mb-4 text-white">
            🍀 เลขนำโชค
          </h2>
          <div className="flex justify-center">
            <div className="text-white font-bold text-6xl flex items-center justify-center">
              {fortune.luckyNumber}
            </div>
          </div>
        </div>

        {/* Fortune Predictions */}
        <div className="w-full max-w-md space-y-4 mb-8">
          {/* Relationship */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-bold mb-2 text-pink-300 flex items-center">
              💝 เรื่องรัก
            </h3>
            <p className="text-sm text-gray-200">{fortune.relationship}</p>
          </div>

          {/* Work */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-bold mb-2 text-blue-300 flex items-center">
              💼 การงาน
            </h3>
            <p className="text-sm text-gray-200">{fortune.work}</p>
          </div>

          {/* Health */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-bold mb-2 text-green-300 flex items-center">
              🏥 สุขภาพ
            </h3>
            <p className="text-sm text-gray-200">{fortune.health}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-md">
          <Button 
            variant="outline" 
            onClick={handleStartOver}
            className="flex-1"
          >
            หน้าแรก
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNewFortune}
            className="flex-1"
          >
            ดูดวงใหม่
          </Button>
        </div>

        {/* Saving Status */}
        {saving && (
          <p className="text-xs text-gray-400 mt-4">กำลังบันทึกข้อมูล...</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-6 relative z-10">
        <div className="text-xs text-gray-500">
          Powered by <span className="font-bold text-white font-museo-moderno">MOOF</span>
        </div>
      </div>
    </div>
  )
}

export default function FortuneResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <FortuneResultPageContent />
    </Suspense>
  )
}