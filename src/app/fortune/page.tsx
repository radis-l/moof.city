'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { RadioGroup } from '@/components/ui/radio-group'
import { MoofLogo } from '@/assets/logo'
import { MobileLayout } from '@/components/layout'
import type { AgeRange, BirthDay, BloodGroup } from '@/types'

const AGE_OPTIONS = [
  { value: '<18', label: 'ต่ำกว่า 18 ปี' },
  { value: '18-25', label: '18-25 ปี' },
  { value: '26-35', label: '26-35 ปี' },
  { value: '36-45', label: '36-45 ปี' },
  { value: '46-55', label: '46-55 ปี' },
  { value: '55+', label: 'มากกว่า 55 ปี' }
]

const DAY_OPTIONS = [
  { value: 'Monday', label: 'จันทร์' },
  { value: 'Tuesday', label: 'อังคาร' },
  { value: 'Wednesday', label: 'พุธ' },
  { value: 'Thursday', label: 'พฤหัส' },
  { value: 'Friday', label: 'ศุกร์' },
  { value: 'Saturday', label: 'เสาร์' },
  { value: 'Sunday', label: 'อาทิตย์' }
]

const BLOOD_OPTIONS = [
  { value: 'A', label: 'เอ (A)' },
  { value: 'B', label: 'บี (B)' },
  { value: 'AB', label: 'เอบี (AB)' },
  { value: 'O', label: 'โอ (O)' }
]

function FortunePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [currentStep, setCurrentStep] = useState(1)
  const [ageRange, setAgeRange] = useState<AgeRange | ''>('')
  const [birthDay, setBirthDay] = useState<BirthDay | ''>('')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('')
  const [loading, setLoading] = useState(true)

  const totalSteps = 3
  const isStepValid = () => {
    switch (currentStep) {
      case 1: return ageRange !== ''
      case 2: return birthDay !== ''
      case 3: return bloodGroup !== ''
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit form and go to results
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/')
    }
  }

  const handleSubmit = async () => {
    const formData = {
      email,
      ageRange,
      birthDay,
      bloodGroup
    }
    
    // Store in URL params for now (later we'll use Google Sheets)
    const params = new URLSearchParams(formData as Record<string, string>)
    router.push(`/fortune/result?${params.toString()}`)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-3">
            <div style={{ marginBottom: 'var(--space-2)', paddingTop: '16px' }}>
              <h2 
                className="font-heading text-white font-bold"
                style={{ 
                  fontSize: 'var(--text-2xl)',
                  marginBottom: 'var(--space-1)',
                  textShadow: '0 2px 12px rgba(139, 92, 246, 0.2)'
                }}
              >
                คุณอายุเท่าไหร่?
              </h2>
              <p 
                className="font-body text-gray-400"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                เลือกช่วงอายุของคุณ
              </p>
            </div>
            <RadioGroup
              name="ageRange"
              options={AGE_OPTIONS}
              value={ageRange}
              onChange={(value) => setAgeRange(value as AgeRange)}
            />
          </div>
        )

      case 2:
        return (
          <div className="text-center space-y-3">
            <div style={{ marginBottom: 'var(--space-2)', paddingTop: '16px' }}>
              <h2 
                className="font-heading text-white font-bold"
                style={{ 
                  fontSize: 'var(--text-2xl)',
                  marginBottom: 'var(--space-1)',
                  textShadow: '0 2px 12px rgba(139, 92, 246, 0.2)'
                }}
              >
                คุณเกิดวันไหน?
              </h2>
              <p 
                className="font-body text-gray-400"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                วันในสัปดาห์ที่คุณเกิด
              </p>
            </div>
            <RadioGroup
              name="birthDay"
              options={DAY_OPTIONS}
              value={birthDay}
              onChange={(value) => setBirthDay(value as BirthDay)}
            />
          </div>
        )

      case 3:
        return (
          <div className="text-center space-y-3">
            <div style={{ marginBottom: 'var(--space-2)', paddingTop: '16px' }}>
              <h2 
                className="font-heading text-white font-bold"
                style={{ 
                  fontSize: 'var(--text-2xl)',
                  marginBottom: 'var(--space-1)',
                  textShadow: '0 2px 12px rgba(139, 92, 246, 0.2)'
                }}
              >
                กรุ๊ปเลือดคุณคืออะไร?
              </h2>
              <p 
                className="font-body text-gray-400"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                เลือกกรุ๊ปเลือดของคุณ
              </p>
            </div>
            <RadioGroup
              name="bloodGroup"
              options={BLOOD_OPTIONS}
              value={bloodGroup}
              onChange={(value) => setBloodGroup(value as BloodGroup)}
            />
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email) {
        router.push('/')
        return
      }

      try {
        const response = await fetch(`/api/storage/check-email?email=${encodeURIComponent(email)}`)
        const result = await response.json()
        
        if (result.success && result.exists) {
          // Email already exists, redirect to results
          router.push(`/fortune/result?existing=true&email=${encodeURIComponent(email)}`)
          return
        }
        
        // Email doesn't exist, allow questionnaire
        setLoading(false)
      } catch (error) {
        console.error('Error checking email:', error)
        // On error, allow questionnaire
        setLoading(false)
      }
    }

    checkEmailExists()
  }, [email, router])

  if (!email || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <MoofLogo />
          <p className="mt-4 text-gray-300">กำลังตรวจสอบ...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileLayout>
        {/* Unified Hero Section - Questionnaire */}
        <main className="flex flex-col items-center justify-center min-h-[75vh] px-6 relative z-10">
          <div className="w-full max-w-md text-center space-y-4">

            {/* Progress Bar */}
            <div>
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            </div>

            {/* Step Content - Minimal */}
            <div>
              {renderStepContent()}
            </div>

            {/* Enhanced bottom padding for floating buttons - ensures content never gets hidden */}
            <div style={{ paddingBottom: '140px' }}></div>

          </div>
        </main>
      </MobileLayout>

      {/* Enhanced Floating Buttons - Fixed Outside Layout */}
      <div className="mobile-sticky-button">
        <div className="floating-button-bg">
          <div className="flex gap-4 max-w-md mx-auto">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
              size="lg"
            >
              {currentStep === 1 ? 'กลับ' : 'ย้อนกลับ'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1"
              size="lg"
            >
              {currentStep === totalSteps ? 'ดูดวงเลย!' : 'ต่อไป'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function FortunePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <FortunePageContent />
    </Suspense>
  )
}