'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FortuneDataEntry } from '@/types'

interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalCount: number
  totalPages: number
}

interface FortuneTableProps {
  fortunes: FortuneDataEntry[]
  onDelete: (id: string) => Promise<void>
  pagination: PaginationState
  onNextPage: () => void
  onPrevPage: () => void
  onJumpToPage: (page: number) => void
  onItemsPerPageChange: (limit: number) => void
  isLoading?: boolean
}

export function FortuneTable({
  fortunes,
  onDelete,
  pagination,
  onNextPage,
  onPrevPage,
  onJumpToPage,
  onItemsPerPageChange,
  isLoading
}: FortuneTableProps) {
  const [jumpToPage, setJumpToPage] = useState('')

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10)
    if (pageNum && pageNum >= 1 && pageNum <= pagination.totalPages) {
      onJumpToPage(pageNum)
      setJumpToPage('')
    }
  }

  return (
    <div>
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
              {fortunes.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} border-b border-white/5 last:border-0 hover:bg-white/[0.08] transition-colors`}
                >
                  <td className="p-4 font-medium">{item.userData.email}</td>
                  <td className="p-4 opacity-70">{item.userData.ageRange}</td>
                  <td className="p-4 opacity-70">{item.userData.birthDay}</td>
                  <td className="p-4 opacity-70">{item.userData.bloodGroup}</td>
                  <td className="p-4 text-xl font-bold text-purple-400">
                    {item.fortuneResult.luckyNumber}
                  </td>
                  <td className="p-4 opacity-60 text-xs">
                    {new Date(item.timestamp).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      onClick={() => onDelete(item.id)}
                      disabled={isLoading}
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
          
          {fortunes.length === 0 && !isLoading && (
            <div className="text-center text-white/60 py-8">ไม่มีข้อมูล</div>
          )}
        </div>
      </div>

      {fortunes.length > 0 && (
        <div className="card-mystical p-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrevPage}
                disabled={isLoading || pagination.currentPage === 1}
                size="sm"
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs px-3"
              >
                ← ก่อนหน้า
              </Button>
              
              <div className="text-white text-sm px-3">
                หน้า <span className="font-bold text-purple-400">{pagination.currentPage}</span> / {pagination.totalPages}
              </div>
              
              <Button
                onClick={onNextPage}
                disabled={isLoading || pagination.currentPage === pagination.totalPages}
                size="sm"
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-xs px-3"
              >
                ถัดไป →
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">ไปที่หน้า:</span>
              <Input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                placeholder={`1-${pagination.totalPages}`}
                className="w-20 h-8 text-xs bg-white/5 border-white/10 text-center"
                disabled={isLoading}
              />
              <Button
                onClick={handleJumpToPage}
                disabled={isLoading || !jumpToPage}
                size="sm"
                className="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 text-xs px-3"
              >
                ไป
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">แสดง:</span>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
                disabled={isLoading}
                className="h-8 px-2 text-xs bg-white/5 border border-white/10 rounded text-white hover:bg-white/10 transition-colors"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-white/60 text-xs">รายการ/หน้า</span>
            </div>
          </div>

          <div className="text-center text-white/40 text-xs mt-3 pt-3 border-t border-white/5">
            ทั้งหมด {pagination.totalCount.toLocaleString()} รายการ
          </div>
        </div>
      )}
    </div>
  )
}
