'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MobileLayout } from '@/components/layout'
import { trackEmailSubmission, trackError, trackPageView, trackFormBegin, trackSessionStart } from '@/lib/analytics'

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
      // Check if email already exists - using no-store to ensure we get fresh data after deletions
      const response = await fetch(`/api/fortune?email=${encodeURIComponent(email)}`, {
        cache: 'no-store'
      })
      const result = await response.json()
      
      if (result.success) {
        if (result.exists) {
          // Email exists, show existing fortune result
          trackEmailSubmission(false, email)
          router.push(`/fortune/result?existing=true&email=${encodeURIComponent(email)}`)
          return // Stop here
        } else {
          // Email doesn't exist, start new questionnaire
          trackEmailSubmission(true, email)
          router.push(`/fortune?email=${encodeURIComponent(email)}`)
          return // Stop here
        }
      } else {
        // API reported an error (e.g., DB connection issue)
        console.error('API Error:', result.error)
        setEmailError(`เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ${result.error || 'กรุณาลองใหม่อีกครั้ง'}`)
      }
    } catch (error) {
      console.error('Error checking email:', error)
      trackError('email_check_failed', error instanceof Error ? error.message : 'Unknown error', 'home_page')
      setEmailError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const userType = 'unknown';
      const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
      trackSessionStart(userType, deviceType);
      trackPageView('01_landing_email_entry', userType);
      trackFormBegin('email_submission');
    }
  }, [])
  return (
    <MobileLayout>
      {/* Unified Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative z-10" suppressHydrationWarning={true}>
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
          <div className="flex items-start gap-3 text-left">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="font-body text-gray-300 leading-relaxed cursor-pointer font-normal"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              ยินยอมให้ใช้อีเมลเพื่อวัดประสิทธิภาพโฆษณา
            </Label>
          </div>

          {/* CTA Button */}
          <div>
            <Button 
              variant="outline" 
              size="md" 
              className="w-full btn-mystical-primary border-0 shadow-lg hover:shadow-xl"
              onClick={handleStartFortune}
              disabled={loading}
            >
              <span className="font-heading font-medium">
                {loading ? 'กำลังตรวจสอบ...' : 'ดูดวง'}
              </span>
            </Button>
          </div>

          {/* Email Policy - Integrated */}
          <Card className="bg-white/[0.05] border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-left">
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
            </CardContent>
          </Card>

        </div>
      </main>

    </MobileLayout>
  )
}
