'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { StarBorder } from '@/components/ui/star-border'
import { MobileLayout } from '@/components/layout'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleStartFortune = async () => {
    setEmailError('')
    setLoading(true)
    
    if (!email.trim()) {
      setEmailError('กรุณากรอกอีเมล')
      setLoading(false)
      return
    }
    
    if (!validateEmail(email)) {
      setEmailError('กรุณากรอกอีเมลที่ถูกต้อง')
      setLoading(false)
      return
    }
    
    if (!agreed) {
      setEmailError('กรุณายินยอมเงื่อนไขการใช้งาน')
      setLoading(false)
      return
    }
    
    try {
      // Check if email already exists
      const response = await fetch(`/api/storage/check-email?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      
      if (result.success && result.exists) {
        // Email exists, show existing fortune result
        router.push(`/fortune/result?existing=true&email=${encodeURIComponent(email)}`)
      } else {
        // Email doesn't exist, start new questionnaire
        router.push(`/fortune?email=${encodeURIComponent(email)}`)
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setEmailError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <MobileLayout>
      {/* Unified Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative z-10">
        <div className="w-full max-w-md text-center space-y-4">
          
          {/* Powered by MOOF - Top of page */}
          {mounted && (
            <div className="mb-2 text-center">
              <div 
                className="font-body text-gray-500"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Powered by <span className="font-logo font-bold text-white">MOOF</span>
              </div>
            </div>
          )}

          {/* Main Heading - Integrated */}
          <h1 
            className="font-heading text-white font-bold" 
            style={{ 
              fontSize: 'var(--text-4xl)', 
              textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
              paddingBottom: 'var(--space-2)'
            }}
          >
            ดวงประจำวัน
          </h1>

          {/* Email Input */}
          <div>
            <Input 
              type="email"
              placeholder="ใส่อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              className="text-center"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start text-left">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 mr-3 w-4 h-4 accent-purple-500"
            />
            <label 
              htmlFor="terms" 
              className="font-body text-gray-300 leading-relaxed"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              ยินยอมให้ใช้อีเมลเพื่อวัดประสิทธิภาพโฆษณา
            </label>
          </div>

          {/* CTA Button */}
          <div>
            <StarBorder 
              className="w-full"
              color="rgba(139, 92, 246, 0.8)"
              speed="4s"
              onClick={handleStartFortune}
              disabled={loading}
            >
              <span className="font-heading font-medium">
                {loading ? 'กำลังตรวจสอบ...' : 'ดูดวง'}
              </span>
            </StarBorder>
          </div>

          {/* Email Policy - Integrated */}
          <div className="text-left">
            <div 
              className="font-body font-medium text-gray-400 mb-2"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              นโยบายการใช้อีเมล:
            </div>
            <div className="space-y-1">
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span 
                  className="font-body text-gray-300"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  ไม่มีการนำอีเมลไปใช้ในเชิงพาณิชย์
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span 
                  className="font-body text-gray-300"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  ไม่มีการแชร์อีเมลกับบุคคลที่สาม
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span 
                  className="font-body text-gray-300"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  อีเมลจะถูกลบออกภายใน <span className="text-white font-medium">30 วัน</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

    </MobileLayout>
  )
}
