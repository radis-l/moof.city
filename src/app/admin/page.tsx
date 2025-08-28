'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import DateTimePicker from 'react-datetime-picker'
import { Button } from '@/components/ui/button'
import { AdminLogin } from '@/components/ui/admin-login'
import { parseThaiTimestamp } from '@/lib/utils'
import type { FortuneDataEntry } from '@/types'

// Import CSS for datetime picker
import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'

// Dynamic imports for performance
const BarChart = dynamic(() => import('@/components/ui/bar-chart').then(mod => ({ default: mod.BarChart })), {
  loading: () => <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />,
  ssr: false
})

const ChangePasswordModal = dynamic(() => import('@/components/ui/change-password-modal').then(mod => ({ default: mod.ChangePasswordModal })), {
  ssr: false
})

export default function AdminPage() {
  const [data, setData] = useState<FortuneDataEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string>('')
  const [clearingAll, setClearingAll] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      const result = await response.json()
      setIsAuthenticated(result.authenticated)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/storage/get-data')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch data')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const response = await fetch('/api/storage/export-csv')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fortune-data.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        setError('Failed to export CSV')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error exporting CSV')
    }
  }

  const clearAllData = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้!')) {
      return
    }

    setClearingAll(true)
    setError('')
    try {
      const response = await fetch('/api/storage/clear-all', {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setData([])
      } else {
        setError(result.message || 'Failed to clear all data')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error clearing all data')
    } finally {
      setClearingAll(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) {
      return
    }

    setDeleting(id)
    setError('')
    try {
      const response = await fetch(`/api/storage/delete?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Remove from local state
        setData(data.filter(item => item.id !== id))
      } else {
        setError(result.message || 'Failed to delete entry')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting entry')
    } finally {
      setDeleting('')
    }
  }

  // Chart data calculation
  const chartData = useMemo(() => {
    if (data.length === 0) return []

    // Use selected datetime or find the latest timestamp in the data as reference point
    let referenceDate: Date
    if (selectedDateTime) {
      referenceDate = selectedDateTime
    } else {
      let latestDate = new Date(0)
      data.forEach(item => {
        const itemDate = parseThaiTimestamp(item.timestamp)
        if (itemDate && itemDate > latestDate) {
          latestDate = itemDate
        }
      })
      referenceDate = latestDate
    }

    const counts: Record<string, number> = {}

    if (chartPeriod === 'hourly') {
      // Past 60 minutes from reference point, in 5-minute intervals (12 bars)
      for (let i = 11; i >= 0; i--) {
        const date = new Date(referenceDate)
        date.setMinutes(date.getMinutes() - (i * 5), 0, 0)
        const key = date.toISOString().substring(0, 16) // YYYY-MM-DDTHH:MM
        counts[key] = 0
      }

      data.forEach(item => {
        const date = parseThaiTimestamp(item.timestamp)
        if (date) {
          // Find the appropriate 5-minute bucket for this timestamp
          for (let i = 11; i >= 0; i--) {
            const bucketDate = new Date(referenceDate)
            bucketDate.setMinutes(bucketDate.getMinutes() - (i * 5), 0, 0)
            const nextBucketDate = new Date(bucketDate)
            nextBucketDate.setMinutes(nextBucketDate.getMinutes() + 5)
            
            if (date >= bucketDate && date < nextBucketDate) {
              const key = bucketDate.toISOString().substring(0, 16)
              counts[key]++
              break
            }
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse timestamp:', item.timestamp)
        }
      })

      return Object.entries(counts).map(([dateMinute, count]) => ({
        label: new Date(dateMinute + ':00').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        value: count,
        date: dateMinute
      }))
    } else if (chartPeriod === 'daily') {
      // Past 24 hours from reference point
      for (let i = 23; i >= 0; i--) {
        const date = new Date(referenceDate)
        date.setHours(date.getHours() - i, 0, 0, 0)
        const key = date.toISOString().substring(0, 13) // YYYY-MM-DDTHH
        counts[key] = 0
      }

      data.forEach(item => {
        const date = parseThaiTimestamp(item.timestamp)
        if (date) {
          const key = date.toISOString().substring(0, 13) // YYYY-MM-DDTHH
          if (counts.hasOwnProperty(key)) {
            counts[key]++
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse timestamp:', item.timestamp)
        }
      })

      return Object.entries(counts).map(([dateHour, count]) => ({
        label: new Date(dateHour + ':00:00').getHours().toString().padStart(2, '0') + ':00',
        value: count,
        date: dateHour
      }))
    } else if (chartPeriod === 'weekly') {
      // Past 7 days from reference point
      for (let i = 6; i >= 0; i--) {
        const date = new Date(referenceDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const key = date.toISOString().split('T')[0]
        counts[key] = 0
      }

      data.forEach(item => {
        const date = parseThaiTimestamp(item.timestamp)
        if (date) {
          const key = date.toISOString().split('T')[0]
          if (counts.hasOwnProperty(key)) {
            counts[key]++
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse timestamp:', item.timestamp)
        }
      })

      return Object.entries(counts).map(([date, count]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count,
        date
      }))
    } else {
      // Past 30 days from reference point
      for (let i = 29; i >= 0; i--) {
        const date = new Date(referenceDate)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const key = date.toISOString().split('T')[0]
        counts[key] = 0
      }

      data.forEach(item => {
        const date = parseThaiTimestamp(item.timestamp)
        if (date) {
          const key = date.toISOString().split('T')[0]
          if (counts.hasOwnProperty(key)) {
            counts[key]++
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse timestamp:', item.timestamp)
        }
      })

      return Object.entries(counts).map(([date, count]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count,
        date
      }))
    }
  }, [data, chartPeriod, selectedDateTime])

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />
  }

  // Show admin dashboard if authenticated
  return (
    <>
      {/* Mobile Layout (< 768px) */}
      <div className="block md:hidden min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Header */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Fortune Tell Admin</h1>
                  <p className="text-sm text-gray-600">Manage and view fortune telling data</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={fetchData} 
                    disabled={loading} 
                    size="mobile"
                  >
                    {loading ? 'Loading...' : 'Refresh Data'}
                  </Button>
                  <Button 
                    onClick={exportCSV} 
                    variant="outline"
                    size="mobile"
                  >
                    Export CSV
                  </Button>
                  <Button 
                    onClick={clearAllData} 
                    disabled={clearingAll || data.length === 0}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    size="mobile"
                  >
                    {clearingAll ? 'Clearing...' : 'Clear All Data'}
                  </Button>
                  <Button 
                    onClick={() => setShowPasswordModal(true)} 
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                    size="mobile"
                  >
                    Change Password
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                    size="mobile"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-base font-semibold mb-3 text-gray-900">Summary</h2>
              <div className="grid grid-cols-1 gap-4">
                {/* Unique Emails */}
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {new Set(data.map(item => item.userData.email)).size}
                  </div>
                  <div className="text-sm text-gray-600">Unique Emails</div>
                </div>
                
                {/* Age Groups Breakdown */}
                <div>
                  <div className="text-sm text-gray-600 mb-2">Age Groups</div>
                  <div className="space-y-1">
                    {Object.entries(
                      data.reduce((acc, item) => {
                        acc[item.userData.ageRange] = (acc[item.userData.ageRange] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([ageRange, count]) => (
                      <div key={ageRange} className="flex justify-between text-sm">
                        <span className="text-gray-700">{ageRange}:</span>
                        <span className="font-medium text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Chart */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex flex-col gap-3 mb-4">
                <h2 className="text-base font-semibold text-gray-900">Email Count Trends</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setChartPeriod('hourly')}
                    className={`px-4 py-3 text-sm rounded-lg min-h-[48px] font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                      chartPeriod === 'hourly'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    Hourly
                  </button>
                  <button
                    onClick={() => setChartPeriod('daily')}
                    className={`px-4 py-3 text-sm rounded-lg min-h-[48px] font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                      chartPeriod === 'daily'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setChartPeriod('weekly')}
                    className={`px-4 py-3 text-sm rounded-lg min-h-[48px] font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                      chartPeriod === 'weekly'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-4 py-3 text-sm rounded-lg min-h-[48px] font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                      chartPeriod === 'monthly'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
                
                {/* Date/Time Picker */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date & Time (leave blank for latest data):
                  </label>
                  <DateTimePicker
                    onChange={setSelectedDateTime}
                    value={selectedDateTime}
                    className="w-full text-sm"
                    clearIcon={null}
                    calendarIcon={null}
                  />
                </div>
              </div>
              <div className="h-48">
                <BarChart data={chartData} maxHeight={200} />
              </div>
            </div>

            {/* Mobile Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Mobile Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">User Submissions</h2>
              </div>
              
              {data.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  {loading ? 'Loading data...' : 'No fortune data found'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-gray-900">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Birth Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blood
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200">
                      {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.userData.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.userData.ageRange}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.userData.birthDay}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.userData.bloodGroup}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(() => {
                              const date = parseThaiTimestamp(item.timestamp)
                              if (date) {
                                const timePart = item.timestamp.split(' ')[1]
                                return (
                                  <>
                                    {date.toLocaleDateString('en-GB')}<br/>
                                    <span className="text-xs">{timePart || ''}</span>
                                  </>
                                )
                              }
                              return item.timestamp
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => deleteEntry(item.id)}
                              disabled={deleting === item.id}
                              className="text-red-600 hover:text-red-700 text-sm px-4 py-2 rounded-lg border border-red-300 hover:border-red-400 active:border-red-500 disabled:opacity-50 transition-all duration-200 min-h-[44px] font-medium touch-manipulation active:scale-95 hover:bg-red-50 active:bg-red-100"
                            >
                              {deleting === item.id ? 'ลบ...' : 'ลบ'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Tablet Layout (768px - 1024px) */}
      <div className="hidden md:block xl:hidden min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Tablet Header */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fortune Tell Admin</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage and view fortune telling data</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Data Actions Group */}
                <div className="space-y-2">
                  <Button onClick={fetchData} disabled={loading} size="tablet">
                    {loading ? 'Loading...' : 'Refresh Data'}
                  </Button>
                  <Button onClick={exportCSV} variant="outline" size="tablet">
                    Export CSV
                  </Button>
                  <Button 
                    onClick={clearAllData} 
                    variant="outline"
                    disabled={clearingAll || data.length === 0}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    size="tablet"
                  >
                    {clearingAll ? 'Clearing...' : 'Clear All Data'}
                  </Button>
                </div>
                {/* Auth Actions Group */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowPasswordModal(true)} 
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                    size="tablet"
                  >
                    Change Password
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                    size="tablet"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Stats */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Summary</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Unique Emails */}
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {new Set(data.map(item => item.userData.email)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Emails</div>
              </div>
              
              {/* Age Groups Breakdown */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Age Groups</div>
                <div className="space-y-1">
                  {Object.entries(
                    data.reduce((acc, item) => {
                      acc[item.userData.ageRange] = (acc[item.userData.ageRange] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([ageRange, count]) => (
                    <div key={ageRange} className="flex justify-between text-sm">
                      <span className="text-gray-700">{ageRange}:</span>
                      <span className="font-medium text-blue-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Chart */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Email Count Trends</h2>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setChartPeriod('hourly')}
                  className={`px-3 py-2.5 text-sm rounded-lg min-h-[44px] font-medium transition-all duration-200 ${
                    chartPeriod === 'hourly'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Hourly
                </button>
                <button
                  onClick={() => setChartPeriod('daily')}
                  className={`px-3 py-2.5 text-sm rounded-lg min-h-[44px] font-medium transition-all duration-200 ${
                    chartPeriod === 'daily'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={`px-3 py-2.5 text-sm rounded-lg min-h-[44px] font-medium transition-all duration-200 ${
                    chartPeriod === 'weekly'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-3 py-2.5 text-sm rounded-lg min-h-[44px] font-medium transition-all duration-200 ${
                    chartPeriod === 'monthly'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
              
              {/* Date/Time Picker */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date & Time (leave blank for latest data):
                </label>
                <DateTimePicker
                  onChange={setSelectedDateTime}
                  value={selectedDateTime}
                  className="w-full text-sm"
                  clearIcon={null}
                  calendarIcon={null}
                />
              </div>
            </div>
            <div className="h-56">
              <BarChart data={chartData} maxHeight={220} />
            </div>
          </div>

          {/* Tablet Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-red-600">{error}</p>
            </div>
          )}

          {/* Tablet Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">User Submissions</h2>
            </div>
            
            {data.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                {loading ? 'Loading data...' : 'No fortune data found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-gray-900">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birth Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.userData.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.ageRange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.birthDay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.bloodGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            try {
                              const [datePart, timePart] = item.timestamp.split(' ')
                              const [day, month, year] = datePart.split('/')
                              const actualYear = parseInt(year) > 2500 ? parseInt(year) - 543 : parseInt(year)
                              const date = new Date(actualYear, parseInt(month) - 1, parseInt(day))
                              return (
                                <>
                                  {date.toLocaleDateString('en-GB')}<br/>
                                  <span className="text-xs">{timePart}</span>
                                </>
                              )
                            } catch {
                              return item.timestamp
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => deleteEntry(item.id)}
                            disabled={deleting === item.id}
                            className="text-red-600 hover:text-red-800 text-sm px-4 py-2 rounded-lg border border-red-300 hover:border-red-500 active:border-red-600 disabled:opacity-50 transition-all duration-200 min-h-[44px] font-medium hover:bg-red-50 active:bg-red-100"
                          >
                            {deleting === item.id ? 'ลบ...' : 'ลบ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout (≥ 1024px) */}
      <div className="hidden xl:block min-h-screen bg-gray-100 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fortune Tell Admin</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage and view fortune telling data</p>
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Data Actions Group */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={fetchData} disabled={loading} size="desktop">
                    {loading ? 'Loading...' : 'Refresh Data'}
                  </Button>
                  <Button onClick={exportCSV} variant="outline" size="desktop">
                    Export CSV
                  </Button>
                  <Button 
                    onClick={clearAllData} 
                    variant="outline"
                    disabled={clearingAll || data.length === 0}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    size="desktop"
                  >
                    {clearingAll ? 'Clearing...' : 'Clear All Data'}
                  </Button>
                </div>
                {/* Auth Actions Group */}
                <div className="flex flex-wrap gap-2 lg:ml-auto">
                  <Button 
                    onClick={() => setShowPasswordModal(true)} 
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                    size="desktop"
                  >
                    Change Password
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                    size="desktop"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Unique Emails */}
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {new Set(data.map(item => item.userData.email)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Emails</div>
              </div>
              
              {/* Age Groups Breakdown */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Age Groups</div>
                <div className="space-y-1">
                  {Object.entries(
                    data.reduce((acc, item) => {
                      acc[item.userData.ageRange] = (acc[item.userData.ageRange] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([ageRange, count]) => (
                    <div key={ageRange} className="flex justify-between text-sm">
                      <span className="text-gray-700">{ageRange}:</span>
                      <span className="font-medium text-blue-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Chart */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Email Count Trends</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setChartPeriod('hourly')}
                  className={`px-4 py-2 text-sm rounded-lg min-h-[42px] font-medium transition-all duration-200 hover:shadow-sm ${
                    chartPeriod === 'hourly'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Hourly
                </button>
                <button
                  onClick={() => setChartPeriod('daily')}
                  className={`px-4 py-2 text-sm rounded-lg min-h-[42px] font-medium transition-all duration-200 hover:shadow-sm ${
                    chartPeriod === 'daily'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={`px-4 py-2 text-sm rounded-lg min-h-[42px] font-medium transition-all duration-200 hover:shadow-sm ${
                    chartPeriod === 'weekly'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-4 py-2 text-sm rounded-lg min-h-[42px] font-medium transition-all duration-200 hover:shadow-sm ${
                    chartPeriod === 'monthly'
                      ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
              
              {/* Date/Time Picker */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date & Time (leave blank for latest data):
                </label>
                <DateTimePicker
                  onChange={setSelectedDateTime}
                  value={selectedDateTime}
                  className="text-sm"
                  clearIcon={null}
                  calendarIcon={null}
                />
              </div>
            </div>
            <div className="h-48 sm:h-64">
              <BarChart data={chartData} maxHeight={200} />
            </div>
          </div>

          {/* Desktop Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-red-600">{error}</p>
            </div>
          )}

          {/* Desktop Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">User Submissions</h2>
            </div>
            
            {data.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                {loading ? 'Loading data...' : 'No fortune data found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-gray-900">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birth Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.userData.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.ageRange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.birthDay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userData.bloodGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            try {
                              const [datePart, timePart] = item.timestamp.split(' ')
                              const [day, month, year] = datePart.split('/')
                              const actualYear = parseInt(year) > 2500 ? parseInt(year) - 543 : parseInt(year)
                              const date = new Date(actualYear, parseInt(month) - 1, parseInt(day))
                              return (
                                <>
                                  {date.toLocaleDateString('en-GB')}<br/>
                                  <span className="text-xs">{timePart}</span>
                                </>
                              )
                            } catch {
                              return item.timestamp
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => deleteEntry(item.id)}
                            disabled={deleting === item.id}
                            className="text-red-600 hover:text-red-800 text-sm px-4 py-2 rounded-lg border border-red-300 hover:border-red-500 active:border-red-600 disabled:opacity-50 transition-all duration-200 min-h-[42px] font-medium hover:bg-red-50 active:bg-red-100 hover:shadow-sm"
                          >
                            {deleting === item.id ? 'ลบ...' : 'ลบ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => setShowPasswordModal(false)}
      />
    </>
  )
}