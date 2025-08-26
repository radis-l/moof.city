# MOOF Fortune Telling - AI Development Context

## 🎯 Project Overview
Thai fortune telling website with one-time fortune per email. Users submit age/birth day/blood group → get personalized prediction + lucky number.

## 🏗️ Architecture
- **Framework**: Next.js 15.5.0 App Router + TypeScript
- **Storage**: Hybrid (JSON files dev, Vercel KV production)
- **Authentication**: Database-based password storage + bcrypt + HTTP-only cookies
- **UI**: Tailwind CSS 4.0, mobile-first with mystical particle effects
- **Fonts**: MuseoModerno logo, Kanit body, Maitree headings
- **Languages**: Thai interface, no external APIs

## 📁 Key Files
```
src/
├── app/
│   ├── page.tsx                    # Landing (email input)
│   ├── fortune/page.tsx            # 3-step form
│   ├── fortune/result/page.tsx     # Results display
│   ├── admin/page.tsx              # Protected dashboard + analytics
│   ├── api/storage/                # 6 API endpoints
│   └── api/auth/                   # 3 authentication endpoints
├── components/ui/
│   ├── bar-chart.tsx              # Admin chart with H/D/W/M filters
│   ├── admin-login.tsx            # Secure login form
│   ├── change-password-modal.tsx  # Password management UI
│   └── [4 other UI components]
├── lib/
│   ├── fortune-generator.ts        # Algorithm (96+ variations)
│   └── storage/hybrid-storage.ts   # Auto-switching storage
└── types/index.ts                  # All TypeScript types
```

## 🔄 User Flow (ONE-TIME POLICY)
1. **Email Check**: Existing users → results, new users → form
2. **Form**: Age → Birth day → Blood group (progress bar)  
3. **Results**: Lucky number + 3 fortune categories (no retake)
4. **Storage**: Auto-saved, duplicate prevention

## 💻 Development Patterns
- **Email Validation**: Always check existence before questionnaire
- **Fortune Generation**: Deterministic (same input = same output)
- **Components**: Functional with hooks, full TypeScript
- **Error Handling**: Thai messages, graceful fallbacks
- **Admin Analytics**: Bar chart with H/D/W/M filters (Hourly/Daily/Weekly/Monthly)
- **Admin Security**: Password-protected with bcrypt hashing and session management

## ⚠️ Critical Constraints
- **One Fortune Per Email**: No questionnaire retaking
- **No External Dependencies**: Completely offline
- **Thai Language Only**: Native text, no translations
- **Mobile Only**: Strict mobile-only design (768px breakpoint)
- **No Desktop/Tablet Access**: Shows redirect message on larger screens

## 🎨 UI/UX Patterns
- **Floating Buttons**: Individual backdrop-blur backgrounds on buttons
- **Card System**: `card-mystical` class for containers with blur effects
- **Typography**: CSS variables for consistent sizing (`var(--text-*)`)
- **Header Navigation**: Clickable "ดูดวงฟรีกับ MOOF" returns to home
- **Minimal Icons**: Removed decorative emojis (stars, clovers) from main content
- **Spacing Consistency**: Standardized `mt-8 mb-4` for "Powered by MOOF"

## 🔧 Recent Changes (Latest Session)
- ✅ **Database-Based Admin System**: Replaced .env password storage with hybrid database
- ✅ **Logo Font Consistency**: Fixed MOOF logo rendering across all loading screens
- ✅ **Codebase Cleanup**: Removed unused imports, optimized Tailwind config
- ✅ **Spacing Improvements**: Better user info layout and divider visibility
- ✅ **Sticky Button Optimization**: Reduced bottom padding (140px → 100px)
- ✅ **Error Handling**: Enhanced admin password change with proper error messages
- ✅ **Deployment Fixes**: Resolved Vercel build issues with proper ES6 imports

## 🔐 Authentication System  
- **Login**: `/admin` with password `Punpun12` (auto-initialized)
- **Storage**: Development: `data/admin-config.json` (Git ignored) | Production: Vercel KV
- **Security**: bcrypt hashing (salt rounds: 12) + HTTP-only session cookies
- **Password Management**: Change password via admin UI (persists across deployments)
- **Session**: 24-hour expiry, secure logout functionality
- **APIs**: `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`, `/api/auth/change-password`
## 🚀 Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

---
**Status**: Production Ready | **Features**: 25/25 ✅ | **Files**: 36 TypeScript  
**Latest Update**: Database-based admin system with font consistency fixes
