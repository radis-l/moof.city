'use client'

import { useMemo } from 'react'

interface ChartDataPoint {
  label: string
  value: number
  date: string
}

interface BarChartProps {
  data: ChartDataPoint[]
  maxHeight?: number
  className?: string
}

export function BarChart({ data, maxHeight = 200, className = '' }: BarChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.value), 1)
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end space-x-1" style={{ height: maxHeight }}>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * maxHeight
          
          return (
            <div 
              key={`${item.label}-${index}`} 
              className="flex-1 flex flex-col items-center group relative"
              style={{ height: maxHeight }}
            >
              {/* Bar */}
              <div
                className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm flex items-end justify-center relative mt-auto"
                style={{ height: `${height}px`, minHeight: item.value > 0 ? '4px' : '0px' }}
              >
                {/* Value label on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                  {item.value}
                </div>
                
                {/* Value inside bar for tall bars */}
                {height > 24 && (
                  <span className="text-white text-xs font-medium mb-1">
                    {item.value}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <div className="mt-2 text-xs text-gray-600 text-center leading-tight">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}