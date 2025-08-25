# MOOF Fortune Telling - AI Development Context

## 🎯 Project Overview
Thai fortune telling website with one-time fortune per email. Users submit age/birth day/blood group → get personalized prediction + lucky number.

## 🏗️ Architecture
- **Framework**: Next.js 15.5.0 App Router + TypeScript
- **Storage**: Hybrid (JSON files dev, Redis production)
- **UI**: Tailwind CSS 4.0, mobile-first
- **Languages**: Thai interface, no external APIs

## 📁 Key Files
```
src/
├── app/
│   ├── page.tsx                    # Landing (email input)
│   ├── fortune/page.tsx            # 3-step form
│   ├── fortune/result/page.tsx     # Results display
│   ├── admin/page.tsx              # Dashboard + analytics
│   └── api/storage/                # 6 API endpoints
├── components/ui/
│   ├── bar-chart.tsx              # Admin chart (NEW)
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
- **Admin Analytics**: Bar chart with D/M/W filters

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

## 🚀 Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code linting
```

---
**Status**: Production Ready | **Features**: 18/18 ✅ | **Files**: 24 TypeScript