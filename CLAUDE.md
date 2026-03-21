# Finsight - Claude Code Guidelines

## Project Overview
Personal finance tracking application (V1 MVP) built with Next.js 14, React, TypeScript, and Supabase.

**Status:** ✅ Phase 2 Complete - Ready for Deployment
**Location:** `/Users/mathans/Desktop/Mathan - Personal/Learning/finsight-tracker`
**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Supabase, Tailwind CSS, Recharts
**UI Documentation:** See `/docs/financetracker-v1.html` for complete design specifications
**Real-Time:** WebSocket subscriptions via Supabase for live data sync
**Test Data:** 3 complete user profiles with 68+ realistic financial records

---

## 🎯 V1 Features (MVP Only)

### Core Pages
- **Dashboard:** Net worth hero, KPI cards, trend charts, recent transactions
- **Transactions:** CRUD with filters, search, month tabs, CSV import/export
- **Assets:** 6 types (Stocks, MF, Gold, Crypto, Bank/FD, Cash), allocation breakdown
- **Liabilities:** Loan/debt tracking with progress
- **Goals:** Target tracking with progress bars
- **Profile:** User management, account settings
- **Authentication:** Google OAuth + Email/Password (Supabase Auth)

### Key Calculations
- Net worth = Total Assets - Total Liabilities
- Asset Allocation = Value per type / Total value (%)
- Monthly Spend = Sum of all expenses for month
- Monthly Income = Sum of all income for month
- Goal Progress = Current amount / Target amount (%)

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Tables
1. **users** - User profiles with base currency
2. **accounts** - Bank/Cash/Wallet accounts (4 types)
3. **categories** - Expense categories with emojis
4. **transactions** - Income/Expense records with FK to accounts & categories
5. **assets** - Investment holdings (6 types)
6. **liabilities** - Loans and debts (3 types)
7. **goals** - Savings goals with target dates

### Key Features
✅ **Foreign Keys**
- Transactions → Accounts (CASCADE)
- Transactions → Categories (SET NULL)
- All tables → Users (CASCADE)

✅ **Soft Deletes** (CRITICAL)
- `is_deleted BOOLEAN DEFAULT FALSE`
- `deleted_at TIMESTAMP WITH TIME ZONE`
- RLS policies auto-exclude deleted records
- Users can restore deleted data by setting `is_deleted = FALSE`
- Automatic triggers populate `deleted_at` when deleted
- Composite indexes on `(user_id, is_deleted)` for performance

✅ **Row-Level Security (RLS)**
- Users can only see their own data
- SELECT policies: `auth.uid() = user_id AND is_deleted = FALSE`
- UPDATE policies: Users can only update their own records
- Soft delete via UPDATE (not hard delete)

✅ **Automatic Timestamps**
- `created_at TIMESTAMP DEFAULT NOW()`
- `updated_at TIMESTAMP DEFAULT NOW()` (auto-updated on changes)
- `deleted_at TIMESTAMP` (auto-set on soft delete)

✅ **Data Validation**
- CHECK constraints on amounts (positive, non-negative)
- CHECK constraints on types (enum values)
- Email validation regex for users
- UNIQUE constraints on categories (per user)

### Recovery Workflow
```sql
-- Mark as deleted (soft delete)
UPDATE transactions SET is_deleted = TRUE WHERE id = 'xxx' AND user_id = auth.uid();

-- Restore
UPDATE transactions SET is_deleted = FALSE WHERE id = 'xxx' AND user_id = auth.uid();

-- View deleted records (audit)
SELECT * FROM transactions WHERE user_id = auth.uid() AND is_deleted = TRUE;
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - App Router, server/client components
- **React 18** - Hooks (useState, useMemo, useEffect, useContext)
- **TypeScript** - Strict mode for type safety
- **Tailwind CSS** - Dark theme with custom colors
- **Recharts** - Financial charts (LineChart, PieChart, BarChart)
- **shadcn/ui** - UI components (Button, Dialog, Input, Select, etc.)
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL database + Auth + Real-time subscriptions
- **Supabase Auth** - Email/password + Google OAuth
- **PostgreSQL** - RLS policies, triggers, soft deletes

### Development
- **TypeScript** - Strict mode
- **ESLint** - Code quality
- **Prettier** - Code formatting (if configured)
- **npm** - Package manager

---

## 🎨 Design System

### Color Palette (Dark Theme)

**Primary Backgrounds:**
- `--bg: #0e0f11` (Primary background - deepest black)
- `--bg2: #141519` (Secondary background)
- `--bg3: #1c1d22` (Tertiary background)
- `--bg4: #23242a` (Quaternary background)

**Text Colors:**
- `--text: #f0ede8` (Primary text - warm white)
- `--muted: #8a8890` (Secondary text)
- `--muted2: #5a5862` (Tertiary text)

**Accent & Status:**
- `--accent: #c8f060` (Lime Green - primary CTA)
- `--accent2: #a8d840` (Darker Lime - hover state)
- `--red: #ff6b6b` (Error/Negative)
- `--amber: #f5a623` (Warning)
- `--blue: #5b9cf6` (Info)
- `--teal: #4ecdc4` (Success)
- `--purple: #b794f4` (Category/Tag)

**Borders:**
- `--border: rgba(255,255,255,0.07)` (Primary border)
- `--border2: rgba(255,255,255,0.12)` (Secondary border)

### Typography

**Font Families:**
- **Display:** DM Serif Display (headings, hero text)
- **Body:** DM Sans (regular text, 14px base)
- **Mono:** JetBrains Mono (amounts, codes, data)

**Font Sizes:** Carefully tuned for readability
- Display: 22px, 28px, 42px
- Body: 12px, 13px, 14px, 15px
- Special: 8px-11px for labels and metadata

### Layout System

**Spacing:**
- **Sidebar:** 220px wide, 12px padding
- **TopBar:** 56px height
- **Content:** 28px padding
- **Grid Gap:** 16px

**Radius:**
- **Default:** 12px (cards, containers)
- **Small:** 8px (buttons, inputs)

### Components

**Cards:**
- Dark background (`bg2`/`bg3`)
- Subtle borders (1px)
- Rounded corners (12px)
- Shadow on hover

**Buttons:**
- Lime green accent (`#c8f060`)
- Smooth transitions (0.3s)
- Hover scale effect
- Disabled state support

**Forms:**
- Input: Dark bg, lime border on focus
- Labels: Muted color, 12px bold
- Validation: Red error text
- Feedback: Real-time validation

**Charts:**
- Dark backgrounds matching theme
- Lime green accent colors
- Responsive sizing
- Legend and tooltips

**Navigation:**
- Active state: Lime green underline
- Hover: Slight background change
- Icons: Lucide React 24px

### Tailwind Configuration

All custom colors available as Tailwind classes:
```tsx
// Colors
className="bg-bg text-text border-border"

// Spacing
className="p-sidebar-w h-nav-h"

// Rounded
className="rounded rounded-sm"

// Fonts
className="font-display font-body font-mono"
```

---

## 📁 Project Structure

```
finsight/
├── .claude/
│   └── settings.json          # Claude Code config
├── .env.local                 # Environment variables (user fills)
├── .gitignore
├── app/
│   ├── layout.tsx             # Root layout with sidebar
│   ├── page.tsx               # Dashboard
│   ├── transactions/
│   │   └── page.tsx
│   ├── assets/
│   │   └── page.tsx
│   ├── liabilities/
│   │   └── page.tsx
│   ├── goals/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── auth/
│       ├── login/page.tsx
│       └── signup/page.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── modals/
│   │   ├── TransactionModal.tsx
│   │   ├── AssetModal.tsx
│   │   ├── LiabilityModal.tsx
│   │   ├── GoalModal.tsx
│   │   ├── CSVImportModal.tsx
│   │   └── UpdateGoalModal.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── DonutChart.tsx
│   │   └── BarChart.tsx
│   ├── Skeleton.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── supabaseErrors.ts      # Error handling
│   ├── calculations.ts        # Financial calculations
│   ├── chartUtils.ts          # Chart helpers
│   ├── utils.ts               # General utilities
│   ├── csvExport.ts           # CSV export logic
│   ├── csvImport.ts           # CSV import logic
│   ├── mockData.ts            # Mock data (development)
│   └── services/
│       ├── transactionService.ts
│       ├── assetService.ts
│       ├── liabilityService.ts
│       ├── goalService.ts
│       ├── accountService.ts
│       ├── categoryService.ts
│       └── authService.ts
├── hooks/
│   ├── useAuth.ts             # Auth context hook
│   └── useSupabaseData.ts     # Real-time data hooks
├── types/
│   └── index.ts               # TypeScript interfaces
├── scripts/
│   └── initializeSupabase.sql # Database schema
├── public/
│   └── templates/
│       ├── transactions_template.csv
│       ├── assets_template.csv
│       └── liabilities_template.csv
├── SCHEMA_IMPROVEMENTS.md     # Schema change documentation
└── package.json
```

---

## 🔑 Environment Variables

**Create `.env.local` file in project root:**

```bash
# ═══════════════════════════════════════════════════════════════════════════
# SUPABASE CONFIGURATION (Required)
# ═══════════════════════════════════════════════════════════════════════════

# Your Supabase project URL (get from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase public/anon key (get from Supabase Dashboard > Settings > API)
# Available as either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: If using NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY instead
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key-here

# ═══════════════════════════════════════════════════════════════════════════
# APPLICATION CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Application URL (used for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Node environment
NODE_ENV=development
```

### How to Get Your Credentials

1. **Create Supabase Account:** https://supabase.com
2. **Create New Project**
3. **Go to Project Settings:**
   - Click your avatar → Project Settings
   - Navigate to "API" tab
4. **Copy Required Keys:**
   - `Project URL` → Paste into `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` (public) key → Paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **OAuth Redirect URL:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URL: `http://localhost:3001/auth/callback`

### Important Notes
- ✅ These are **public** keys (safe to expose in frontend code via `NEXT_PUBLIC_` prefix)
- ✅ Never share the **service role** key (keep in `.env` only)
- ✅ Add `.env.local` to `.gitignore` (already configured)
- ✅ Always prefix public vars with `NEXT_PUBLIC_`

---

## 🎯 Page Implementations

### Dashboard (`app/page.tsx`)
- **Hero Card:** Net worth display with trend
- **KPI Cards:** Monthly spend, income, assets, liabilities
- **Net Worth Chart:** Line chart showing 12-month trend
- **Expense Breakdown:** Pie chart by category
- **Recent Transactions:** Last 5 transactions with filters
- **Asset Allocation:** Donut chart by asset type
- **Real-time Updates:** Live data via WebSocket

**Calculations:**
- Net Worth = Total Assets - Total Liabilities
- Monthly Spend = Sum of expenses (current month)
- Monthly Income = Sum of income (current month)
- Trend = Last 12 months net worth

### Transactions (`app/transactions/page.tsx`)
- **List View:** Table with date, description, amount, category
- **Filters:** Month, account, category, type (income/expense)
- **Search:** Real-time search by description
- **CRUD Modal:** Add/edit/delete transactions
- **CSV Import:** Template-based bulk import
- **CSV Export:** Download all transactions
- **Pagination:** 10 items per page

### Assets (`app/assets/page.tsx`)
- **Asset Types:** Stocks, MF, Gold, Crypto, Bank FD, Cash
- **Grouped View:** Assets grouped by type
- **Allocation Chart:** Percentage by type
- **Add/Edit Modal:** Type-specific fields
- **Value Trends:** Historical value tracking

### Liabilities (`app/liabilities/page.tsx`)
- **Liability Types:** Personal Loan, Credit Card, Informal Loan
- **List:** Name, type, total, outstanding, progress
- **Progress Bars:** Visual outstanding/total ratio
- **Add/Edit Modal:** Type and amount fields
- **Payoff Timeline:** Estimated payoff calculations

### Goals (`app/goals/page.tsx`)
- **Goal List:** Target name, amount, deadline, progress
- **Progress Bars:** Current/target percentage
- **Status:** On track, at risk, achieved
- **Add/Edit Modal:** Target amount and date
- **Target Date:** Month/year picker

### Profile (`app/profile/page.tsx`)
- **User Info:** Name, email, base currency
- **Settings:** Account preferences
- **Logout:** Session termination
- **Data Display:** User profile info

### Authentication Pages
- **Login:** Email/password + Google OAuth
- **Signup:** Email, password, name fields
- **Reset Password:** Email-based recovery
- **Callback:** OAuth redirect handler

---

## 📝 Code Guidelines

### TypeScript
- Use **strict mode** (enabled in tsconfig.json)
- Define interfaces for all data types in `types/index.ts`
- Use **type** over **interface** for union types
- Avoid `any` - use `unknown` if necessary

### React Components
- Use **functional components** with hooks
- Memoize expensive calculations: `useMemo`, `useCallback`
- Extract reusable logic to custom hooks in `hooks/`
- Keep components small and focused

### Styling
- Use **Tailwind CSS** classes (dark theme)
- Custom colors defined in `tailwind.config.ts`
- Use `cn()` utility for conditional classes
- Dark theme: Use `bg-bg`, `text-text`, `border-border` tokens

### Database Queries
- Use **Supabase client library** for queries
- Apply **RLS policies** (no server-side auth logic needed)
- Use **real-time subscriptions** for live updates
- Soft delete pattern: `UPDATE table SET is_deleted = TRUE`

### Error Handling
- Wrap async operations in try-catch
- Log errors to console (development only)
- Show user-friendly error messages in UI
- Use error utility from `lib/supabaseErrors.ts`

### File Naming
- Components: `PascalCase.tsx`
- Utilities/Services: `camelCase.ts`
- Types: `index.ts` (centralized)
- Folders: `kebab-case`

---

## 🔐 Authentication System

### Implementation Details

**Auth Flow:**
1. **Email/Password:** Native Supabase Auth
2. **Google OAuth:** Via Supabase with PKCE
3. **Session Management:** Auto-persisted in localStorage
4. **Token Refresh:** Automatic via Supabase

**Key Files:**
- `lib/auth/authService.ts` - Auth functions
- `lib/auth/session.ts` - Session management
- `hooks/useAuth.ts` - Auth context hook
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Sign up page
- `app/auth/callback/page.tsx` - OAuth callback

**Usage in Components:**
```tsx
const { user, isLoading, login, logout } = useAuth()

// In components:
if (isLoading) return <LoadingSpinner />
if (!user) return <RedirectToLogin />

// Perform actions
await login(email, password)
```

### Test Users (After Schema Deployment)
```
john.investor@gmail.com / password123 (Complex profile)
priya.finance@outlook.com / password123 (Balanced profile)
amit.saver@yahoo.com / password123 (Conservative profile)
```

---

## 📊 Data Flow Architecture

### Real-Time Data Loading

**Data Hooks** (in `hooks/useData.ts`):
- `useTransactions()` - Real-time transaction subscriptions
- `useAssets()` - Real-time asset subscriptions
- `useLiabilities()` - Real-time liability subscriptions
- `useGoals()` - Real-time goal subscriptions
- `useAccounts()` - Real-time account subscriptions
- `useCategories()` - Real-time category subscriptions

**Calculation Pipeline:**
1. Fetch raw data via hooks
2. Calculate derived values (net worth, allocations, trends)
3. Format for display (currency, percentages)
4. Memoize expensive computations

**Example:**
```tsx
const transactions = useTransactions()
const monthlySpend = useMemo(
  () => calculateMonthlySpend(transactions),
  [transactions]
)
```

### Service Layer

All database operations in `lib/services/`:
- `transactionService.ts` - CRUD for transactions
- `assetService.ts` - CRUD for assets
- `liabilityService.ts` - CRUD for liabilities
- `goalService.ts` - CRUD for goals
- `accountService.ts` - CRUD for accounts
- `categoryService.ts` - CRUD for categories

Each service handles:
- RLS-enforced queries
- Data validation
- Error handling
- Real-time subscriptions

---

## 🚀 Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Create .env.local with Supabase credentials
cp .env.example .env.local

# Start dev server (runs on port 3001)
npm run dev

# Visit application
open http://localhost:3001
```

### Testing
```bash
# Build for production
npm run build

# Run TypeScript check
npm run type-check
```

### Database Setup
1. Create Supabase account: https://supabase.com
2. Create new project
3. Deploy schema: `scripts/initializeSupabase.sql`
4. Seed test data: `scripts/seedTestData.sql`
3. Run `/scripts/initializeSupabase.sql` in Supabase SQL editor
4. Configure `.env.local` with Supabase credentials
5. Test by logging in

### Deployment
- **Hosting:** Vercel
- **Database:** Supabase
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage

---

## 🔍 Key Features & Implementation Details

### 1. Real-time Data Sync
- Use `useSupabaseData()` hook for subscriptions
- Automatic refresh when data changes
- Loading states while fetching

### 2. Soft Deletes
- Users can recover deleted data
- No hard delete in production
- Audit trail with `deleted_at` timestamps
- Transparent via RLS policies

### 3. Chart Periods
- **3m:** Shows all data points with full year format ("Mar 2026")
- **6m:** Shows all data points with full year format ("Mar 2026")
- **1y:** Shows only 4 key points with 2-digit year format ("Mar 26")
- Labels rotated at -45° for 1Y view

### 4. CSV Import/Export
- Export: Query data → Convert to CSV → Trigger download
- Import: Parse CSV → Validate → Batch insert to Supabase
- Templates available in `public/templates/`

### 5. Asset Allocation
- Safe calculation: `allocation.percentage ?? 0` (never NaN)
- Cached via `useMemo` for performance
- Grouped by asset type
- Progress bars with color coding

---

## ⚠️ Important Notes

### Do NOT
- ❌ Hard delete records (always use soft delete)
- ❌ Bypass RLS policies in code
- ❌ Store sensitive data in `.env.local`
- ❌ Modify schema without backup
- ❌ Use `any` type in TypeScript

### Always
- ✅ Use transactions for multi-step operations
- ✅ Validate user input before sending to DB
- ✅ Handle loading and error states
- ✅ Test soft delete workflows
- ✅ Log important operations for debugging

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `scripts/initializeSupabase.sql` | Database schema with RLS & soft deletes |
| `lib/supabase.ts` | Supabase client initialization |
| `lib/services/*.ts` | CRUD operations for each entity |
| `hooks/useSupabaseData.ts` | Real-time data subscriptions |
| `lib/calculations.ts` | Financial calculations (net worth, etc.) |
| `components/charts/LineChart.tsx` | Net worth trend visualization |
| `types/index.ts` | All TypeScript interfaces |
| `tailwind.config.ts` | Design tokens and colors |

---

## 🧪 Verification & Testing

### Verify Setup
```bash
# 1. Check dependencies installed
npm list

# 2. Verify environment file
cat .env.local  # Should show your Supabase URL

# 3. Run TypeScript check
npm run type-check

# 4. Build check
npm run build

# 5. Start development server
npm run dev
```

### Test Authentication
1. Visit http://localhost:3001
2. Click "Sign Up"
3. Enter email, password, name
4. Receive confirmation email (if configured)
5. Log in with credentials
6. Should see dashboard

### Test Data Access
- After logging in, should see dashboard data
- Check browser DevTools → Network for Supabase requests
- Check console for any errors

---

## 🆘 Troubleshooting

### Issue: "User not authenticated"
**Solution:**
- Check `.env.local` has correct Supabase credentials
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is 40+ characters
- Check Supabase project is active (Settings → General)
- Clear browser cache and localStorage

### Issue: "Cannot connect to Supabase"
**Solution:**
- Verify internet connection
- Check URL format: `https://your-project.supabase.co`
- Verify project exists in Supabase dashboard
- Check firewall/VPN isn't blocking API calls

### Issue: "Database tables not found"
**Solution:**
- Run `scripts/initializeSupabase.sql` in Supabase SQL Editor
- Verify database schema was created (Tables tab should show 7 tables)
- Check for SQL errors in Supabase dashboard

### Issue: "Soft deleted records showing"
**Solution:**
- Verify RLS policies include `AND is_deleted = FALSE`
- Check policy was applied to all tables
- Restart development server

### Issue: "OAuth redirect failed"
**Solution:**
- Add redirect URL in Supabase: Authentication → URL Configuration
- Add both: `http://localhost:3001/auth/callback`
- For production, add your domain URLs
- Verify OAuth provider credentials (Google) if using

### Issue: Chart/Data not loading
**Solution:**
- Open DevTools → Network tab
- Check Supabase API requests for errors
- Verify user has data in database
- Check RLS policies allow user access
- Seed test data: Run `scripts/seedTestData.sql`

---

## 📞 Quick Reference

**Git Workflow:**
```bash
git status
git add .
git commit -m "description"
git push
```

**Common Commands:**
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # Check TypeScript
```

**Database:**
- Supabase Dashboard: https://app.supabase.com
- SQL Editor for custom queries
- RLS Policies management
- Real-time monitoring

---

## 🎓 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

---

## ✅ Last Updated
- **Schema:** ✅ Complete with soft deletes, foreign keys, RLS
- **UI:** ✅ All pages working with mock data
- **Bug Fixes:** ✅ 1Y chart, year display, NaN% allocation fixed
- **Documentation:** ✅ SCHEMA_IMPROVEMENTS.md created

**Next Phase:** Implement backend services with Supabase credentials
