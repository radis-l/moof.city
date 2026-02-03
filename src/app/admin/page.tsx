'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EnvironmentBadge } from '@/components/ui/environment-badge'
import { getEnvironmentInfo } from '@/lib/environment'
import type { FortuneDataEntry } from '@/types'

export default function AdminPage() {
  const { isDevelopment } = getEnvironmentInfo()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [data, setData] = useState<FortuneDataEntry[]>([])
  const [serverStorageMode, setServerStorageMode] = useState<string>('')
  const [hasKeys, setHasKeys] = useState<boolean | null>(null)
  const [dbStatus, setDbStatus] = useState<{success: boolean, message: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [initializing, setInitializing] = useState(true)

  // Fetch fortune data
  const fetchData = async (token?: string) => {
    const authToken = token || localStorage.getItem('adminToken')
    if (!authToken) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${authToken}` },
        cache: 'no-store'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        if (result.storageMode) setServerStorageMode(result.storageMode)
        setMessage(`พบข้อมูล ${result.data.length} รายการ`)
        
        // Handle token refresh
        const newToken = response.headers.get('X-New-Token')
        if (newToken) {
          localStorage.setItem('adminToken', newToken)
        }
      } else {
        setMessage('ไม่สามารถโหลดข้อมูลได้')
        if (result.error && result.error.includes('Authentication')) {
          setIsAuthenticated(false)
          localStorage.removeItem('adminToken')
        }
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    }
    setLoading(false)
  }

  // Simple login
  const handleLogin = async () => {
    if (!password) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsAuthenticated(true)
        setMessage('เข้าสู่ระบบสำเร็จ')
        localStorage.setItem('adminToken', result.token)
        if (result.storageMode) setServerStorageMode(result.storageMode)
        fetchData(result.token)
      } else {
        setMessage('รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setMessage('เข้าสู่ระบบไม่สำเร็จ')
    }
    setLoading(false)
  }

  // Test Database Connection
  const testDatabase = async () => {
    const authToken = localStorage.getItem('adminToken')
    setLoading(true)
    setDbStatus(null)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ action: 'test-db' })
      })
      
      const result = await response.json()
      setDbStatus({ success: result.success, message: result.message || result.error || 'Connection tested' })
      if (result.success && result.storageMode) setServerStorageMode(result.storageMode)
      if (result.hasKeys !== undefined) setHasKeys(result.hasKeys)
    } catch {
      setDbStatus({ success: false, message: 'Failed to reach diagnostic API' })
    }
    setLoading(false)
  }

  // Delete single entry
  const handleDelete = async (id: string) => {
    if (!confirm('แน่ใจว่าต้องการลบ?')) return
    
    const authToken = localStorage.getItem('adminToken')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ action: 'delete', id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id))
        setMessage('ลบข้อมูลสำเร็จ')
      } else {
        setMessage(`ลบข้อมูลไม่สำเร็จ: ${result.error || result.message || 'ไม่ทราบสาเหตุ'}`)
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบข้อมูล')
    }
    setLoading(false)
  }

  // Clear all data
  const handleClearAll = async () => {
    if (!confirm('แน่ใจว่าต้องการลบข้อมูลทั้งหมด?')) return
    
    const authToken = localStorage.getItem('adminToken')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ action: 'clear-all' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData([])
        setMessage('ล้างข้อมูลทั้งหมดสำเร็จ')
      } else {
        setMessage(`ล้างข้อมูลไม่สำเร็จ: ${result.error || result.message || 'ไม่ทราบสาเหตุ'}`)
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อล้างข้อมูล')
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('กรุณากรอกรหัสผ่านครบถ้วน')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
      return
    }

    if (newPassword.length < 6) {
      setMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    const authToken = localStorage.getItem('adminToken')
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          action: 'change-password', 
          currentPassword, 
          newPassword 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        if (result.token) {
          localStorage.setItem('adminToken', result.token)
          setMessage('เปลี่ยนรหัสผ่านสำเร็จ')
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem('adminToken')
          setMessage('เปลี่ยนรหัสผ่านสำเร็จ - กรุณาเข้าสู่ระบบใหม่')
        }
      } else {
        setMessage(result.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    }
    setLoading(false)
  }

  // Check if already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      fetchData(token)
    }
    setInitializing(false)
  }, [])

  // Show loading state during initialization to prevent hydration mismatch
  if (initializing) {
    return (
      <div className="min-h-screen admin-background flex items-center justify-center p-4">
        <div className="card-mystical max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-xl font-bold text-white mb-2">
            🔮 กำลังโหลด...
          </h1>
          <div className="text-sm text-white/40 tracking-wider">SECURE CONNECTION</div>
        </div>
      </div>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen admin-background flex items-center justify-center p-4">
        <EnvironmentBadge forceStorage={serverStorageMode ? (serverStorageMode === 'supabase' ? 'Supabase DB' : 'SQLite') : 'Connecting...'} />
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
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-white/5 border-white/10 text-center"
            />
            
            <Button 
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full btn-mystical-primary border-0"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </div>
          
          {message && (
            <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-center text-xs">
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen admin-background p-4">
      <EnvironmentBadge 
        forceStorage={serverStorageMode === 'supabase' ? 'Supabase DB' : serverStorageMode === 'sqlite' ? 'SQLite' : undefined} 
      />
      <div className="max-w-6xl mx-auto">
        <div className="card-mystical p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              🔮 ข้อมูลการทำนาย ({data.length})
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={testDatabase} disabled={loading} size="sm" className="bg-purple-600/30 hover:bg-purple-600/50 text-xs border border-purple-500/30">
                🛠 ทดสอบ DB
              </Button>
              <Button onClick={() => fetchData()} disabled={loading} size="sm" className="bg-blue-600/30 hover:bg-blue-600/50 text-xs border border-blue-500/30">
                🔄 รีเฟรช
              </Button>
              <Button onClick={handleClearAll} disabled={loading} size="sm" className="bg-red-600/30 hover:bg-red-600/50 text-xs border border-red-500/30">
                🗑 ล้างทั้งหมด
              </Button>
              {!isDevelopment && (
                <Button 
                  onClick={() => setShowChangePassword(true)} 
                  disabled={loading} 
                  size="sm"
                  className="bg-yellow-600/30 hover:bg-yellow-600/50 text-xs border border-yellow-500/30 text-yellow-200"
                >
                  🔑 รหัสผ่าน
                </Button>
              )}
              <Button 
                onClick={() => {
                  setIsAuthenticated(false)
                  localStorage.removeItem('adminToken')
                }}
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-xs border border-white/10"
              >
                🚪 ออก
              </Button>
            </div>
          </div>
          
          {dbStatus && (
            <div className={`mt-4 p-3 rounded-lg text-xs backdrop-blur-sm border ${dbStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
              <div className="flex justify-between items-center">
                <span><strong>สถานะระบบ:</strong> {dbStatus.message}</span>
                <div className="flex gap-3">
                  {serverStorageMode && <span className="opacity-60">Storage: {serverStorageMode}</span>}
                  {hasKeys !== null && (
                    <span className={hasKeys ? "text-green-400" : "text-red-400"}>
                      Keys: {hasKeys ? "Found" : "Missing"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {message && (
            <div className="mt-4 p-2 rounded bg-white/5 text-white/60 text-xs text-center border border-white/5">
              {message}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center text-white mb-6">กำลังโหลด...</div>
        )}

        <div className="card-mystical overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead className="bg-black/30">
                <tr>
                  <th className="p-3 text-left">อีเมล</th>
                  <th className="p-3 text-left">อายุ</th>
                  <th className="p-3 text-left">วันเกิด</th>
                  <th className="p-3 text-left">กรุ๊ปเลือด</th>
                  <th className="p-3 text-left">เลขนำโชค</th>
                  <th className="p-3 text-left">วันที่</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} border-b border-white/5 last:border-0 hover:bg-white/[0.08] transition-colors`}>
                    <td className="p-4 font-medium">{item.userData.email}</td>
                    <td className="p-4 opacity-70">{item.userData.ageRange}</td>
                    <td className="p-4 opacity-70">{item.userData.birthDay}</td>
                    <td className="p-4 opacity-70">{item.userData.bloodGroup}</td>
                    <td className="p-4 text-xl font-bold text-purple-400">
                      {item.fortuneResult.luckyNumber}
                    </td>
                    <td className="p-4 opacity-60 text-xs">{new Date(item.timestamp).toLocaleDateString('th-TH')}</td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        size="sm"
                        className="bg-red-500/10 hover:bg-red-500/30 text-red-400 text-[10px] px-3 py-1 border border-red-500/20"
                      >
                        ลบ
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length === 0 && !loading && (
              <div className="text-center text-white/60 py-8">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChangePassword(false)
              setCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
            }
          }}
        >
          <div className="card-mystical max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              🔑 เปลี่ยนรหัสผ่าน
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">รหัสผ่านปัจจุบัน</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2">รหัสผ่านใหม่</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2">ยืนยันรหัสผ่านใหม่</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowChangePassword(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
