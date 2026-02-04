# Edge Runtime Performance Benchmarks

## Overview

This document tracks the performance improvements achieved by migrating the admin API from Node.js runtime with bcrypt to Edge Runtime with Web Crypto API.

**Migration Date**: 2026-02-04  
**Branch**: performance/phase-1-2-optimizations

## Key Metrics Tracked

1. **Bundle Size** - Total JavaScript bundle size for admin API route
2. **Cold Start Time** - Time to first response for cold function invocation
3. **Warm Response Time** - Response time for already initialized function
4. **Function Duration** - Total execution time from request to response
5. **Monthly Cost** - Estimated Vercel function invocation costs

## Pre-Migration Baseline (Node.js Runtime)

### Bundle Size Analysis

Run the following to analyze current bundle:
```bash
npm run analyze
```

**Expected Results (Node.js + bcrypt):**
- bcryptjs library: ~200KB
- jsonwebtoken library: ~50KB
- Node.js runtime overhead: ~100KB
- **Total Admin API Bundle**: ~350KB+

### Cold Start Performance

**Measurement Method:**
1. Clear all function cache (deploy fresh)
2. Make first admin login request
3. Measure Time-To-First-Byte (TTFB)

**Expected Results:**
- Cold start: 300-500ms
- Includes: Runtime initialization + Module loading + bcrypt operations

### Warm Response Performance

**Measurement Method:**
1. Make multiple consecutive requests
2. Average response time

**Expected Results:**
- Warm response: 50-100ms
- bcrypt.compare(): ~50-80ms
- JWT operations: ~5-10ms

### Monthly Cost Estimate (Before)

**Assumptions:**
- 1000 admin logins/month
- Average cold start: 400ms
- Average warm request: 75ms
- Vercel pricing: $0.60 per 1M GB-seconds

**Calculation:**
```
Cold starts (10%): 100 requests × 400ms = 40 seconds
Warm requests (90%): 900 requests × 75ms = 67.5 seconds
Total execution time: 107.5 seconds/month
Bundle size: 350KB = 0.35GB
GB-seconds: 107.5 × 0.35 = 37.6 GB-seconds/month
Cost: 37.6 × $0.60 / 1,000,000 = $0.0000226/month
```

*Note: Actual costs scale with usage*

## Post-Migration Results (Edge Runtime)

### Bundle Size Analysis

Run after migration:
```bash
npm run analyze
```

**Expected Results (Edge + Web Crypto):**
- Web Crypto API: 0KB (native)
- Custom JWT (Web Crypto): ~5KB
- Edge runtime overhead: ~50KB
- **Total Admin API Bundle**: ~55KB

**Improvement**: 84% reduction (350KB → 55KB)

### Cold Start Performance

**Measurement Method:**
1. Deploy edge runtime version
2. Clear function cache
3. Measure first request TTFB

**Expected Results:**
- Cold start: <50ms
- Includes: Edge runtime initialization + Module loading

**Improvement**: 10x faster (400ms → <50ms)

### Warm Response Performance

**Measurement Method:**
1. Make multiple consecutive requests
2. Average response time

**Expected Results:**
- Warm response: 10-30ms
- Web Crypto verification: ~10-20ms
- JWT operations: ~5ms

**Improvement**: 3-5x faster (75ms → 20ms)

### Monthly Cost Estimate (After)

**Assumptions:**
- 1000 admin logins/month
- Average cold start: 50ms
- Average warm request: 20ms
- Vercel pricing: $0.60 per 1M GB-seconds

**Calculation:**
```
Cold starts (10%): 100 requests × 50ms = 5 seconds
Warm requests (90%): 900 requests × 20ms = 18 seconds
Total execution time: 23 seconds/month
Bundle size: 55KB = 0.055GB
GB-seconds: 23 × 0.055 = 1.27 GB-seconds/month
Cost: 1.27 × $0.60 / 1,000,000 = $0.00000076/month
```

**Improvement**: 97% cost reduction

## Performance Summary

| Metric | Before (Node.js) | After (Edge) | Improvement |
|--------|------------------|--------------|-------------|
| Bundle Size | 350KB | 55KB | 84% smaller |
| Cold Start | 400ms | 50ms | 10x faster |
| Warm Response | 75ms | 20ms | 3.75x faster |
| GB-seconds/month | 37.6 | 1.27 | 97% reduction |
| Estimated Cost | $0.0000226 | $0.00000076 | 97% cheaper |

## Real-World Benchmarking Instructions

### 1. Measure Bundle Size

```bash
# Before migration
git checkout main
npm run analyze

# After migration
git checkout performance/phase-1-2-optimizations
npm run analyze

# Compare the output in .next/analyze/
```

### 2. Measure Cold Start Time

**Using curl with timing:**
```bash
# Deploy to preview
vercel --prod=false

# Clear browser cache and cookies
# Make first request with timing
curl -w "@curl-format.txt" -o /dev/null -s https://your-preview-url.vercel.app/api/admin
```

**curl-format.txt:**
```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_appconnect:  %{time_appconnect}s\n
time_pretransfer:  %{time_pretransfer}s\n
time_redirect:  %{time_redirect}s\n
time_starttransfer:  %{time_starttransfer}s (COLD START)\n
time_total:  %{time_total}s\n
```

### 3. Measure Warm Response Time

**Using Apache Bench (ab):**
```bash
# Make 100 requests to warm up function
ab -n 100 -c 1 -m POST -H "Content-Type: application/json" \
   -p login.json https://your-url.vercel.app/api/admin

# login.json:
# {"action": "login", "password": "your-password"}
```

### 4. Monitor in Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Analytics
2. Navigate to Functions → Admin API
3. Monitor:
   - Average duration
   - P50, P75, P99 response times
   - Invocation count
   - Cost estimates

## Actual Results (To Be Filled After Deployment)

### Production Measurements

**Date of Measurement**: _____________

| Metric | Measured Value | vs Expected |
|--------|----------------|-------------|
| Bundle Size (Edge) | ________ KB | Expected: 55KB |
| Cold Start (Edge) | ________ ms | Expected: <50ms |
| Warm Response (Edge) | ________ ms | Expected: 10-30ms |
| P95 Response Time | ________ ms | Expected: <100ms |
| P99 Response Time | ________ ms | Expected: <150ms |

### Bundle Analysis Output

```
Paste output from npm run analyze here
```

### Load Test Results

```
Paste Apache Bench or other load test results here
```

### Cost Analysis (30 Days)

**Actual Usage:**
- Total admin requests: ________
- Total function duration: ________ seconds
- Total GB-seconds: ________
- Actual cost: $________

**Compared to Estimated:**
- Estimated cost: $0.00000076/month
- Actual cost: $________
- Variance: ________%

## Key Takeaways

### Performance Wins

1. **Instant Cold Starts**: Edge runtime eliminates the 300-500ms Node.js bootstrap time
2. **Tiny Bundle**: Removing bcrypt saves 200KB+ of JavaScript
3. **Native Crypto**: Web Crypto API is implemented in the runtime (0KB bundle cost)
4. **Lower Latency**: Edge functions run closer to users geographically

### Trade-offs

1. **Initial Migration Cost**: One-time engineering effort to migrate
2. **Testing Complexity**: Need to test both bcrypt and Web Crypto during transition
3. **Tooling Changes**: Some Node.js debugging tools may not work with Edge Runtime

### Recommendations

1. **Monitor Closely**: Watch error rates for first 48 hours after deployment
2. **Keep Rollback Ready**: bcrypt fallback ensures easy rollback if issues arise
3. **Document Learnings**: Track any edge cases or issues for future migrations
4. **Extend to Other Routes**: Apply same pattern to other API routes for similar gains

## Next Steps

1. [ ] Deploy to preview environment
2. [ ] Run benchmark suite
3. [ ] Record actual metrics in this document
4. [ ] Deploy to production
5. [ ] Monitor for 48 hours
6. [ ] Remove bcrypt dependency after 30 days
7. [ ] Share results with team

## References

- [Vercel Edge Runtime Docs](https://vercel.com/docs/functions/edge-functions)
- [Web Crypto API Performance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Bundle Analyzer Documentation](https://www.npmjs.com/package/@next/bundle-analyzer)
