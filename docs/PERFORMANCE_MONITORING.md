# Performance Monitoring Guide

## Monitoring Tools

### Vercel Speed Insights
- Real User Monitoring (RUM)
- Core Web Vitals (LCP, FID/INP, CLS)
- Access: Vercel Dashboard > Analytics > Speed Insights
- Integration: `<SpeedInsights />` in `layout.tsx`

### Vercel Analytics
- Page views, custom events, user flow
- Access: Vercel Dashboard > Analytics
- Integration: `<Analytics />` in `layout.tsx`

### Google Analytics 4
- Web Vitals, user journey, API performance
- Access: GA4 > Reports > Engagement > Events
- Filter by: `web_vitals`, `api_performance`

## Web Vitals Targets

| Metric | Target | Good | Poor |
|--------|--------|------|------|
| **LCP** | <2.5s | 0-2.5s | >4s |
| **FID** | <100ms | 0-100ms | >300ms |
| **INP** | <200ms | 0-200ms | >500ms |
| **CLS** | <0.1 | 0-0.1 | >0.25 |
| **TTFB** | <800ms | 0-800ms | >1.8s |

## Performance Budgets

| Asset Type | Budget |
|------------|--------|
| JavaScript | 300KB |
| CSS | 100KB |
| Images/page | 500KB |
| Total | 1.5MB |

Configured in `next.config.js`. Check with `npm run build` or `npm run analyze`.

## Performance Utilities

```typescript
import {
  trackAPI,
  trackCustomMetric,
  FPSMonitor,
  isLowEndDevice
} from '@/lib/performance';

// Track API calls
const data = await trackAPI('/api/fortune', async () => {
  return fetch('/api/fortune', { method: 'POST', body });
});

// Track custom metrics
trackCustomMetric('fortune_generation_time', 1234, 'ms');

// Monitor FPS
const monitor = new FPSMonitor();
monitor.start();
console.log('FPS:', monitor.getFPS());
monitor.stop();

// Device detection
if (isLowEndDevice()) {
  // Disable heavy effects
}
```

## Optimization Strategies

### CSS
- GPU acceleration: `transform: translateZ(0)`
- Respect reduced motion: `@media (prefers-reduced-motion: reduce)`
- Low-end device detection via media queries

### JavaScript
- Dynamic imports: `dynamic(() => import('@/components/...'))`
- Tree shaking: Import only what you need

### Images
- Next.js Image component with `priority` for above-fold
- WebP/AVIF formats configured in `next.config.js`

### APIs
- Edge Runtime: `export const runtime = 'edge'`
- Response caching headers

## Troubleshooting

### LCP Too Slow (>2.5s)
- Check TTFB (server response)
- Optimize images (WebP/AVIF)
- Preload critical resources
- Use edge runtime for APIs

### High CLS (>0.1)
- Add image dimensions
- Reserve space for dynamic content
- Use `font-display: swap`

### Low FPS on Mobile
- Reduce blur radius
- Disable animations on low-end devices
- Use GPU-accelerated properties

### Large Bundle
- Use dynamic imports
- Remove unused dependencies
- Run `npm run analyze` to identify issues

## Testing

### Local
- Lighthouse: F12 > Lighthouse > Generate Report
- Network throttling: F12 > Network > Fast 3G
- CPU throttling: F12 > Performance > 4x slowdown

### Production
- PageSpeed Insights: https://pagespeed.web.dev/
- Vercel Speed Insights dashboard
- GA4 Web Vitals events
