/**
 * Web Vitals Tracking for moof.city
 * Tracks Core Web Vitals and sends to GA4 and Vercel Analytics
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
    dataLayer: unknown[];
    // Vercel Analytics
    va?: (event: string, name: string, data?: Record<string, unknown>) => void;
  }
}

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType?: string;
}

/**
 * Get performance rating based on Web Vitals thresholds
 */
function getWebVitalRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  // Updated thresholds based on 2025 Web Vitals standards
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Web Vitals to Google Analytics 4
 */
function trackToGA4(metric: WebVitalsMetric) {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      metric_id: metric.id,
      navigation_type: metric.navigationType || 'unknown',
    });
  } catch (error) {
    console.error('Failed to track Web Vital to GA4:', error);
  }
}

/**
 * Track Web Vitals to Vercel Analytics
 */
function trackToVercelAnalytics(metric: WebVitalsMetric) {
  if (typeof window === 'undefined' || !window.va) return;

  try {
    window.va('event', 'web_vitals', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  } catch (error) {
    console.error('Failed to track Web Vital to Vercel:', error);
  }
}

/**
 * Log Web Vitals in development
 */
function logInDevelopment(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV !== 'development') return;

  const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
  console.log(`${emoji} Web Vital: ${metric.name}`, {
    value: `${metric.value.toFixed(2)}ms`,
    rating: metric.rating,
    delta: `${metric.delta.toFixed(2)}ms`,
    id: metric.id,
  });
}

/**
 * Main Web Vitals reporting function
 * Called automatically by Next.js when using reportWebVitals export
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Add rating if not present
  if (!metric.rating) {
    metric.rating = getWebVitalRating(metric.name, metric.value);
  }

  // Send to multiple analytics platforms
  trackToGA4(metric);
  trackToVercelAnalytics(metric);
  logInDevelopment(metric);

  // Track to custom performance monitoring if needed
  if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
    (window as any).performanceMonitor.trackWebVital(metric);
  }
}

/**
 * Track custom performance metrics
 */
export function trackCustomMetric(name: string, value: number, unit: string = 'ms') {
  if (typeof window === 'undefined') return;

  // Use Performance API to mark custom metrics
  if (performance && performance.mark) {
    performance.mark(`custom:${name}`);
  }

  // Track to GA4
  if (window.gtag) {
    window.gtag('event', 'custom_performance', {
      event_category: 'Performance',
      metric_name: name,
      metric_value: Math.round(value),
      metric_unit: unit,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Custom Metric: ${name} = ${value}${unit}`);
  }
}

/**
 * Track API response times
 */
export function trackAPIResponseTime(endpoint: string, duration: number, success: boolean) {
  trackCustomMetric(`api_${endpoint}`, duration, 'ms');

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'api_performance', {
      event_category: 'Performance',
      api_endpoint: endpoint,
      response_time: Math.round(duration),
      success: success,
    });
  }
}

/**
 * Get current Web Vitals scores
 */
export function getCurrentWebVitals(): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    const vitals: Record<string, number> = {};

    // Use web-vitals library if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Get LCP
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // Ignore if not supported
      }

      // Get FID/INP
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            vitals.FID = entry.processingStart - entry.startTime;
          });
        }).observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // Ignore if not supported
      }

      // Get CLS
      try {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.CLS = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // Ignore if not supported
      }

      // Return after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 1000);
    } else {
      resolve({});
    }
  });
}

/**
 * Check if performance is acceptable
 */
export function isPerformanceAcceptable(vitals: Record<string, number>): boolean {
  const checks = {
    LCP: vitals.LCP ? vitals.LCP <= 2500 : true,
    FID: vitals.FID ? vitals.FID <= 100 : true,
    CLS: vitals.CLS ? vitals.CLS <= 0.1 : true,
  };

  return Object.values(checks).every(check => check);
}
