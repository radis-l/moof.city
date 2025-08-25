'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { FortuneDataEntry } from '@/types'

export default function AdminPage() {
  const [data, setData] = useState<FortuneDataEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string>('')
  const [clearingAll, setClearingAll] = useState(false)

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

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fortune Tell Admin</h1>
              <p className="text-gray-600">Manage and view fortune telling data</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchData} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Data'}
              </Button>
              <Button onClick={exportCSV} variant="outline">
                Export CSV
              </Button>
              <Button 
                onClick={clearAllData} 
                variant="outline"
                disabled={clearingAll || data.length === 0}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                {clearingAll ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* User Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">User Submissions</h2>
          </div>
          
          {data.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {loading ? 'Loading data...' : 'No fortune data found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                        {new Date(item.timestamp.split(' ').reverse().join('-')).toLocaleDateString('en-GB')} <br/>
                        <span className="text-xs">{item.timestamp.split(' ')[1]}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => deleteEntry(item.id)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded border border-red-300 hover:border-red-500 disabled:opacity-50 transition-colors"
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
  )
}