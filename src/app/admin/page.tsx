'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FortuneDataEntry } from '@/types'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [data, setData] = useState<FortuneDataEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

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
        fetchData(result.token)
      } else {
        setMessage('รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setMessage('เข้าสู่ระบบไม่สำเร็จ')
    }
    setLoading(false)
  }

  // Fetch fortune data
  const fetchData = async (token?: string) => {
    const authToken = token || localStorage.getItem('adminToken')
    if (!authToken) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setMessage(`พบข้อมูล ${result.data.length} รายการ`)
      } else {
        setMessage('ไม่สามารถโหลดข้อมูลได้')
        if (result.error.includes('Authentication')) {
          setIsAuthenticated(false)
          localStorage.removeItem('adminToken')
        }
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', password: authToken, id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id))
        setMessage('ลบข้อมูลสำเร็จ')
      } else {
        setMessage('ลบข้อมูลไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการลบข้อมูล')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-all', password: authToken })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData([])
        setMessage('ล้างข้อมูลทั้งหมดสำเร็จ')
      } else {
        setMessage('ล้างข้อมูลไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการล้างข้อมูล')
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage('กรุณากรอกรหัสผ่านครบถ้วน')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'change-password', 
          currentPassword, 
          newPassword 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage('เปลี่ยนรหัสผ่านสำเร็จ')
        setShowChangePassword(false)
        setCurrentPassword('')
        setNewPassword('')
        // Update stored token to new password
        localStorage.setItem('adminToken', newPassword)
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
  }, [])

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
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
              className="w-full"
            />
            
            <Button 
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-black/20 text-white text-center text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="card-mystical p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              🔮 ข้อมูลการทำนาย ({data.length} รายการ)
            </h1>
            
            <div className="space-x-2">
              <Button onClick={() => fetchData()} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                รีเฟรช
              </Button>
              <Button onClick={handleClearAll} disabled={loading} className="bg-red-600 hover:bg-red-700">
                ล้างทั้งหมด
              </Button>
              <Button 
                onClick={() => setShowChangePassword(true)} 
                disabled={loading} 
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                เปลี่ยนรหัสผ่าน
              </Button>
              <Button 
                onClick={() => {
                  setIsAuthenticated(false)
                  localStorage.removeItem('adminToken')
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ออกจากระบบ
              </Button>
            </div>
          </div>
          
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-black/20 text-white text-sm">
              {message}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center text-white mb-6">กำลังโหลด...</div>
        )}

        {/* Simple data table */}
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
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-black/10' : 'bg-black/20'}>
                    <td className="p-3">{item.userData.email}</td>
                    <td className="p-3">{item.userData.ageRange}</td>
                    <td className="p-3">{item.userData.birthDay}</td>
                    <td className="p-3">{item.userData.bloodGroup}</td>
                    <td className="p-3 text-2xl font-bold text-yellow-400">
                      {item.fortuneResult.luckyNumber}
                    </td>
                    <td className="p-3">{new Date(item.timestamp).toLocaleDateString('th-TH')}</td>
                    <td className="p-3 text-center">
                      <Button
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2">รหัสผ่านใหม่</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  placeholder="กรอกรหัสผ่านใหม่"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowChangePassword(false)
                  setCurrentPassword('')
                  setNewPassword('')
                }}
                disabled={loading}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword}
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