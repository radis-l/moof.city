'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormProps {
  onLogin: (password: string) => Promise<void>
  error?: string
  isLoading?: boolean
}

export function LoginForm({ onLogin, error, isLoading }: LoginFormProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    await onLogin(password)
  }

  return (
    <div className="card-mystical max-w-md w-full p-8">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        🔮 ระบบจัดการผู้ดูแล
      </h1>
      
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="รหัสผ่านผู้ดูแล"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-white/5 border-white/10 text-center"
        />
        
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !password}
          className="w-full btn-mystical-primary border-0"
        >
          {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </div>
      
      {error && (
        <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
