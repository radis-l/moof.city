# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Thai fortune telling website with one-time fortune per email. Users submit age/birth day/blood group → get personalized prediction + lucky number.

**Mobile-First Strategy**: Strictly mobile-only experience (768px breakpoint) with desktop/tablet redirect messaging. Optimized for Thai mobile users with mystical UI design system.

**Performance-Optimized**: Lazy-loaded particle backgrounds, hardware-accelerated animations, optimized font loading with display:swap, and comprehensive performance monitoring.

**Thai-Only Interface**: Complete Thai localization with no external API dependencies. Self-contained fortune generation using deterministic algorithms.

## Architecture
- **Framework**: Next.js 15.5.0 App Router + TypeScript with App Router optimization
- **Storage**: Hybrid system (JSON files in development, Vercel KV in production) with auto-detection
- **Authentication**: bcrypt (12 salt rounds) + HTTP-only cookies with 24-hour expiry and database persistence
- **UI**: Tailwind CSS 4.0 with custom glassmorphism system, mobile-first (768px breakpoint strictly enforced)
- **Fonts**: MuseoModerno (logo), Kanit (body), Maitree (headings) - Major Third typography scale (1.250)
- **Languages**: Thai interface only, no external APIs
- **Performance**: Hardware acceleration, lazy loading, particle system optimization
- **Security**: CSP headers, XSS protection, secure session management

## Key Architecture Components

### Storage System (`src/lib/storage/`)
- **hybrid-storage.ts**: Smart environment detection (`process.env.NODE_ENV === 'production' && process.env.VERCEL`) with automatic routing
- **file-storage.ts**: Development JSON file storage in `data/` directory (git-ignored)
- **kv-storage.ts**: Production Vercel KV storage with error handling and fallbacks
- **admin-config-storage.ts**: Cross-environment admin password management with bcrypt persistence

**Pattern**: Single interface with dual implementations - all storage calls go through hybrid-storage.ts which routes to appropriate backend based on runtime environment detection.

### Fortune Generation Algorithm (`src/lib/fortune-generator.ts`)
- **Deterministic Seeded Selection**: Creates consistent seed from user data (age × 31 + birthDay × 17 + bloodGroup × 13)
- **Prime Number Distribution**: Uses 997 modulo with 23 multiplier for even distribution across message arrays
- **300+ Message Variations**: Relationship (42), Work (42), Health (24) with blood group and age modifiers
- **Multi-factor Personalization**: Age ranges, birth day energy, blood group traits combined mathematically
- **Lucky Number Generation**: 2-digit numbers (10-99) using deterministic formula
- **No Randomness**: Zero Math.random() usage - same input always generates identical output

**Algorithm Flow**: 
1. Create user data seed → 2. Generate selector function → 3. Apply to message arrays → 4. Combine base + modifier messages

### Next.js Performance Optimizations (`next.config.js`)
- **Compression**: gzip enabled, modern image formats (WebP, AVIF)
- **Bundle Optimization**: Package imports optimization, webpack fallbacks for client-side
- **Security Headers**: X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- **Caching Strategy**: Static assets (1 year), favicon optimization
- **Performance Budgets**: 400KB asset/entry limits with warnings

### API Architecture (10 Endpoints)
**Storage APIs** (6 endpoints):
- `POST /api/storage/save-fortune` - Store user fortune data
- `GET /api/storage/check-email` - Verify email existence  
- `GET /api/storage/get-data` - Admin data retrieval
- `DELETE /api/storage/delete?id=` - Remove single entry
- `DELETE /api/storage/clear-all` - Bulk data deletion
- `GET /api/storage/export-csv` - CSV data export

**Authentication APIs** (4 endpoints):
- `POST /api/auth/login` - Admin login with bcrypt verification
- `GET /api/auth/verify` - Session validation
- `POST /api/auth/logout` - Session termination
- `POST /api/auth/change-password` - Password update with re-hashing

**Session Management**: HTTP-only cookies, 24-hour expiry, secure flag in production

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

## Advanced UI/UX Implementation

### Mystical Design System (`globals.css`)
**Typography System**: Major Third scale (1.250) with CSS custom properties
- Base size: 18px (`--text-base: 1.125rem`)
- Scale: `--text-xs` (12px) → `--text-5xl` (68px)
- Font families: `--font-heading` (Maitree), `--font-body` (Kanit), `--font-logo` (MuseoModerno)
- 8-point spacing system: `--space-1` (8px) → `--space-10` (80px)

**Particle Background System**: 
- **Lazy Loading**: Dynamic import with performance monitoring
- **Hardware Acceleration**: `transform: translateZ(0)`, `backface-visibility: hidden`
- **Gradient Spheres**: 4 animated spheres with blur filters (60px-80px)
- **Particle Types**: Small/medium/large with radial gradients and box-shadows
- **Performance**: `will-change: transform`, layout containment

**Glassmorphism System**:
- `card-mystical`: `backdrop-filter: blur(12px)`, rgba backgrounds
- Border: `1px solid rgba(139, 92, 246, 0.2)`
- Hover states with transform and shadow effects

### Mobile-First Component Patterns
**Responsive Breakpoint Enforcement**:
- Desktop users see mystical redirect message with animated logo
- Mobile detection via `window.innerWidth >= 768`
- Analytics tracking for desktop warning displays

**Floating Button System**:
- `mobile-sticky-button`: Fixed positioning with `z-index: 9999`
- Safe area support: `padding-bottom: env(safe-area-inset-bottom)`
- Individual backdrop-blur backgrounds for floating effect

**Input Enhancement Patterns**:
- `focus:placeholder-transparent` for UX improvement
- Purple accent colors matching design system
- Thai text optimization with proper word-break and line-height

### Animation & Performance Systems
**StarBorder Component**: Configurable animated borders
- Speed, color, thickness customization
- CSS keyframes: `star-movement-top/bottom`
- Opacity and transform animations

**Performance Monitoring** (`PerformanceMonitor`):
- Client-side performance tracking
- Memory usage monitoring
- Frame rate optimization alerts

## Development Patterns

### Component Architecture Standards
- **Functional Components**: React hooks pattern with TypeScript
- **Error Boundaries**: Thai language error messages
- **Memoization**: React.memo for performance-critical components
- **Lazy Loading**: Dynamic imports for heavy components (particle backgrounds)
- **Type Safety**: Full TypeScript coverage with strict mode

### Fortune Generation Consistency Rules
- **Zero Randomness**: All fortune generation must be deterministic
- **Seed Consistency**: Same user data → identical results across sessions/devices
- **Message Combination**: Base message + personality modifier pattern
- **Age-Appropriate Content**: Different advice templates per age range
- **Cultural Appropriateness**: Thai cultural context in all messaging

### Authentication & Security Patterns
- **Default Credentials**: Admin password `Punpun12` (auto-initialized on first run)
- **bcrypt Configuration**: 12 salt rounds for optimal security/performance balance
- **Session Management**: 24-hour expiry, HTTP-only cookies, secure flag in production
- **Cross-Environment Persistence**: Password changes survive deployments via hybrid storage
- **Verification Flow**: All admin routes require session validation

## Environment-Specific Behavior
- **Development**: JSON files in `data/` directory (git-ignored)
- **Production**: Vercel KV for all storage operations
- **Auto-detection**: `process.env.NODE_ENV === 'production' && process.env.VERCEL`

## Admin Dashboard
- Protected route at `/admin`
- Analytics with H/D/W/M filters (Hourly/Daily/Weekly/Monthly)
- User management and data export (CSV)
- Password change functionality with UI modal

## Analytics & Tracking System

### Google Analytics 4 Integration (`@next/third-parties/google`)
**Implementation Architecture**:
- **Loading Strategy**: `afterInteractive` with installation verification
- **Environment Detection**: Development debug logging, production optimization
- **Measurement ID**: `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
- **Error Handling**: Graceful degradation when GA4 fails to load
- **Performance**: Async loading with 10-retry wait system

**GA4 Script Integration**:
```javascript
// Layout.tsx automatic initialization with verification callback
gtag('config', MEASUREMENT_ID, {
  page_title: document.title,
  page_location: window.location.href
});
```

### Comprehensive Event Tracking (15+ Events)
**User Journey Funnel**:
- `session_start` - Initial app load with device/user type
- `form_begin` - Email form interaction start
- `email_submit` - New vs returning user differentiation  
- `questionnaire_begin` - 3-step form start
- `form_progress` - Step completion with percentage tracking
- `questionnaire_complete` - Conversion with completion time
- `fortune_complete` - Final fortune generation
- `result_view` - Fortune result engagement
- `result_share` - Social sharing actions

**Technical & UI Events**:
- `page_view` - Custom page naming with user context
- `mobile_warning_show` - Desktop user redirect tracking
- `admin_login` - Authentication success/failure
- `error_occur` - System errors with location context
- `user_engagement` - Time spent tracking

### Event Categorization System
**Categories with Purpose**:
- `user_journey` - Conversion funnel and user flow
- `form_interaction` - Form engagement and submissions
- `engagement` - Content consumption and sharing
- `ui_interaction` - Interface and responsive design
- `error` - Debugging and system monitoring
- `admin` - Administrative operations
- `conversion` - Revenue/value events

### Advanced Analytics Features
**User Segmentation**:
- New vs returning user tracking
- Age group demographics (6 ranges)
- Blood group personality insights (4 types)
- Birth day energy tracking (7 types)
- Email domain analysis

**Conversion Tracking**:
- Fortune completion funnel
- Questionnaire abandonment rates
- Email verification success rates
- Admin dashboard engagement

**Performance Monitoring**:
- Page load times and engagement
- Error rates by location and type
- Mobile vs desktop usage patterns
- Session duration and bounce rates

### Analytics Functions (`src/lib/analytics.ts`)
**Core Functions**:
- `trackEvent()` - Generic event with parameter validation
- `trackPageView()` - Custom page naming with measurement ID routing
- `trackEmailSubmission()` - User type differentiation with email domain tracking
- `trackQuestionnaireStart/Complete()` - Funnel conversion with completion time
- `trackFortuneGeneration()` - Final conversion with user demographic data
- `trackResultView()` - Engagement tracking with context
- `trackError()` - Error logging with type, message, and location
- `trackMobileWarningShown()` - UX analytics for desktop users
- `trackAdminLogin()` - Security monitoring
- `verifyGAInstallation()` - Development debugging and verification

## Page Flow Architecture

### User Journey Flow
1. **Landing Page** (`/`) - Email submission with existence check
2. **Fortune Questionnaire** (`/fortune`) - 3-step form (age → birth day → blood group)
3. **Results Page** (`/fortune/result`) - Generated fortune display
4. **Admin Dashboard** (`/admin`) - Protected analytics and management

### Route Protection & Logic
- **Email Validation**: Real-time regex validation + existence check via API
- **Questionnaire Guards**: Email parameter required, existing users redirected to results
- **Admin Protection**: Session-based authentication with bcrypt verification
- **Mobile Enforcement**: Desktop users redirected at layout level

## Data Flow & State Management

### Client-Side State
- **Form State**: Local React state with validation
- **User Data**: URL parameters for questionnaire flow
- **Session State**: Server-side only (no client-side auth tokens)
- **Loading States**: Per-component loading management

### Server-Side Data Flow
1. **Email Check** → Hybrid Storage lookup
2. **Fortune Generation** → Deterministic algorithm
3. **Data Persistence** → Hybrid storage save
4. **Admin Operations** → Protected CRUD operations

## Security Implementation

### Data Protection
- **Email Privacy**: 30-day retention policy (documented in UI)
- **No PII Storage**: Only age ranges, not exact ages
- **Secure Defaults**: HTTP-only cookies, CSRF protection
- **Input Validation**: Zod schemas, SQL injection prevention

### Authentication Security
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: 24-hour expiry, secure flags
- **Admin Access**: Single admin account with changeable password
- **Brute Force Protection**: Rate limiting considerations

## Performance & Optimization

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: WebP/AVIF formats, responsive sizing
- **Font Loading**: display:swap, preload critical fonts
- **Bundle Analysis**: 400KB performance budgets

### Runtime Performance
- **Particle System**: Hardware acceleration, will-change properties
- **Lazy Loading**: Intersection observer for animations
- **Memory Management**: Component cleanup, event listener removal
- **Analytics**: Async event tracking with fallbacks

## Deployment & Environment

### Production Considerations
- **Environment Variables**: GA4 measurement ID, storage detection
- **Build Optimization**: Static generation where possible
- **CDN Strategy**: Static asset caching (1 year)
- **Database**: Vercel KV auto-scaling

### Development Workflow
- **Local Storage**: JSON files in git-ignored `data/` directory
- **Hot Reloading**: Next.js development server
- **Type Safety**: Strict TypeScript configuration
- **Linting**: ESLint with Next.js configuration

## Troubleshooting & Maintenance

### Common Issues
- **Storage Errors**: Check environment detection logic
- **Fortune Duplicates**: Verify deterministic algorithm consistency
- **Analytics Missing**: Verify GA4 measurement ID setup
- **Mobile Layout**: Confirm 768px breakpoint enforcement

### Monitoring
- **Error Tracking**: GA4 error events with context
- **Performance**: Client-side monitoring via PerformanceMonitor
- **User Analytics**: Conversion funnel tracking
- **Admin Alerts**: Failed authentication attempts

## Design System & Component Architecture

### UI Component Library (`src/components/ui/`)

**Form Components**:
- `Button`: Multiple variants (primary, secondary, outline) with size options (sm, lg)
  - Usage: `<Button variant="outline" size="lg">Text</Button>`
  - Classes: Glassmorphism backgrounds, purple accent colors
- `Input`: Email and text inputs with Thai placeholder support
  - Features: Focus states, validation styles, mobile-optimized
- `RadioGroup`: Custom radio buttons for questionnaire
  - Usage: `<RadioGroup options={OPTIONS} value={value} onChange={setValue} />`

**UI Components**:
- `ProgressBar`: Multi-step progress indicator
  - Usage: `<ProgressBar currentStep={2} totalSteps={3} />`
  - Visual: Purple gradient progress with mystical glow
- `LoadingAnimation`: Lottie-based Star AI loader
  - Usage: `<LoadingAnimation size="medium" className="mx-auto mb-4" />`
  - Sizes: small (32x32), medium (64x64), large (96x96)
  - Features: Hardware acceleration, mystical purple glow effects

**Background Components**:
- `LazyParticleBackground`: Dynamically imported particle system
  - Performance: Lazy loaded, hardware accelerated
  - Visual: Animated gradient spheres with blur effects
- `OptimizedParticleBackground`: Performance-optimized version
  - Features: Reduced particle count, efficient animations

**Layout Components**:
- `MobileLayout`: Main app wrapper with mobile-first design
  - Features: Desktop redirect, particle background integration
  - Breakpoint: 768px enforcement

### Design Tokens & CSS Variables

**Color System** (`globals.css`):
```css
--color-purple-primary: rgba(139, 92, 246, 1)    /* Main brand purple */
--color-purple-glow: rgba(139, 92, 246, 0.4)     /* Glow effects */
--color-gray-900: #111827                         /* Dark backgrounds */
--color-glass-bg: rgba(255, 255, 255, 0.1)       /* Glassmorphism */
```

**Typography Scale** (Major Third - 1.250):
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1.125rem /* 18px - Base size */
--text-lg: 1.25rem    /* 20px */
--text-xl: 1.5rem     /* 24px */
--text-2xl: 1.875rem  /* 30px */
--text-3xl: 2.375rem  /* 38px */
--text-5xl: 4.25rem   /* 68px - Fortune numbers */
```

**Spacing System** (8-point grid):
```css
--space-1: 8px    --space-6: 48px
--space-2: 16px   --space-8: 64px
--space-3: 24px   --space-10: 80px
--space-4: 32px   --space-12: 96px
--space-5: 40px   --space-16: 128px
```

### Component Usage Patterns

**Glassmorphism Cards**:
```tsx
<div className="card-mystical">
  {/* Content with backdrop-blur and purple border */}
</div>
```

**Floating Buttons** (Mobile sticky):
```tsx
<div className="mobile-sticky-button">
  <div className="floating-button-bg">
    <Button>Action</Button>
  </div>
</div>
```

**Loading States**:
```tsx
{loading && (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <LoadingAnimation size="medium" className="mx-auto mb-4" />
      <p className="text-gray-300">กำลังโหลด...</p>
    </div>
  </div>
)}
```

### Animation Guidelines

**Hardware Acceleration Standards**:
- Always use `transform: translateZ(0)` for GPU acceleration
- Apply `backface-visibility: hidden` for 3D transforms
- Use `will-change: transform` for animated elements

**Lottie Animation Best Practices**:
- Size: 64x64px (medium) for main loading states
- Colors: Purple theme matching `[0.5294,0.2745,1,1]`
- Performance: Enable autoplay and loop for loading contexts
- Effects: Drop-shadow filters for mystical glow

**Particle System Performance**:
- Lazy load particle backgrounds with dynamic imports
- Use `contain: layout` for animation containers  
- Implement performance monitoring for frame rate

## Testing Strategy & Coverage

### Playwright Test Architecture (`tests/`)

**Test Organization by Feature**:
- `core-user-journey.spec.ts`: Complete user flow testing
- `loading-animations.spec.ts`: Lottie animation functionality
- `admin-functionality.spec.ts`: Admin dashboard operations
- `admin-theme-consistency.spec.ts`: Responsive design validation

**Testing Scripts**:
```bash
npm run test          # Full test suite
npm run test:core     # Core user flows only
npm run test:ui       # Interactive UI mode
npm run test:headed   # Visual browser testing
```

**Pre-Commit Workflow**:
1. ESLint code quality checks
2. TypeScript type validation
3. Core user journey tests
4. Prevents broken code deployment

### Test Coverage Areas

**User Flow Testing**:
- Email submission and validation
- 3-step questionnaire completion
- Fortune generation and display
- Existing user redirection
- Mobile-only enforcement
- Back navigation functionality

**Component Testing**:
- Lottie animations load and display
- Loading states during transitions
- Button interactions and form validation
- Responsive design across viewports
- Admin authentication and operations

**Performance Testing**:
- Animation loading times
- Network request monitoring
- Mobile viewport optimization
- Hardware acceleration verification

### Visual Regression & Accessibility

**Accessibility Standards**:
- Screen reader compatibility
- Proper form labeling
- Keyboard navigation support
- Thai language content structure

**Visual Consistency**:
- Cross-browser rendering (Chrome, Firefox, Safari)
- Mobile device compatibility (iPhone SE to iPhone Pro Max)
- Theme consistency across breakpoints
- Loading animation display validation

## Troubleshooting & Development Workflow

### Common Component Issues
- **Loading Animation Not Showing**: Verify Lottie file exists at `/assets/loading-star-animation.json`
- **Glassmorphism Not Rendering**: Check `backdrop-filter` browser support
- **Mobile Layout Issues**: Confirm viewport meta tag and 768px breakpoint

### Performance Debugging
- **Slow Animations**: Check for hardware acceleration CSS properties
- **Large Bundle Size**: Review dynamic imports for particle backgrounds
- **Memory Leaks**: Verify component cleanup in useEffect hooks

### Testing Workflow
- **Development**: `npm run test:core` for quick validation
- **Pre-Commit**: Automatic linting, type-check, and core tests
- **CI/CD**: Full test suite with visual regression checks
- **Debugging**: `npm run test:headed` for visual test debugging