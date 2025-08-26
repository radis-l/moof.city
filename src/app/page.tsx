'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoofLogo } from '@/assets/logo'
import { ParticleBackground } from '@/components/ui/particle-background'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)

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
  return (
    <>
      {/* Mobile Only - Main Content */}
      <div className="block md:hidden mystical-background text-white relative overflow-hidden">
        <ParticleBackground />
        
        {/* Header */}
        <header className="content-section" style={{ paddingTop: 'var(--space-3)' }}>
          <div className="container-grid">
            <div className="grid-full flex justify-between items-center">
              <button 
                className="font-body cursor-pointer hover:opacity-80 transition-opacity" 
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}
                onClick={() => router.push('/')}
              >
                ดูดวงฟรีกับ <span className="font-logo font-bold text-white">MOOF</span>
              </button>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>
                &lt;/&gt;
              </div>
            </div>
          </div>
        </header>

        {/* Unified Hero Section */}
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative z-10">
          <div className="w-full max-w-md text-center space-y-4">
            
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
                placeholder="อีเมล"
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
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full mystical-glow"
                onClick={handleStartFortune}
                disabled={loading}
              >
                <span className="font-heading font-medium">
                  {loading ? 'กำลังตรวจสอบ...' : 'ดูดวงของวัน'}
                </span>
              </Button>
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

        {/* Footer */}
        <footer className="content-section">
          <div className="container-grid">
            <div className="grid-full text-center">
              <div 
                className="font-body text-gray-500"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                Powered by <span className="font-logo font-bold text-white">MOOF</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Desktop/Tablet - Mobile Only Message */}
      <div className="hidden md:flex mystical-background text-white min-h-screen items-center justify-center relative overflow-hidden">
        <ParticleBackground />
        <div className="text-center relative z-10 px-6">
          <div className="mb-8">
            <MoofLogo />
          </div>
          <h1 
            className="font-heading text-white font-bold mb-6"
            style={{ 
              fontSize: 'var(--text-3xl)', 
              textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            เว็บไซต์นี้รองรับเฉพาะมือถือ
          </h1>
          <p 
            className="font-body text-gray-300 mb-8 max-w-md mx-auto leading-relaxed"
            style={{ fontSize: 'var(--text-lg)' }}
          >
            กรุณาเปิดเว็บไซต์ผ่านมือถือของคุณ<br />
            เพื่อประสบการณ์การใช้งานที่ดีที่สุด
          </p>
        </div>
      </div>
    </>
  )
}
