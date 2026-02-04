# Rate Limiting Documentation - moof.city

## Overview

This document describes the rate limiting implementation for moof.city, which protects the application from abuse, spam, and brute force attacks using **in-memory rate limiting** - zero setup required, works everywhere.

> **Note**: Uses in-memory rate limiting - zero setup required, works everywhere. No external services needed.

## Rate Limit Configurations

### 1. Fortune Generation Rate Limit
- **Limit**: 10 requests per 10 seconds
- **Purpose**: Prevent spam and abuse of fortune generation API
- **Applies to**: `POST /api/fortune`
- **Identifier**: Client IP address
- **Error Message**: "กรุณารอสักครู่ ระบบกำลังประมวลผลคำขอที่มาก่อนหน้า โปรดลองใหม่ในอีก X วินาที"

### 2. Admin Login Rate Limit
- **Limit**: 5 attempts per 15 minutes
- **Purpose**: Prevent brute force password attacks
- **Applies to**: `POST /api/admin` (login action)
- **Identifier**: Client IP address
- **Error Message**: "คุณพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารออีก X นาที"

### 3. Admin Operations Rate Limit
- **Limit**: 30 requests per minute
- **Purpose**: Prevent abuse of admin functionality (delete, clear, data retrieval)
- **Applies to**: `GET /api/admin` and `POST /api/admin` (all authenticated operations)
- **Identifier**: Client IP address
- **Error Message**: "คุณทำงานเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (X วินาที)"

## Setup

**No setup required!** The in-memory rate limiter works out of the box with zero configuration.

### Features
- ✅ No external dependencies
- ✅ Zero configuration needed
- ✅ Works in all environments (dev, staging, production)
- ✅ Automatic cleanup of expired entries
- ✅ Same performance characteristics in all environments

### Trade-offs
- ⚠️ Rate limits reset when server restarts (acceptable for most use cases)
- ⚠️ Each server instance maintains its own rate limit state (not an issue on Vercel's architecture)
- ✅ Simpler, more reliable than external services
- ✅ No external service costs or rate limits

## Implementation Details

### Rate Limiter Configuration

Located in `/src/lib/rate-limit.ts`:

```typescript
// Fortune generation rate limiter
export const fortuneRateLimit = new InMemoryRateLimiter(10, 10000)

// Admin login rate limiter  
export const adminLoginRateLimit = new InMemoryRateLimiter(5, 15 * 60 * 1000)

// Admin operations rate limiter
export const adminOpsRateLimit = new InMemoryRateLimiter(30, 60000)
```

### Client IP Detection

The system detects client IP from multiple headers (for various proxy setups):
1. `x-forwarded-for` (Vercel, AWS)
2. `x-real-ip` (Nginx)
3. `cf-connecting-ip` (Cloudflare)
4. Fallback: `dev-local` (development)

### Response Headers

When rate limit is exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 45
X-RateLimit-Reset: 2026-02-04T10:30:00.000Z

{
  "success": false,
  "error": "กรุณารอสักครู่...",
  "retryAfter": 45
}
```

## Testing Rate Limits

### Manual Testing

1. **Test Fortune Rate Limit** (10 requests in 10 seconds):
```bash
# Send 11 requests quickly
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/fortune \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","ageRange":"18-25","birthDay":"Monday","bloodGroup":"A"}' \
    && echo "\nRequest $i done"
done
```

The 11th request should return `429 Too Many Requests`.

2. **Test Admin Login Rate Limit** (5 attempts in 15 minutes):
```bash
# Try logging in with wrong password 6 times
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin \
    -H "Content-Type: application/json" \
    -d '{"action":"login","password":"wrong"}' \
    && echo "\nAttempt $i"
done
```

The 6th attempt should return `429 Too Many Requests`.

3. **Test Admin Operations Rate Limit** (30 requests per minute):
```bash
# First login with correct password
TOKEN=$(curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d '{"action":"login","password":"your_password"}' \
  -c cookies.txt)

# Then make 31 requests
for i in {1..31}; do
  curl -X GET http://localhost:3000/api/admin \
    -b cookies.txt \
    && echo "\nRequest $i"
done
```

The 31st request should return `429 Too Many Requests`.

## Troubleshooting

### Problem: Rate limits not working

**Debugging steps**:
1. Verify IP detection: `console.log(getClientIp(request))`
2. Test with curl commands above
3. Check server logs for rate limit messages

### Problem: Rate limits reset unexpectedly

**Cause**: Server restart clears in-memory state

**Solution**: This is expected behavior. Rate limits will be reestablished as users make requests.

## Security Considerations

1. **IP Spoofing**: The system trusts proxy headers (`x-forwarded-for`). Ensure your hosting provider (Vercel) validates these headers.

2. **Distributed Attacks**: Rate limits are per-IP. Sophisticated attackers might use multiple IPs. Consider:
   - Cloudflare bot protection (free tier)
   - Additional authentication requirements
   - CAPTCHA for suspicious behavior

3. **Rate Limit Evasion**: Attackers might try to clear cookies or use private browsing. IP-based limiting helps prevent this.

## Future Improvements

Potential enhancements for production scale:

1. **Dynamic Rate Limits**: Adjust limits based on user behavior
2. **Geo-blocking**: Block requests from suspicious regions
3. **Analytics**: Track rate limit violations to identify attack patterns
4. **Allowlist**: Whitelist trusted IPs (e.g., monitoring services)
5. **Custom Error Pages**: Branded 429 error page in Thai
6. **Email Alerts**: Notify admins of repeated violations

---

**Last Updated**: February 4, 2026
**Version**: 2.0.0
**Maintainer**: moof.city development team
