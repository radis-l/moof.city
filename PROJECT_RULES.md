# PROJECT_RULES.md - AI Operating Manual

> **Optimized for AI Agent Context Usage** - Quick reference for maximum efficiency

## 🎯 Quick Reference

### Essential Commands
```bash
npm run dev         # Development server
npm run build       # Production build  
npm run lint        # ESLint check
npm run type-check  # TypeScript validation
npm run test:utils  # Unit tests (vitest only)
```

### Key File Paths
- **Components**: `src/components/ui/` (buttons, inputs, animations)
- **Pages**: `src/app/` (Next.js 15 App Router)
- **APIs**: `src/app/api/` (storage & auth endpoints)
- **Storage**: `src/lib/storage/` (Hybrid: SQLite local, Supabase prod)
- **Types**: `src/types/index.ts` (TypeScript definitions)
- **Utils**: `src/lib/utils.ts` (parseThaiTimestamp, etc.)

### Environment Detection
```typescript
// Storage method priority:
// Production: Supabase (when SUPABASE_URL && SUPABASE_ANON_KEY exist)
// Local Dev: SQLite (data/local.db) - fast, isolated
// Fallback: JSON files in data/ (emergency only, git-ignored)
```

---

## 📁 Project Architecture

### Core Concept
**Thai fortune telling website** - One fortune per email, mobile-only (768px breakpoint), deterministic results.

### Tech Stack
- **Framework**: Next.js 15.5.2 + React 19.1.1 + TypeScript 5.x
- **Styling**: Tailwind CSS 4.0 + Custom glassmorphism system  
- **Storage**: Hybrid System (SQLite local, Supabase prod, JSON fallback)
- **Auth**: bcrypt + HTTP-only cookies (24h expiry)
- **Animation**: Dynamic Lottie imports (bundle optimized)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (email input)
│   ├── fortune/page.tsx   # 3-step questionnaire  
│   ├── fortune/result/    # Fortune display
│   ├── admin/page.tsx     # Protected analytics dashboard
│   └── api/               # 10 API endpoints (storage + auth)
├── components/
│   ├── ui/                # Reusable components
│   └── layout/            # MobileLayout wrapper
├── lib/
│   ├── storage/           # Hybrid storage system
│   ├── fortune-generator.ts # Deterministic algorithm
│   ├── analytics.ts       # GA4 event tracking
│   └── utils.ts           # Thai timestamp parsing
└── types/index.ts         # TypeScript definitions
```

---

## 🚀 Implementation Patterns

### 1. Storage Operations
```typescript
// Always use hybrid storage (SQLite local, Supabase prod, JSON fallback)
import { saveFortuneData, checkEmailExists } from '@/lib/storage/hybrid-storage'

// Save fortune
await saveFortuneData(userData, fortuneResult)

// Check email existence  
const result = await checkEmailExists(email)
```

### 2. Fortune Generation (Deterministic)
```typescript
import { generateFortune } from '@/lib/fortune-generator'

const fortune = generateFortune({
  age: '26-35' as AgeRange,
  birthDay: 'Monday' as BirthDay,  
  bloodGroup: 'A' as BloodGroup
})
// Always returns same result for same input
```

### 3. Component Creation Template
```typescript
'use client'

import { useState, useEffect } from 'react'

interface ComponentProps {
  className?: string
  // Define props
}

export const Component = ({ className = '' }: ComponentProps) => {
  // Component logic
  return (
    <div className={`base-styles ${className}`}>
      {/* Content */}
    </div>
  )
}
```

### 4. API Route Pattern
```typescript
// src/app/api/*/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Process data
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
```

---

## ⚡ Performance Optimizations

### Bundle Size Management
- **Dynamic Imports**: LoadingAnimation uses dynamic Lottie loading
- **Current Bundle**: Fortune pages ~407KB (down from 723KB)
- **Lazy Loading**: Particle backgrounds loaded asynchronously

### Mobile-First Enforcement
```typescript
// Desktop detection and redirect
if (typeof window !== 'undefined' && window.innerWidth >= 768) {
  // Show mobile-only message
}
```

### Animation Performance
```css
/* Hardware acceleration pattern */
.animated-element {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}
```

---

## 🎨 Design System

### Glassmorphism Classes
```css
.card-mystical {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

### Color Palette
- **Primary Purple**: `rgba(139, 92, 246, 1)`  
- **Glow Effect**: `rgba(139, 92, 246, 0.4)`
- **Glass Background**: `rgba(255, 255, 255, 0.1)`

### Typography Scale (Major Third - 1.250)
- **Base**: 18px (`text-base`)
- **Small**: 14px (`text-sm`)  
- **Large**: 24px (`text-xl`)
- **Fortune Numbers**: 68px (`text-5xl`)

---

## 🔧 Common Operations

### Adding New Component
1. Create in `src/components/ui/ComponentName.tsx`
2. Follow TypeScript strict mode (no `any` types)
3. Use glassmorphism classes for mystical theme
4. Export from `src/components/ui/index.ts` if needed

### Adding New API Endpoint
1. Create `src/app/api/name/route.ts`
2. Use hybrid storage for data operations
3. Return consistent JSON format: `{ success: boolean, data?, error? }`
4. Add proper error handling and validation

### Working with Analytics
```typescript
import { trackEvent } from '@/lib/analytics'

// Track user action
trackEvent('user_action', {
  category: 'engagement',
  action: 'button_click',
  label: 'fortune_start'
})
```

---

## 🐛 Troubleshooting Guide

### Build Errors
| Error | Solution |
|-------|----------|
| `Unexpected any` | Use proper TypeScript types, avoid `any` |
| `Module not found` | Check import paths use `@/` alias |
| `Hydration mismatch` | Check client-only logic in useEffect |

### Bundle Size Warnings
- **Over 400KB**: Check for large imports, use dynamic loading
- **Lottie Issues**: Ensure LoadingAnimation uses dynamic imports
- **Large Assets**: Optimize images, use WebP/AVIF formats

### Storage Issues
- **Dev**: Check `data/` directory exists and is writable
- **Prod**: Verify `VERCEL_KV` environment variables
- **Hybrid**: Ensure environment detection logic works

### Mobile Layout Issues
- **Desktop View**: Check 768px breakpoint enforcement
- **Responsive**: Use mobile-first CSS classes
- **Viewport**: Confirm viewport meta tag in layout.tsx

---

## 📊 Current State (December 2024)

### Recent Optimizations
- ✅ **Bundle Reduced**: 300KB savings via dynamic Lottie imports
- ✅ **Git Setup**: Comprehensive .gitignore, .env.example  
- ✅ **TypeScript Strict**: Zero ESLint warnings
- ✅ **Testing**: Vitest-only approach (5/5 tests passing)

### Quality Status
- **Build**: ✅ Successful
- **Linting**: ✅ Zero errors  
- **Types**: ✅ Full compliance
- **Tests**: ✅ All passing
- **Security**: ✅ Sensitive data git-ignored

### Performance Metrics
- **Fortune Page**: 407KB (target: <400KB)
- **Admin Page**: 424KB  
- **Landing Page**: 404KB
- **Loading Time**: <2s on 3G

---

## 🚨 Critical Rules

### Security
- **Never commit** `data/` directory (contains admin credentials)
- **Always use** hybrid storage for cross-environment compatibility
- **Validate inputs** on both client and server side

### Code Quality  
- **Mobile-first** design (768px breakpoint strictly enforced)
- **Thai language** only in UI (no English fallbacks)
- **Deterministic fortunes** (same input = same output always)
- **TypeScript strict** mode (no `any` types allowed)

### Performance
- **Dynamic imports** for large dependencies (Lottie, particles)
- **Hardware acceleration** for animations
- **Bundle monitoring** (keep under 400KB per route)

---

## 🎯 Decision Tree

### When user asks to add new feature:
1. **Check mobile-first** - Will it work on 768px screens?
2. **Check Thai language** - All UI text must be Thai
3. **Check bundle impact** - Use dynamic imports if >50KB
4. **Update tests** - Add to `tests/utils-only.spec.ts` if needed

### When debugging issues:
1. **Check environment** - Dev vs Prod behavior different?
2. **Check TypeScript** - Run `npm run type-check`
3. **Check mobile layout** - Test at 768px width
4. **Check storage** - Hybrid system routing correctly?

### When optimizing performance:
1. **Measure first** - Run build to see bundle sizes
2. **Dynamic imports** - For components >30KB
3. **Hardware acceleration** - Add CSS transforms
4. **Lazy loading** - Use intersection observer

---

*This CLAUDE.md is optimized for AI context consumption. Each section provides immediate, actionable information for maximum development efficiency.*