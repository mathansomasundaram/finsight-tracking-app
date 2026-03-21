# Finsight — Personal Finance Tracker V1 MVP

**A secure, real-time personal finance tracking application with authentication, multi-user support, and comprehensive financial management.**

**Status**: ✅ Phase 2 Complete - Ready for Deployment
**Database**: Supabase PostgreSQL with Row-Level Security
**Auth**: Email/Password + Google OAuth
**Real-Time**: WebSocket subscriptions for live data sync
**Test Data**: 3 users with 68 realistic financial records

## Project Structure

```
finsight/
├── app/
│   ├── layout.tsx           # Root layout with Sidebar + TopBar
│   ├── globals.css          # Global Tailwind styles
│   ├── page.tsx             # Dashboard page
│   ├── transactions/        # Transactions page
│   ├── assets/              # Assets page
│   ├── liabilities/         # Liabilities page
│   ├── goals/               # Goals page
│   ├── profile/             # Profile page
│   └── auth/                # Authentication pages
│       ├── login/
│       └── signup/
├── components/
│   └── layout/
│       ├── Sidebar.tsx      # Navigation sidebar
│       └── TopBar.tsx       # Top navigation bar
├── tailwind.config.ts       # Tailwind configuration with design tokens
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── postcss.config.js        # PostCSS configuration
├── DESIGN_SYSTEM.md         # Design system documentation
└── README.md                # This file
```

## Design System

### Color Scheme (Dark Theme)

**Backgrounds:**
- `--bg`: `#0e0f11` (Primary, darkest)
- `--bg2`: `#141519` (Secondary)
- `--bg3`: `#1c1d22` (Tertiary)
- `--bg4`: `#23242a` (Quaternary)

**Text:**
- `--text`: `#f0ede8` (Primary)
- `--muted`: `#8a8890` (Secondary)
- `--muted2`: `#5a5862` (Tertiary)

**Accents:**
- `--accent`: `#c8f060` (Lime Green - Primary CTA)
- `--accent2`: `#a8d840` (Darker Lime)

**Status Colors:**
- `--red`: `#ff6b6b` (Error/Negative)
- `--amber`: `#f5a623` (Warning)
- `--blue`: `#5b9cf6` (Info)
- `--teal`: `#4ecdc4` (Success)
- `--purple`: `#b794f4` (Category)

### Typography

**Font Families:**
- **Display**: DM Serif Display (headings)
- **Body**: DM Sans (primary text)
- **Mono**: JetBrains Mono (amounts, code)

### Layout Dimensions

- **Sidebar**: 220px wide
- **TopBar**: 56px height
- **Border Radius**: 12px (default), 8px (small)
- **Content Padding**: 28px
- **Grid Gap**: 16px

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier ok)
- Git

### Step 1: Setup (2 minutes)
```bash
# Clone & install
git clone <repository>
cd finsight
npm install
```

### Step 2: Deploy Database (5 minutes)
Follow: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

Quick summary:
- Go to Supabase Dashboard
- SQL Editor → New Query
- Copy `scripts/initializeSupabase.sql` → Run
- Then: Copy `scripts/seedTestData.sql` → Run

### Step 3: Configure Auth (3 minutes)
- Supabase → Authentication → Providers
- Enable Email (toggle ON)
- Enable Google OAuth (add credentials)
- Set redirect URL: `http://localhost:3001/auth/callback`

### Step 4: Run Locally (1 minute)
```bash
npm run dev
# Visit: http://localhost:3001
```

### Test Users (After Step 2)
- john.investor@gmail.com (Complex profile)
- priya.finance@outlook.com (Balanced profile)
- amit.saver@yahoo.com (Conservative profile)

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Component Structure

### Sidebar (`components/layout/Sidebar.tsx`)

The main navigation component featuring:
- Logo with accent color styling
- Navigation sections (Overview, Money, Planning, Account)
- Active state styling
- User profile pill at bottom

### TopBar (`components/layout/TopBar.tsx`)

The top navigation bar featuring:
- Dynamic page title
- 56px height
- Action button placeholder area
- Dark theme with border

## 🎯 Features

### Authentication ✅
- Email/Password signup and login
- Google OAuth 2.0 with PKCE
- Automatic profile creation
- Session persistence
- Password reset via email

### Financial Features ✅
- **Dashboard** - Net worth, KPIs, trend charts
- **Transactions** - CRUD operations, filters, search, CSV import/export
- **Assets** - 6 types (Stocks, MF, Gold, Crypto, Bank FD, Cash)
- **Liabilities** - Track loans, credit cards, debts
- **Goals** - Financial targets with progress tracking
- **Profile** - User management and account settings

### Security & Performance ✅
- Row-Level Security (RLS) enforces user isolation
- Soft deletes allow data recovery
- Real-time data sync with WebSockets
- Automatic token refresh
- < 3 second page load times
- Responsive design (mobile/tablet/desktop)

## Tailwind Configuration

Custom design tokens are configured in `tailwind.config.ts`:

```typescript
colors: {
  bg: '#0e0f11',
  bg2: '#141519',
  bg3: '#1c1d22',
  bg4: '#23242a',
  text: '#f0ede8',
  muted: '#8a8890',
  // ... all color tokens
}
```

## CSS Variables

All colors are available as CSS variables in the root element for dynamic theming:

```css
html {
  --bg: #0e0f11;
  --accent: #c8f060;
  /* ... */
}
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 📋 Step-by-step setup (15 min) |
| [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) | ✅ What was delivered |
| [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md) | 🔐 Auth system details |
| [REAL_USER_DATA_IMPLEMENTATION.md](./REAL_USER_DATA_IMPLEMENTATION.md) | 📊 Database & test data |
| [CLAUDE.md](./CLAUDE.md) | 🏗️ Architecture guide |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | ⚡ Quick lookup |

**Start with**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) → Then [QUICK_START.md](./QUICK_START.md)

## 📊 Database Architecture

### 7 Tables
- **users** - User profiles & settings
- **accounts** - Bank/credit card accounts
- **categories** - Income/expense categories
- **transactions** - Income and expense records
- **assets** - Investment holdings
- **liabilities** - Loans and debts
- **goals** - Financial targets

### Security
- 30 Row-Level Security policies
- 18 performance indexes
- 14 automated triggers
- Soft delete system with recovery

### Test Data
- 3 complete user profiles
- 9 bank accounts
- 14 expense/income categories
- 27 transactions
- 12 assets (all 6 types)
- 5 liabilities
- 7 financial goals

## 🔐 Security

- ✅ Row-Level Security (RLS) - Users only see their own data
- ✅ Password hashing - Supabase handles safely
- ✅ OAuth 2.0 with PKCE - Google login
- ✅ JWT tokens - Persistent sessions
- ✅ Soft deletes - Data recovery capability
- ✅ HTTPS only - In production

## 🧪 Verification

Run the verification script:
```bash
node verify-supabase.js
```

This checks:
- Supabase credentials
- Database connection
- Table existence
- RLS enforcement

## 🚀 Deployment Checklist

- [ ] Deploy database schema
- [ ] Seed test data
- [ ] Configure authentication
- [ ] Test locally
- [ ] Verify data isolation
- [ ] Test all workflows
- [ ] Deploy to production

## License

Proprietary - Finsight Finance Tracker V1
