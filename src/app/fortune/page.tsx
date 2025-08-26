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
            
            {/* Powered by MOOF - positioned after last choice */}
            <div className="mt-8 mb-4 text-center">
              <div 
                className="font-body text-gray-500"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Powered by <span className="font-logo font-bold text-white">MOOF</span>
              </div>
            </div>
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

          {/* Powered by MOOF - positioned after choices for non-final steps */}
          {currentStep !== 3 && (
            <div className="mt-8 mb-4 text-center">
              <div 
                className="font-body text-gray-500"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Powered by <span className="font-logo font-bold text-white">MOOF</span>
              </div>
            </div>
          )}

          {/* Bottom padding for floating buttons */}
          <div style={{ paddingBottom: '120px' }}></div>

        </div>
      </main>

      {/* Fixed Floating Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="flex gap-4 p-4 max-w-md mx-auto">
          <Button
            variant="secondary"
            onClick={handleBack}
            className="flex-1 bg-gray-900/40 backdrop-blur-sm border-2 border-gray-300/70 hover:border-gray-200/90 hover:bg-gray-900/50 text-gray-100 hover:text-white shadow-xl"
            size="lg"
          >
            <span className="font-body font-medium">
              {currentStep === 1 ? 'กลับ' : 'ย้อนกลับ'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex-1 mystical-glow bg-purple-900/40 backdrop-blur-sm border-2 border-purple-400/80 hover:border-purple-300/90 hover:bg-purple-900/50 text-purple-200 hover:text-white shadow-xl"
            size="lg"
          >
            <span className="font-heading font-medium">
              {currentStep === totalSteps ? 'ดูดวงเลย!' : 'ต่อไป'}
            </span>
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}

export default function FortunePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <FortunePageContent />
    </Suspense>
  )
}