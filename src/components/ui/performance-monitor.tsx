'use client'

import { useEffect } from 'react'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const reportMetrics = (metrics: Partial<PerformanceMetrics>) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', metrics)
      }
      // In production, metrics are monitored via Vercel Analytics
      // Could extend with custom analytics service if needed
    }

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[]
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        reportMetrics({ fcp: fcpEntry.startTime })
      }

      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            reportMetrics({ lcp: entry.startTime })
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming
            reportMetrics({ fid: fidEntry.processingStart - entry.startTime })
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
            if (!clsEntry.hadRecentInput) {
              reportMetrics({ cls: clsEntry.value })
            }
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      // Time to First Byte
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart
        reportMetrics({ ttfb })
      }

      // Cleanup observer after 10 seconds
      setTimeout(() => observer.disconnect(), 10000)
    }

    // Wait for page to load
    if (document.readyState === 'complete') {
      measureWebVitals()
    } else {
      window.addEventListener('load', measureWebVitals, { once: true })
    }

    // Monitor resource loading times
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Resources taking > 1s
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`)
        }
      }
    })
    
    resourceObserver.observe({ entryTypes: ['resource'] })

    return () => {
      resourceObserver.disconnect()
    }
  }, [])

  // This component doesn't render anything
  return null
}

