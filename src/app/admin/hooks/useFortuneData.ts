'use client'

import { useState, useCallback } from 'react'
import type { FortuneDataEntry } from '@/types'

interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalCount: number
  totalPages: number
}

interface UseFortuneDataReturn {
  fortunes: FortuneDataEntry[]
  isLoading: boolean
  error: string
  pagination: PaginationState
  storageMode: string
  deleteFortune: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  nextPage: () => void
  prevPage: () => void
  jumpToPage: (page: number) => void
  setItemsPerPage: (limit: number) => void
  refresh: () => Promise<void>
}

export function useFortuneData(): UseFortuneDataReturn {
  const [fortunes, setFortunes] = useState<FortuneDataEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [storageMode, setStorageMode] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPageState] = useState(50)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const fetchData = useCallback(async (page: number, limit: number) => {
    setIsLoading(true)
    setError('')
    
    try {
      const offset = (page - 1) * limit
      const response = await fetch(
        `/api/admin?limit=${limit}&offset=${offset}&orderBy=generated_at&order=desc`,
        { cache: 'no-store' }
      )
      
      const result = await response.json()
      
      if (result.success) {
        setFortunes(result.data)
        setTotalCount(result.count || 0)
        if (result.storageMode) setStorageMode(result.storageMode)
        setError('')
      } else {
        setError('ไม่สามารถโหลดข้อมูลได้')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteFortune = async (id: string): Promise<void> => {
    if (!confirm('แน่ใจว่าต้องการลบ?')) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFortunes(prev => prev.filter(item => item.id !== id))
        setTotalCount(prev => prev - 1)
        setError('')
      } else {
        setError(`ลบข้อมูลไม่สำเร็จ: ${result.error || result.message || 'ไม่ทราบสาเหตุ'}`)
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = async (): Promise<void> => {
    if (!confirm('แน่ใจว่าต้องการลบข้อมูลทั้งหมด?')) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-all' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFortunes([])
        setTotalCount(0)
        setError('')
      } else {
        setError(`ล้างข้อมูลไม่สำเร็จ: ${result.error || result.message || 'ไม่ทราบสาเหตุ'}`)
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อล้างข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      fetchData(newPage, itemsPerPage)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      fetchData(newPage, itemsPerPage)
    }
  }

  const jumpToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchData(page, itemsPerPage)
    }
  }

  const setItemsPerPage = (limit: number) => {
    setItemsPerPageState(limit)
    setCurrentPage(1)
    fetchData(1, limit)
  }

  const refresh = useCallback(async () => {
    await fetchData(currentPage, itemsPerPage)
  }, [fetchData, currentPage, itemsPerPage])

  return {
    fortunes,
    isLoading,
    error,
    pagination: {
      currentPage,
      itemsPerPage,
      totalCount,
      totalPages
    },
    storageMode,
    deleteFortune,
    clearAll,
    nextPage,
    prevPage,
    jumpToPage,
    setItemsPerPage,
    refresh
  }
}
