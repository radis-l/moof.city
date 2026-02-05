# MOOF Fortune Telling

Thai fortune telling website - one fortune per email, mobile-only design.

## Quick Start

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** - Styling
- **Supabase** - Production database
- **SQLite** - Local development
- **Edge Runtime** - Fast API responses
- **Web Crypto API** - PBKDF2-SHA256 password hashing

## Features

- Personalized fortune based on age, birth day, blood group
- Lucky number generation (10-99)
- Love, career, health predictions in Thai
- Mobile-only experience (768px breakpoint)
- Admin dashboard with analytics

## Environment Variables

```bash
# Supabase (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key

# Security
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password

# Optional
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
npm run analyze      # Bundle analyzer
```

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [docs/PERFORMANCE_MONITORING.md](docs/PERFORMANCE_MONITORING.md) - Performance guide
- [docs/RATE_LIMITING.md](docs/RATE_LIMITING.md) - Rate limiting

## Database Setup

Run in Supabase SQL editor:

```sql
CREATE INDEX IF NOT EXISTS idx_prod_fortunes_email ON prod_fortunes(email);
CREATE INDEX IF NOT EXISTS idx_prod_fortunes_generated_at ON prod_fortunes(generated_at DESC);
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup instructions.
