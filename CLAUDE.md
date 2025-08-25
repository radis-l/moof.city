# MOOF Fortune Telling - AI Development Context

## 🎯 Project Overview
Thai fortune telling website with one-time fortune per email. Users submit age/birth day/blood group → get personalized prediction + lucky number.

## 🏗️ Architecture
- **Framework**: Next.js 15.5.0 App Router + TypeScript
- **Storage**: Hybrid (JSON files dev, Redis production)
- **Authentication**: bcrypt + HTTP-only cookies + environment variables
- **UI**: Tailwind CSS 4.0, mobile-first
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
- **Mobile First**: Responsive design priority

## 🔧 Recent Changes
- ❌ Removed "ดูดวงใหม่" button from results
- ✅ Added email existence check in questionnaire
- ✅ Enhanced admin with interactive charts
- ✅ Fixed Buddhist year timestamp parsing
- ✅ Added hourly filter to bar chart (H/D/W/M)
- ✅ Implemented secure admin authentication system
- ✅ Added password change interface via admin panel

## 🔐 Authentication System
- **Login**: `/admin` requires password authentication
- **Security**: bcrypt hashing (salt rounds: 12) + HTTP-only session cookies
- **Password Storage**: `.env.local` file (protected from Git)
- **Password Management**: Change password via admin UI
- **Session**: 24-hour expiry, secure logout functionality
- **APIs**: `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`, `/api/auth/change-password`
## 🚀 Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

---
**Status**: Production Ready | **Features**: 22/22 ✅ | **Files**: 27 TypeScript
