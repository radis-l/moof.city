'use client'

import { useEffect, useState } from 'react'
import { getEnvironmentBadge } from '@/lib/environment'
import { getCurrentWebVitals } from '@/lib/web-vitals'
import { getPerformanceGrade } from '@/lib/performance'

interface EnvironmentBadgeProps {
  forceStorage?: string;
  forceEnvironment?: string;
  showPerformance?: boolean;
}

export function EnvironmentBadge({ forceStorage, forceEnvironment, showPerformance = false }: EnvironmentBadgeProps) {
  const [mounted, setMounted] = useState(false)
  const [performanceGrade, setPerformanceGrade] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    
    // Get performance grade if requested
    if (showPerformance) {
      getCurrentWebVitals().then((vitals) => {
        const grade = getPerformanceGrade({
          lcp: vitals.LCP,
          fid: vitals.FID,
          cls: vitals.CLS,
        })
        setPerformanceGrade(grade)
      }).catch(() => {
        // Ignore errors
      })
    }
  }, [showPerformance])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  // Use centralized environment detection
  const envInfo = getEnvironmentBadge()
  
  // Override with server-side data if provided
  const displayEnvironment = forceEnvironment || envInfo.environment
  const displayStorage = forceStorage || envInfo.storage
  
  // Update color based on storage - using subtle accents
  let dotColor = 'bg-white/50'
  if (displayStorage.toLowerCase().includes('sqlite')) dotColor = 'bg-blue-400'
  if (displayStorage.toLowerCase().includes('supabase')) dotColor = 'bg-purple-400'
  if (displayStorage.toLowerCase().includes('error')) dotColor = 'bg-rose-500'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/5 backdrop-blur-md text-white/70 px-3 py-2 rounded-full text-[10px] font-medium border border-white/10 shadow-2xl transition-all duration-300">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 ${dotColor} rounded-full ${displayStorage.includes('...') ? 'animate-pulse' : ''} shadow-[0_0_8px_rgba(255,255,255,0.5)]`}></div>
          <div className="flex space-x-1.5 divide-x divide-white/10">
            <span className="uppercase tracking-widest opacity-60">{displayEnvironment}</span>
            <span className="pl-1.5 opacity-80">{displayStorage}</span>
            {showPerformance && performanceGrade && (
              <span className="pl-1.5 opacity-80">Perf: {performanceGrade}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}