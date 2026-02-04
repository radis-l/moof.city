'use client'

import { Button } from '@/components/ui/button'
import type { FortuneDataEntry } from '@/types'

interface ExportButtonProps {
  fortunes: FortuneDataEntry[]
}

export function ExportButton({ fortunes }: ExportButtonProps) {
  const handleExport = () => {
    if (fortunes.length === 0) {
      alert('ไม่มีข้อมูลให้ export')
      return
    }

    // Create CSV content
    const headers = ['อีเมล', 'อายุ', 'วันเกิด', 'กรุ๊ปเลือด', 'เลขนำโชค', 'ความรัก', 'การงาน', 'สุขภาพ', 'วันที่']
    const rows = fortunes.map(item => [
      item.userData.email,
      item.userData.ageRange,
      item.userData.birthDay,
      item.userData.bloodGroup,
      item.fortuneResult.luckyNumber,
      item.fortuneResult.relationship,
      item.fortuneResult.work,
      item.fortuneResult.health,
      new Date(item.timestamp).toLocaleString('th-TH')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `fortune-data-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleExport}
      disabled={fortunes.length === 0}
      size="sm"
      className="bg-green-600/30 hover:bg-green-600/50 text-xs border border-green-500/30"
    >
      📥 Export CSV
    </Button>
  )
}
