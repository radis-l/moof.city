# Performance Monitoring - Quick Reference

## 🚀 Quick Start

### Track API Performance
```typescript
import { trackAPI } from '@/lib/performance';

const data = await trackAPI('/api/fortune', async () => {
  return fetch('/api/fortune', { method: 'POST', body });
});
```

### Track Custom Metrics
```typescript
import { trackCustomMetric } from '@/lib/performance';

trackCustomMetric('fortune_generation_time', 1234, 'ms');
```

### Monitor FPS
```typescript
import { FPSMonitor } from '@/lib/performance';

const monitor = new FPSMonitor();
monitor.start();
// ... do work
console.log('FPS:', monitor.getFPS());
monitor.stop();
```

---

## 📊 Web Vitals Targets

| Metric | Target | Good | Poor |
|--------|--------|------|------|
| **LCP** | <2.5s | 0-2.5s | >4s |
| **FID** | <100ms | 0-100ms | >300ms |
| **INP** | <200ms | 0-200ms | >500ms |
| **CLS** | <0.1 | 0-0.1 | >0.25 |
| **TTFB** | <800ms | 0-800ms | >1.8s |

---

## 🔍 Accessing Analytics

### Vercel Dashboard
```
https://vercel.com/[team]/moof-city/analytics
```

### Admin Panel
1. Login to `/admin`
2. Click "Open Analytics →" button

### Google Analytics 4
```
Analytics > Reports > Engagement > Events
Filter: web_vitals, api_performance
```

---

## 🎨 CSS Performance Classes

### Optimized Animations
```css
/* GPU-accelerated */
.my-animation {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
}
```

### Respect Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .my-animation {
    animation: none !important;
  }
}
```

### Low-End Devices
```css
@media (max-width: 640px) and (max-resolution: 1dppx) {
  .heavy-effect {
    opacity: 0.3;
    filter: blur(20px);
  }
}
```

---

## 🛠 Performance Utilities

### Time Any Function
```typescript
import { timeFunction } from '@/lib/performance';

const { result, duration } = await timeFunction('myTask', async () => {
  return await doWork();
});
console.log(`Task took ${duration}ms`);
```

### Track DB Queries
```typescript
import { trackDBQuery } from '@/lib/performance';

const users = await trackDBQuery('get-users', async () => {
  return db.query.users.findMany();
});
```

### Check Device Performance
```typescript
import { isLowEndDevice } from '@/lib/performance';

if (isLowEndDevice()) {
  // Disable heavy effects
}
```

### Get Performance Grade
```typescript
import { getPerformanceGrade } from '@/lib/performance';

const grade = getPerformanceGrade({
  lcp: 2000,
  fid: 50,
  cls: 0.05
});
// Returns: 'A' | 'B' | 'C' | 'D' | 'F'
```

---

## 📱 Testing Performance

### Local Lighthouse Audit
```bash
# Chrome DevTools
F12 > Lighthouse > Generate Report
```

### Network Throttling
```bash
# DevTools
F12 > Network > Throttling > Fast 3G
```

### CPU Throttling
```bash
# DevTools
F12 > Performance > Settings > CPU: 4x slowdown
```

### Production Testing
```bash
# PageSpeed Insights
https://pagespeed.web.dev/
```

---

## 🏃 Performance Budgets

| Asset Type | Budget | Enforced |
|------------|--------|----------|
| JavaScript | 300KB | ✅ Error |
| CSS | 100KB | ⚠️ Warning |
| Images | 500KB/page | ⚠️ Warning |
| Total | 1.5MB | ⚠️ Warning |

### Check Budget
```bash
npm run build  # Shows budget warnings/errors
npm run analyze  # Visual bundle analysis
```

---

## 🐛 Troubleshooting

### LCP Too Slow
- [ ] Check TTFB (server response)
- [ ] Optimize images (WebP/AVIF)
- [ ] Preload critical resources
- [ ] Use edge runtime for APIs

### High CLS
- [ ] Add image dimensions
- [ ] Reserve space for dynamic content
- [ ] Use `font-display: swap`
- [ ] Avoid layout shifts

### Low FPS
- [ ] Reduce blur radius
- [ ] Disable animations on low-end devices
- [ ] Use GPU-accelerated properties
- [ ] Reduce animated elements

### Large Bundle
- [ ] Use dynamic imports
- [ ] Remove unused dependencies
- [ ] Enable tree shaking
- [ ] Split vendor chunks

---

## 📚 Documentation

- **Full Guide:** `/docs/PERFORMANCE_MONITORING.md`
- **Quick Reference:** This file

---

## 💡 Best Practices

1. **Always track API calls** - Use `trackAPI()` wrapper
2. **Monitor FPS during development** - Use `FPSMonitor`
3. **Check Web Vitals weekly** - Via Vercel Analytics
4. **Test on real devices** - Don't rely on DevTools alone
5. **Respect reduced motion** - Accessibility matters
6. **Use performance budgets** - Prevent regressions
7. **Document optimizations** - Share knowledge

---

## 🎯 Performance Checklist

### Before Deployment
- [ ] Run Lighthouse audit (score >90)
- [ ] Check bundle size (<300KB)
- [ ] Test on Fast 3G network
- [ ] Test with CPU throttling
- [ ] Verify reduced motion works
- [ ] Check Web Vitals in dev console

### After Deployment
- [ ] Monitor Vercel Speed Insights (24hrs)
- [ ] Check GA4 Web Vitals events
- [ ] Test on real mobile devices
- [ ] Compare before/after metrics
- [ ] Update documentation

---

*Last Updated: February 4, 2026*
