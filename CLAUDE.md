# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run development migrations
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma Studio

### Testing Database Connection
- `npx prisma db seed` - Seed database (if configured)

## Architecture Overview

This is a **Next.js 15 IPO tracking application** that aggregates and analyzes IPO data from US and Hong Kong markets.

### Core Architecture
- **Framework**: Next.js 15 with App Router, Turbopack, and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **External APIs**: Finnhub (US market) and HKEX FINI (Hong Kong market)
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Lucide React icons, Recharts for data visualization

### Data Flow
1. **External APIs** (Finnhub, HKEX) → **Data Sync Services** → **PostgreSQL Database**
2. **Next.js API Routes** → **Prisma Client** → **Database**
3. **React Components** → **API Routes** → **Database Operations**

### Key Services
- **Data Synchronization**: Automated IPO data fetching and deduplication (`src/lib/data-sync.ts`)
- **External API Integration**: Rate-limited API clients (`src/lib/external-apis.ts`)
- **AI Analysis**: Claude AI and Perplexity AI integration for market analysis

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── stocks/        # CRUD operations for IPO stocks
│   │   ├── sync/          # Data synchronization endpoints
│   │   ├── analytics/     # Data analysis endpoints
│   │   └── analysis/      # AI-powered market analysis
│   ├── analytics/         # Analytics dashboard page
│   ├── sync/             # Data sync management page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── StockList.tsx     # IPO stock display
│   ├── AddStockForm.tsx  # Manual stock entry
│   ├── DataSyncManager.tsx # Sync controls
│   └── Navigation.tsx    # App navigation
├── lib/                  # Utility libraries
│   ├── db.ts            # Prisma client instance
│   ├── data-sync.ts     # Sync orchestration
│   ├── external-apis.ts # API integrations
│   ├── claude-ai.ts     # Claude AI client
│   └── perplexity-ai.ts # Perplexity AI client
└── types/
    └── ipo.ts           # TypeScript type definitions
```

## Database Schema

The core entity is `IpoStock` with these key fields:
- **Identity**: `id`, `symbol`, `companyName`, `market` (US/HK)
- **Pricing**: `expectedPrice`, `priceRange`, `sharesOffered`
- **Status**: `status` (UPCOMING/PRICING/LISTED/WITHDRAWN/POSTPONED)
- **Details**: `sector`, `industry`, `underwriters`, `marketCap`
- **Metadata**: `createdAt`, `updatedAt`

## API Integration

### Finnhub API (US Market)
- **Rate Limit**: 60 calls/minute (free tier)
- **Data**: IPO calendar, pricing, shares offered
- **Authentication**: API key in `FINNHUB_API_KEY`

### HKEX FINI API (Hong Kong Market)
- **Authentication**: OAuth2 with client credentials
- **Data**: Digital settlement platform data
- **Config**: `HKEX_FINI_CLIENT_ID`, `HKEX_FINI_CLIENT_SECRET`

### Data Synchronization Features
- **Smart Deduplication**: Prevents duplicates based on symbol+market
- **Incremental Updates**: Only updates changed records
- **Rate Limiting**: Built-in API call throttling
- **Error Recovery**: Robust error handling with detailed logging

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."

# Finnhub API
FINNHUB_API_KEY="your-finnhub-api-key"
FINNHUB_BASE_URL="https://finnhub.io/api/v1"

# HKEX FINI API
HKEX_FINI_CLIENT_ID="your-hkex-client-id"
HKEX_FINI_CLIENT_SECRET="your-hkex-client-secret"
HKEX_FINI_BASE_URL="https://api.hkex.com.hk/fini"

# AI Services (Optional)
ANTHROPIC_API_KEY="your-claude-api-key"
PERPLEXITY_API_KEY="your-perplexity-api-key"

# Scheduled Tasks
CRON_SECRET_TOKEN="your-secret-cron-token"
```

## Key API Endpoints

### Stock Management
- `GET/POST /api/stocks` - List/create IPO stocks
- `GET/PUT/DELETE /api/stocks/[id]` - Individual stock operations

### Data Synchronization
- `GET/POST /api/sync` - Sync status/trigger full sync
- `POST /api/sync/finnhub` - Sync US market only
- `POST /api/sync/hkex` - Sync Hong Kong market only
- `POST /api/sync/scheduled` - Automated sync endpoint

### Analytics
- `GET /api/analytics` - Market analytics dashboard data
- `POST /api/analysis/market` - AI market analysis
- `POST /api/analysis/stock` - Individual stock analysis

## Development Guidelines

### Code Patterns
- Use **App Router** conventions for routing and layouts
- **Server Components** by default, `'use client'` only when needed
- **TypeScript strict mode** - all types defined in `src/types/ipo.ts`
- **Prisma Client** accessed via `src/lib/db.ts` singleton

### Component Structure
- Components use **Tailwind CSS v4** for styling
- **Lucide React** for consistent iconography
- **Recharts** for data visualizations
- State management with React hooks (no external state library)

### API Route Patterns
- Use **Next.js 15 Route Handlers** (not Pages API)
- Error handling with try/catch and proper HTTP status codes
- Input validation for all external data
- Rate limiting for external API calls

### Database Operations
- Always use **Prisma Client** for database operations
- Use **transactions** for multi-table operations
- Handle **unique constraints** with upsert patterns
- Include **error logging** for failed operations

## AI Integration

The application includes AI-powered market analysis:
- **Claude AI**: Deep market analysis and insights
- **Perplexity AI**: Real-time market research and news
- Both services are optional and gracefully degrade if unavailable

## Testing

Currently no test framework is configured. To add testing:
1. Install testing framework (Jest, Vitest, or Playwright)
2. Add test scripts to package.json
3. Create test configuration files
4. Update CLAUDE.md with test commands

## Deployment Notes

- **Next.js 15** with Turbopack requires Node.js 18+
- **PostgreSQL** database required (not SQLite compatible)
- **Environment variables** must be configured before deployment
- **Prisma migrations** must be run on deployment
- **Scheduled tasks** require external cron or platform scheduling