'use client'

import { useMemo } from 'react'
import type { FortuneDataEntry } from '@/types'

interface AnalyticsStats {
  total: number
  last7Days: number
  last30Days: number
  todayCount: number
  bloodGroupDistribution: Record<string, number>
  ageRangeDistribution: Record<string, number>
  birthDayDistribution: Record<string, number>
  averageLuckyNumber: number
}

interface UseAnalyticsReturn {
  stats: AnalyticsStats
}

export function useAnalytics(fortunes: FortuneDataEntry[]): UseAnalyticsReturn {
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    let last7Days = 0
    let last30Days = 0
    let todayCount = 0
    const bloodGroupDistribution: Record<string, number> = {}
    const ageRangeDistribution: Record<string, number> = {}
    const birthDayDistribution: Record<string, number> = {}
    let totalLuckyNumber = 0

    fortunes.forEach(fortune => {
      const timestamp = new Date(fortune.timestamp)
      
      // Time-based counts
      if (timestamp >= today) todayCount++
      if (timestamp >= sevenDaysAgo) last7Days++
      if (timestamp >= thirtyDaysAgo) last30Days++

      // Distributions
      const bloodGroup = fortune.userData.bloodGroup
      bloodGroupDistribution[bloodGroup] = (bloodGroupDistribution[bloodGroup] || 0) + 1

      const ageRange = fortune.userData.ageRange
      ageRangeDistribution[ageRange] = (ageRangeDistribution[ageRange] || 0) + 1

      const birthDay = fortune.userData.birthDay
      birthDayDistribution[birthDay] = (birthDayDistribution[birthDay] || 0) + 1

      // Lucky number average
      totalLuckyNumber += fortune.fortuneResult.luckyNumber
    })

    return {
      total: fortunes.length,
      last7Days,
      last30Days,
      todayCount,
      bloodGroupDistribution,
      ageRangeDistribution,
      birthDayDistribution,
      averageLuckyNumber: fortunes.length > 0 ? Math.round(totalLuckyNumber / fortunes.length) : 0
    }
  }, [fortunes])

  return { stats }
}
