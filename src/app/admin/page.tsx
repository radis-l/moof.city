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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [initializing, setInitializing] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [totalCount, setTotalCount] = useState(0)
  const [jumpToPage, setJumpToPage] = useState('')

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Fetch fortune data with pagination
  const fetchData = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true)
    try {
      const offset = (page - 1) * limit
      const response = await fetch(
        `/api/admin?limit=${limit}&offset=${offset}&orderBy=generated_at&order=desc`,
        { cache: 'no-store' }
      )
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setTotalCount(result.count || 0)
        if (result.storageMode) setServerStorageMode(result.storageMode)
        setMessage(`แสดง ${result.data.length} รายการ จากทั้งหมด ${result.count || 0} รายการ`)
        setIsAuthenticated(true)
      } else {
        setMessage('ไม่สามารถโหลดข้อมูลได้')
        if (result.error && result.error.includes('Authentication')) {
          setIsAuthenticated(false)
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
        if (result.storageMode) setServerStorageMode(result.storageMode)
        fetchData()
      } else {
        setMessage('รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setMessage('เข้าสู่ระบบไม่สำเร็จ')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      })
      setIsAuthenticated(false)
      setData([])
      setMessage('ออกจากระบบแล้ว')
    } catch {
      setMessage('ออกจากระบบไม่สำเร็จ')
    }
  }

  // Delete single entry
  const handleDelete = async (id: string) => {
    if (!confirm('แน่ใจว่าต้องการลบ?')) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
        setMessage('เปลี่ยนรหัสผ่านสำเร็จ')
      } else {
        setMessage(result.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    }
    setLoading(false)
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      fetchData(newPage, itemsPerPage)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset to first page
    fetchData(1, newLimit)
  }

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10)
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum)
      setJumpToPage('')
    }
  }

  // Check if already logged in on mount
  useEffect(() => {
    fetchData()
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
        showPerformance={true}
      />
      <div className="max-w-6xl mx-auto">
        {/* Performance Monitoring Info */}
        <div className="card-mystical p-4 mb-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-sm font-semibold text-white">Performance Monitoring</h3>
                <p className="text-xs text-white/60">View real-time performance metrics on Vercel</p>
              </div>
            </div>
            <a 
              href="https://vercel.com/analytics" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-xs text-white transition-all"
            >
              Open Analytics →
            </a>
          </div>
        </div>
        
        <div className="card-mystical p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              🔮 ข้อมูลการทำนาย ({data.length})
            </h1>
            
            <div className="flex flex-wrap gap-2">
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
                onClick={handleLogout}
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-xs border border-white/10"
              >
                🚪 ออก
              </Button>
            </div>
          </div>
          
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

        {/* Pagination Controls */}
        {data.length > 0 && (
          <div className="card-mystical p-4 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={loading || currentPage === 1}
                  size="sm"
                  className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs px-3"
                >
                  ← ก่อนหน้า
                </Button>
                
                <div className="text-white text-sm px-3">
                  หน้า <span className="font-bold text-purple-400">{currentPage}</span> / {totalPages}
                </div>
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={loading || currentPage === totalPages}
                  size="sm"
                  className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs px-3"
                >
                  ถัดไป →
                </Button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">ไปที่หน้า:</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                  placeholder={`1-${totalPages}`}
                  className="w-20 h-8 text-xs bg-white/5 border-white/10 text-center"
                  disabled={loading}
                />
                <Button
                  onClick={handleJumpToPage}
                  disabled={loading || !jumpToPage}
                  size="sm"
                  className="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-xs px-3"
                >
                  ไป
                </Button>
              </div>

              {/* Items per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">แสดง:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value, 10))}
                  disabled={loading}
                  className="h-8 px-2 text-xs bg-white/5 border border-white/10 rounded text-white hover:bg-white/10 transition-colors"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-white/60 text-xs">รายการ/หน้า</span>
              </div>
            </div>

            {/* Total Count Display */}
            <div className="text-center text-white/40 text-xs mt-3 pt-3 border-t border-white/5">
              ทั้งหมด {totalCount.toLocaleString()} รายการ
            </div>
          </div>
        )}
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
