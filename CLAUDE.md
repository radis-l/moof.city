# AI_RULES.md - AI Operating Manual

> **Optimized for AI Agent Context Usage** - Quick reference for maximum development efficiency

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
- **Pages**: `src/app/` (Next.js App Router)
- **APIs**: `src/app/api/` (storage & auth endpoints)
- **Storage**: `src/lib/storage/` (Hybrid: SQLite local, Supabase prod)
- **Types**: `src/types/index.ts` (TypeScript definitions)
- **Utils**: `src/lib/utils.ts` (parseThaiTimestamp, etc.)

### Environment Detection
```typescript
// Storage method priority:
// Production: Supabase (when SUPABASE_URL && SUPABASE_ANON_KEY exist)
// Local Dev: SQLite (data/local.db) - fast, isolated
// Fallback: Hybrid storage system with environment detection
```

---

## 📁 Project Architecture

### Core Concept
**Thai fortune telling website** - One fortune per email, mobile-only (768px breakpoint), deterministic results.

### Tech Stack
- **Framework**: Next.js 16.1.6 + React 19.2.4 + TypeScript 5.x
- **Styling**: Tailwind CSS 4.0 + Custom glassmorphism system  
- **Storage**: Hybrid System (SQLite local, Supabase prod)
- **Auth**: bcrypt + HttpOnly Cookies (24h expiry, admin_session)
- **Animation**: Dynamic Lottie imports (bundle optimized)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (email input)
│   ├── fortune/page.tsx   # 3-step questionnaire  
│   ├── fortune/result/    # Fortune display
│   ├── admin/page.tsx     # Protected analytics dashboard
│   └── api/               # API endpoints (storage + auth)
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
// Always use hybrid storage (SQLite local, Supabase prod)
import { saveFortune, checkEmail } from '@/lib/storage/hybrid-storage'

// Save fortune
await saveFortune(userData, fortuneResult)

// Check email existence  
const result = await checkEmail(email)
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

---

## ⚡ Performance Optimizations

### Bundle Size Management
- **Dynamic Imports**: LoadingAnimation uses dynamic Lottie loading
- **Current Bundle**: ~400KB per route
- **Lazy Loading**: Particle backgrounds loaded asynchronously

### Mobile-First Enforcement
- **Desktop detection**: Redirects or shows mobile-only message if width >= 768px.

---

## 🚨 Critical Rules

### Security
- **Never commit** `data/` directory (contains local DB)
- **Always use** environment variables for Supabase keys (no hardcoded fallbacks)
- **Strict storage**: Use the hybrid storage orchestration layer

### Code Quality  
- **Mobile-first** design (768px breakpoint strictly enforced)
- **Thai language** only in UI (no English fallbacks)
- **Deterministic fortunes** (same input = same output always)
- **TypeScript strict** mode (no `any` types allowed)

---

*This AI_RULES.md is optimized for AI context consumption. Each section provides immediate, actionable information for maximum development efficiency.*
