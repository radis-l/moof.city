# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Thai fortune telling website with one-time fortune per email. Users submit age/birth day/blood group → get personalized prediction + lucky number.

## Architecture
- **Framework**: Next.js 15.5.0 App Router + TypeScript
- **Storage**: Hybrid system (JSON files in development, Vercel KV in production)
- **Authentication**: bcrypt + HTTP-only cookies with database persistence
- **UI**: Tailwind CSS 4.0, mobile-first (768px breakpoint enforced)
- **Fonts**: MuseoModerno (logo), Kanit (body), Maitree (headings)
- **Languages**: Thai interface only, no external APIs

## Key Architecture Components

### Storage System (`src/lib/storage/`)
- **hybrid-storage.ts**: Auto-detects environment and routes to appropriate storage
- **file-storage.ts**: Development JSON file storage in `data/`
- **kv-storage.ts**: Production Vercel KV storage
- **admin-config-storage.ts**: Admin password management across environments

### Fortune Generation (`src/lib/fortune-generator.ts`)
- **Deterministic Algorithm**: Seeded selection ensures identical results on refresh
- **300+ Message Variations**: Love (14), Work (21), Health (24+) categories
- **Multi-factor Personalization**: Age + blood group + birth day modifiers
- **No Math.random()**: Uses prime number multipliers for consistent variety

### API Architecture
- **Storage APIs** (6 endpoints): save-fortune, check-email, get-data, delete, clear-all, export-csv
- **Auth APIs** (4 endpoints): login, verify, logout, change-password
- **Session Management**: 24-hour expiry with HTTP-only cookies

## Critical Business Logic

### One-Time Fortune Policy
1. Email existence check at landing page
2. Existing users → direct to results
3. New users → 3-step questionnaire
4. Results permanently saved, no retakes allowed

### Mobile-Only Enforcement
- 768px breakpoint strictly enforced
- Desktop/tablet users see redirect message
- All components designed for mobile viewport

## Development Commands
```bash
npm run dev    # Development server with hot reload
npm run build  # Production build with static optimization
npm run lint   # ESLint code linting
```

## Development Patterns

### Fortune Generation Consistency
- Always use seeded selection instead of Math.random()
- Same user data must generate identical fortune across sessions
- Age-based advice combined with blood group traits and birth day energy

### Component Architecture
- Functional components with hooks
- Full TypeScript coverage
- Error handling in Thai language
- `card-mystical` class for glassmorphism containers

### Authentication Flow
- Admin password defaults to `Punpun12` (auto-initialized)
- bcrypt salt rounds: 12
- Password changes persist across deployments via hybrid storage
- Session verification required for all admin operations

## UI/UX Implementation
- **Floating Buttons**: Individual backdrop-blur backgrounds
- **Input Enhancement**: `focus:placeholder-transparent` for better UX
- **Purple-to-blue Gradients**: Consistent button styling with hover effects
- **StarBorder Component**: Configurable animated borders (speed/color/thickness)
- **Typography Variables**: Use `var(--text-*)` for consistent sizing

## Environment-Specific Behavior
- **Development**: JSON files in `data/` directory (git-ignored)
- **Production**: Vercel KV for all storage operations
- **Auto-detection**: `process.env.NODE_ENV === 'production' && process.env.VERCEL`

## Admin Dashboard
- Protected route at `/admin`
- Analytics with H/D/W/M filters (Hourly/Daily/Weekly/Monthly)
- User management and data export (CSV)
- Password change functionality with UI modal