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
        // Email exists, go directly to result page
        router.push(`/fortune/result?existing=true&email=${encodeURIComponent(email)}`)
      } else {
        // Email doesn't exist, go to questionnaire
        router.push(`/fortune?email=${encodeURIComponent(email)}`)
      }
    } catch (error) {
      console.error('Error checking email:', error)
      // Fallback to questionnaire on error
      router.push(`/fortune?email=${encodeURIComponent(email)}`)
    } finally {
      setLoading(false)
    }
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

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          ดวงประจำวัน
        </h1>

        {/* Email Input */}
        <div className="w-full max-w-md mb-4">
          <Input 
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            className="text-center"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center mb-6">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mr-2 w-4 h-4"
          />
          <label htmlFor="terms" className="text-sm text-gray-400">
            ยินยอมให้ใช้อีเมลเพื่อวัดประสิทธิภาพโฆษณา
          </label>
        </div>

        {/* Get Fortune Button */}
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full max-w-md mb-8 mystical-glow"
          onClick={handleStartFortune}
          disabled={loading}
        >
          {loading ? 'กำลังตรวจสอบ...' : 'ดูดวงของวัน'}
        </Button>

        {/* Benefits List */}
        <div className="text-left text-sm text-gray-400 space-y-1">
          <p>นโยบายการใช้อีเมล:</p>
          <p>• ไม่มีการนำอีเมลไปใช้ในเชิงพาณิชย์</p>
          <p>• ไม่มีการแชร์อีเมลกับบุคคลที่สาม</p>
          <p>• อีเมลจะถูกลบออกภายใน <span className="text-white">30 วัน</span></p>
        </div>
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
