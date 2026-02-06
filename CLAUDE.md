# AI_RULES.md - AI Operating Manual

> **Optimized for AI Agent Context Usage** - Quick reference for maximum development efficiency

## 🎯 Quick Reference

### Essential Commands
```bash
npm run dev         # Development server
npm run build       # Production build
npm run lint        # ESLint check
npm run type-check  # TypeScript validation
```

### Key File Paths
- **Components**: `src/components/ui/` (buttons, inputs, animations)
- **Pages**: `src/app/` (Next.js App Router)
- **APIs**: `src/app/api/` (storage & auth endpoints)
- **Storage**: `src/lib/storage/` (Supabase only - dev/prod table separation)
- **Types**: `src/types/index.ts` (TypeScript definitions)
- **Utils**: `src/lib/utils.ts` (cn, parseThaiTimestamp)

### Environment Detection
```typescript
// Storage: Supabase only (no SQLite)
// Dev/Prod tables are separated in Supabase
// Requires: SUPABASE_URL && SUPABASE_ANON_KEY
```

---

## 📁 Project Architecture

### Core Concept
**Thai fortune telling website** - One fortune per email, mobile-only (768px breakpoint), deterministic results.

### Tech Stack
- **Framework**: Next.js 16.1.6 + React 19.2.4 + TypeScript 5.x
- **Styling**: Tailwind CSS 4.0 + shadcn/ui components + Custom glassmorphism system
- **Storage**: Supabase (dev/prod table separation)
- **Auth**: bcrypt + HttpOnly Cookies (24h expiry, admin_session)
- **Animation**: Dynamic Lottie imports + Framer Motion + tailwindcss-animate

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
│   ├── ui/                # Reusable components (shadcn + custom)
│   └── layout/            # MobileLayout wrapper
├── lib/
│   ├── storage/           # Supabase storage layer
│   ├── fortune-generator.ts # Deterministic algorithm
│   ├── analytics.ts       # GA4 event tracking
│   └── utils.ts           # cn (class merge), parseThaiTimestamp
└── types/index.ts         # TypeScript definitions
```

---

## 🚀 Implementation Patterns

### 1. Storage Operations
```typescript
// Supabase-only storage (no SQLite)
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
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  // Define props
}

export const Component = ({ className = '' }: ComponentProps) => {
  // Component logic
  return (
    <div className={cn('base-styles', className)}>
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
- **Always use** environment variables for Supabase keys (no hardcoded fallbacks)
- **Required env vars**: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, ADMIN_PASSWORD

### Code Quality
- **Mobile-first** design (768px breakpoint strictly enforced)
- **Thai language** only in UI (no English fallbacks)
- **Deterministic fortunes** (same input = same output always)
- **TypeScript strict** mode (no `any` types allowed)

---

## MCP Tools

This project has a `.mcp.json` that provides **Supabase MCP** at the project level. This gives Claude Code direct access to the Supabase project (SQL queries, table management, migrations, edge functions) via OAuth.

### Available MCP Servers (when running Claude Code in this project)
- **Supabase** (project-level via `.mcp.json`) - Database operations, migrations, edge functions
- **GitHub** (global) - Repository operations, PRs, issues
- **Stripe** (global) - Payment integrations
- **Vercel** (global) - Deployments, domains
- **shadcn** (global) - UI component registry
- **context7** (global) - Library documentation lookup

### Supabase Notes
- Dev/prod tables are separated within the same Supabase project
- Project credentials in `.env.local` (SUPABASE_URL, SUPABASE_ANON_KEY)
- MCP auth is handled via OAuth (no tokens in `.mcp.json`)

---

*This AI_RULES.md is optimized for AI context consumption. Each section provides immediate, actionable information for maximum development efficiency.*
