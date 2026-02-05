'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10)
    if (pageNum && pageNum >= 1 && pageNum <= pagination.totalPages) {
      onJumpToPage(pageNum)
      setJumpToPage('')
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div>
      <div className="card-mystical overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-white text-sm">
            <TableHeader className="bg-black/30">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/80">อีเมล</TableHead>
                <TableHead className="text-white/80">อายุ</TableHead>
                <TableHead className="text-white/80">วันเกิด</TableHead>
                <TableHead className="text-white/80">กรุ๊ปเลือด</TableHead>
                <TableHead className="text-white/80">เลขนำโชค</TableHead>
                <TableHead className="text-white/80">วันที่</TableHead>
                <TableHead className="text-white/80 text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortunes.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={`${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'} border-white/5 hover:bg-white/[0.08] transition-colors`}
                >
                  <TableCell className="font-medium text-white">{item.userData.email}</TableCell>
                  <TableCell className="text-white/70">{item.userData.ageRange}</TableCell>
                  <TableCell className="text-white/70">{item.userData.birthDay}</TableCell>
                  <TableCell className="text-white/70">{item.userData.bloodGroup}</TableCell>
                  <TableCell className="text-xl font-bold text-purple-400">
                    {item.fortuneResult.luckyNumber}
                  </TableCell>
                  <TableCell className="text-white/60 text-xs">
                    {new Date(item.timestamp).toLocaleDateString('th-TH')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => handleDeleteClick(item.id)}
                      disabled={isLoading}
                      size="sm"
                      className="bg-red-500/10 hover:bg-red-500/30 text-red-400 text-[10px] px-3 py-1 border border-red-500/20"
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {fortunes.length === 0 && !isLoading && (
            <div className="text-center text-white/60 py-8">ไม่มีข้อมูล</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-white">ยืนยันการลบ</DialogTitle>
            <DialogDescription className="text-white/60">
              ต้องการลบข้อมูลนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white/5 hover:bg-white/10 border-white/10 text-white"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600/80 hover:bg-red-600 text-white border-0"
            >
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Select
                value={pagination.itemsPerPage.toString()}
                onValueChange={(value) => onItemsPerPageChange(parseInt(value, 10))}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-20 text-xs bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  <SelectItem value="25" className="text-white hover:bg-white/10">25</SelectItem>
                  <SelectItem value="50" className="text-white hover:bg-white/10">50</SelectItem>
                  <SelectItem value="100" className="text-white hover:bg-white/10">100</SelectItem>
                </SelectContent>
              </Select>
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
