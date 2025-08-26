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
│   └── api/auth/                   # 4 authentication endpoints
├── components/ui/
│   ├── bar-chart.tsx              # Admin chart with H/D/W/M filters
│   ├── admin-login.tsx            # Secure login form
│   ├── change-password-modal.tsx  # Password management UI
│   ├── star-border.tsx            # Animated border component
│   └── [6 other UI components]
├── lib/
│   ├── fortune-generator.ts        # Algorithm (300+ message variations)
│   ├── storage/hybrid-storage.ts   # Auto-switching storage
│   └── validation.ts              # Input validation utilities
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
- **Fortune Categories**: Love (14 messages), Work (21 messages), Health (24+ messages)
- **Personalization**: Age-based advice + blood group traits + birth day modifiers

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
- **Input Enhancement**: Placeholder disappears on focus for better UX (`focus:placeholder-transparent`)
- **Button Gradients**: Purple-to-blue gradients with shadow effects and smooth transitions
- **Animation Components**: StarBorder with configurable speed, color, and border effects
- **Spacing Consistency**: Standardized `mt-8 mb-4` for "Powered by MOOF"

## 🔧 Recent Changes (Latest Sessions)
- ✅ **Work Fortune Enhancement**: Added birth day-specific work predictions with 21 unique messages (3 per weekday)
- ✅ **Health Fortune System**: Comprehensive health advice with blood group and age-based recommendations
- ✅ **Deterministic Fortune Generation**: Seeded selection algorithm ensures identical results on refresh
- ✅ **StarBorder Animation Component**: Reusable animated border with configurable speed/color/thickness
- ✅ **Landing Page UX**: Enhanced input behavior with focus:placeholder-transparent
- ✅ **Button Gradient Styling**: Purple-to-blue gradients with improved hover states
- ✅ **Authentication System**: 4 API endpoints with password change functionality
- ✅ **Mobile-Only Design**: Strict mobile breakpoint enforcement with redirect messages

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
**Status**: Production Ready | **Features**: 30/30 ✅ | **Files**: 36 TypeScript  
**Latest Update**: Birth day-specific work predictions with comprehensive health advice system
