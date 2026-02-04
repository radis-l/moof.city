/**
 * Performance Monitoring Utilities for moof.city
 * Provides utilities for measuring and tracking performance metrics
 */

/**
 * Performance Mark - Create a performance mark
 */
export function mark(name: string) {
  if (typeof window !== 'undefined' && performance && performance.mark) {
    try {
      performance.mark(name);
    } catch (e) {
      console.warn(`Failed to create performance mark: ${name}`, e);
    }
  }
}

/**
 * Performance Measure - Measure time between two marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if (typeof window !== 'undefined' && performance && performance.measure) {
    try {
      const measureName = `measure:${name}`;
      performance.measure(measureName, startMark, endMark);
      
      const entries = performance.getEntriesByName(measureName);
      if (entries.length > 0) {
        const entry = entries[entries.length - 1];
        return entry.duration;
      }
    } catch (e) {
      console.warn(`Failed to measure performance: ${name}`, e);
    }
  }
  return null;
}

/**
 * Time a function execution
 */
export async function timeFunction<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const startMark = `start:${name}`;
  const endMark = `end:${name}`;
  
  mark(startMark);
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    mark(endMark);
    measure(name, startMark, endMark);
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    mark(endMark);
    console.error(`Function ${name} failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Track API call performance
 */
export async function trackAPI<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  const markName = `api:${endpoint}`;
  
  mark(`${markName}:start`);
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    mark(`${markName}:end`);
    measure(markName, `${markName}:start`, `${markName}:end`);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 API ${endpoint}: ${duration.toFixed(2)}ms`);
    }
    
    // Track to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_performance', {
        event_category: 'Performance',
        api_endpoint: endpoint,
        response_time: Math.round(duration),
        success: true,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    mark(`${markName}:error`);
    
    // Track error to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_performance', {
        event_category: 'Performance',
        api_endpoint: endpoint,
        response_time: Math.round(duration),
        success: false,
      });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API ${endpoint} failed after ${duration.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
}

/**
 * Track component render time
 */
export function trackComponentRender(componentName: string, duration: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎨 Component ${componentName}: ${duration.toFixed(2)}ms`);
  }
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'component_render', {
      event_category: 'Performance',
      component_name: componentName,
      render_time: Math.round(duration),
    });
  }
}

/**
 * Track database query performance
 */
export async function trackDBQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  const markName = `db:${queryName}`;
  
  mark(`${markName}:start`);
  
  try {
    const result = await query();
    const duration = performance.now() - startTime;
    
    mark(`${markName}:end`);
    measure(markName, `${markName}:start`, `${markName}:end`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 DB Query ${queryName}: ${duration.toFixed(2)}ms`);
    }
    
    // Track to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'db_performance', {
        event_category: 'Performance',
        query_name: queryName,
        query_time: Math.round(duration),
        success: true,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ DB Query ${queryName} failed after ${duration.toFixed(2)}ms`, error);
    }
    
    throw error;
  }
}

/**
 * Get all performance entries
 */
export function getPerformanceEntries(): PerformanceEntry[] {
  if (typeof window !== 'undefined' && performance && performance.getEntries) {
    return performance.getEntries();
  }
  return [];
}

/**
 * Get performance entries by type
 */
export function getPerformanceEntriesByType(type: string): PerformanceEntry[] {
  if (typeof window !== 'undefined' && performance && performance.getEntriesByType) {
    return performance.getEntriesByType(type);
  }
  return [];
}

/**
 * Clear performance marks and measures
 */
export function clearPerformanceMarks(name?: string) {
  if (typeof window !== 'undefined' && performance) {
    if (name) {
      performance.clearMarks(name);
      performance.clearMeasures(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

/**
 * Get navigation timing metrics
 */
export function getNavigationTiming() {
  if (typeof window === 'undefined' || !performance || !performance.timing) {
    return null;
  }
  
  const timing = performance.timing;
  const navigationStart = timing.navigationStart;
  
  return {
    // Time to first byte
    ttfb: timing.responseStart - navigationStart,
    
    // DNS lookup time
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    
    // TCP connection time
    tcp: timing.connectEnd - timing.connectStart,
    
    // Request time
    request: timing.responseEnd - timing.requestStart,
    
    // Response time
    response: timing.responseEnd - timing.responseStart,
    
    // DOM processing time
    domProcessing: timing.domComplete - timing.domLoading,
    
    // DOM ready time
    domReady: timing.domContentLoadedEventEnd - navigationStart,
    
    // Load complete time
    loadComplete: timing.loadEventEnd - navigationStart,
  };
}

/**
 * Get memory usage (Chrome only)
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined') return null;
  
  const perf = performance as any;
  if (perf.memory) {
    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      usedPercentage: (perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100,
    };
  }
  
  return null;
}

/**
 * Log performance summary
 */
export function logPerformanceSummary() {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('📊 Performance Summary');
  
  // Navigation timing
  const navTiming = getNavigationTiming();
  if (navTiming) {
    console.log('Navigation Timing:', {
      'TTFB': `${navTiming.ttfb}ms`,
      'DNS': `${navTiming.dns}ms`,
      'TCP': `${navTiming.tcp}ms`,
      'DOM Ready': `${navTiming.domReady}ms`,
      'Load Complete': `${navTiming.loadComplete}ms`,
    });
  }
  
  // Memory usage
  const memory = getMemoryUsage();
  if (memory) {
    console.log('Memory Usage:', {
      'Used': `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      'Total': `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      'Limit': `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      'Used %': `${memory.usedPercentage.toFixed(2)}%`,
    });
  }
  
  // Performance marks
  const marks = getPerformanceEntriesByType('mark');
  if (marks.length > 0) {
    console.log('Performance Marks:', marks.map(m => m.name));
  }
  
  console.groupEnd();
}

/**
 * Monitor FPS (Frames Per Second)
 */
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private rafId: number | null = null;
  
  start() {
    const measure = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - this.lastTime;
      
      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎬 FPS: ${this.fps}`);
        }
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }
  
  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  getFPS(): number {
    return this.fps;
  }
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for low-end indicators
  const memory = getMemoryUsage();
  if (memory && memory.jsHeapSizeLimit < 1024 * 1024 * 1024) {
    return true; // Less than 1GB heap limit
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  // Check device pixel ratio
  if (window.devicePixelRatio && window.devicePixelRatio < 1.5) {
    return true;
  }
  
  return false;
}

/**
 * Get performance grade based on Web Vitals
 */
export function getPerformanceGrade(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
}): 'A' | 'B' | 'C' | 'D' | 'F' {
  let score = 0;
  let count = 0;
  
  if (metrics.lcp !== undefined) {
    if (metrics.lcp <= 2500) score += 100;
    else if (metrics.lcp <= 4000) score += 70;
    else score += 40;
    count++;
  }
  
  if (metrics.fid !== undefined) {
    if (metrics.fid <= 100) score += 100;
    else if (metrics.fid <= 300) score += 70;
    else score += 40;
    count++;
  }
  
  if (metrics.cls !== undefined) {
    if (metrics.cls <= 0.1) score += 100;
    else if (metrics.cls <= 0.25) score += 70;
    else score += 40;
    count++;
  }
  
  const average = count > 0 ? score / count : 0;
  
  if (average >= 90) return 'A';
  if (average >= 75) return 'B';
  if (average >= 60) return 'C';
  if (average >= 50) return 'D';
  return 'F';
}
