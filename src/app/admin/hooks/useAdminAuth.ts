'use client'

import { useState, useEffect } from 'react'

interface UseAdminAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  error: string
  login: (password: string) => Promise<{ success: boolean; storageMode?: string }>
  logout: () => Promise<void>
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const login = async (password: string): Promise<{ success: boolean; storageMode?: string }> => {
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน')
      return { success: false }
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsAuthenticated(true)
        setError('')
        return { success: true, storageMode: result.storageMode }
      } else {
        setError('รหัสผ่านไม่ถูกต้อง')
        return { success: false }
      }
    } catch {
      setError('เข้าสู่ระบบไม่สำเร็จ')
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      })
      setIsAuthenticated(false)
      setError('')
    } catch {
      setError('ออกจากระบบไม่สำเร็จ')
    }
  }

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin?limit=1&offset=0', { cache: 'no-store' })
        const result = await response.json()
        
        if (result.success) {
          setIsAuthenticated(true)
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  }
}
