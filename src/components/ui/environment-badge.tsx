'use client'

import { useEffect, useState } from 'react'

export function EnvironmentBadge() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg opacity-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div>
              <div className="font-bold">Loading</div>
              <div className="text-xs opacity-90">...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Client-side environment detection
  const isDev = process.env.NODE_ENV !== 'production'
  const envInfo = {
    environment: isDev ? 'Development' : 'Production',
    storage: isDev ? 'In-Memory' : 'Supabase DB',
    color: isDev ? 'bg-blue-600' : 'bg-green-600'
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${envInfo.color} text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-opacity duration-300`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div>
            <div className="font-bold">{envInfo.environment}</div>
            <div className="text-xs opacity-90">{envInfo.storage}</div>
          </div>
        </div>
      </div>
    </div>
  )
}