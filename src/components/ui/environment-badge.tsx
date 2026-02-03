'use client'

import { useEffect, useState } from 'react'
import { getEnvironmentBadge } from '@/lib/environment'

interface EnvironmentBadgeProps {
  forceStorage?: string;
  forceEnvironment?: string;
}

export function EnvironmentBadge({ forceStorage, forceEnvironment }: EnvironmentBadgeProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  // Use centralized environment detection
  const envInfo = getEnvironmentBadge()
  
  // Override with server-side data if provided
  const displayEnvironment = forceEnvironment || envInfo.environment
  const displayStorage = forceStorage || envInfo.storage
  
  // Update color based on storage
  let badgeColor = envInfo.color
  if (displayStorage.toLowerCase().includes('sqlite')) badgeColor = 'bg-blue-600'
  if (displayStorage.toLowerCase().includes('supabase')) badgeColor = 'bg-green-600'
  if (displayStorage.toLowerCase().includes('error')) badgeColor = 'bg-red-600'

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${badgeColor} text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-all duration-300 border border-white/20`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-white rounded-full ${displayStorage.includes('...') ? 'animate-pulse' : ''}`}></div>
          <div>
            <div className="font-bold">{displayEnvironment}</div>
            <div className="text-xs opacity-90">{displayStorage}</div>
          </div>
        </div>
      </div>
    </div>
  )
}