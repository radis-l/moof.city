# Fortune Tell Website (ดูดวงฟรีลับ MOOF)

A personalized Thai fortune telling website that provides users with lucky numbers and predictions based on their age, birth day, and blood group.

## Features

- ✨ **Free personalized fortune telling** - Authentic Thai fortune telling experience
- 🔢 **Lucky number generation** - Single 2-digit lucky number (10-99)
- 💝 **Relationship predictions** - Romantic fortune and love guidance
- 💼 **Work/career insights** - Professional success predictions
- 🏥 **Health guidance** - Health and wellness advice
- 📊 **Admin dashboard** - View and manage fortune data
- 💾 **Local JSON storage** - No external API dependencies
- 📱 **Mobile-friendly design** - Responsive Thai UI
- 🌙 **Dark gradient theme** - Beautiful purple-dark aesthetic
- 📄 **CSV export** - Easy data export for analysis

## Tech Stack

- **Framework**: Next.js 15.5.0 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **Validation**: Zod 4.1.1
- **Data Storage**: Local JSON file storage
- **Fonts**: Kanit (Thai), MuseoModerno (Logo)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd booking-platform
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Your Browser**
   - Main app: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Data Storage

The app uses local JSON file storage at `/data/fortune-data.json`:

- **No external APIs required** - Works offline
- **Automatic data persistence** - Saves all fortune sessions
- **CSV export available** - Easy data analysis
- **Privacy-first** - Data stays on your server

## Fortune Algorithm

The app generates personalized fortunes using:
- **Age Range**: `<18`, `18-25`, `26-35`, `36-45`, `46-55`, `55+`
- **Birth Day**: Monday through Sunday
- **Blood Group**: A, B, AB, O
- **Authentic Thai Content**: 100-120 character messages with conversational tone

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (email collection)
│   ├── fortune/
│   │   ├── page.tsx          # Multi-step form
│   │   └── result/page.tsx   # Fortune results display
│   ├── admin/page.tsx        # Admin dashboard
│   └── api/storage/          # Storage API endpoints
├── components/ui/            # Reusable UI components
├── lib/
│   ├── fortune-generator.ts  # Core fortune logic
│   ├── storage/             # File storage utilities
│   └── validation.ts        # Zod schemas
└── types/index.ts           # TypeScript types

data/
└── fortune-data.json        # User fortune data
```

## Admin Dashboard Features

- **Data Overview**: View all fortune sessions
- **User Statistics**: Unique emails, age group breakdown
- **Export Function**: Download data as CSV
- **Delete Records**: Remove individual entries
- **Real-time Updates**: Refresh data instantly

## Development Notes

- **TypeScript**: Fully typed with strict mode
- **ESLint**: Zero linting errors or warnings
- **Build**: Optimized for production deployment
- **Suspense**: Proper handling of Next.js 15 requirements
- **Thai Fonts**: Uses Google Fonts for authentic appearance

## Deployment

The app is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service. The local file storage will work in production environments.

For scaling to multiple servers, consider migrating to a database solution while keeping the same data structure.