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
│   ├── fortune-generator.ts        # Algorithm (200+ message variations)
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
- **Fortune Generation**: Fully deterministic with seeded selection (no Math.random())
- **Refresh Consistency**: Same user data always generates identical fortune content
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
- ✅ **Enhanced Fortune Generator**: Completely revamped fortune algorithm with detailed Thai messages
- ✅ **Deterministic Fortune Selection**: Replaced Math.random() with seeded selection for refresh consistency
- ✅ **Improved Fortune Content**: More personalized predictions combining birth day + blood group traits
- ✅ **Prime Number Distribution**: Uses prime multipliers (31, 17, 13, 23) for better variety while maintaining consistency
- ✅ **Age-Specific Advice**: Tailored health and work guidance based on user's age range
- ✅ **Refresh-Proof Results**: Same user data always generates identical fortune content across sessions

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
**Latest Update**: Implemented deterministic fortune generation ensuring consistent results across refreshes
