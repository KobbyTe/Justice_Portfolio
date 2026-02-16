
# Website View Analytics for Admin Dashboard

## Overview
Add a comprehensive analytics tab to the Admin Dashboard that tracks page views, visitor behavior, blog engagement, and content performance -- all stored in Supabase and visualized with Recharts (already installed) using modern animated charts.

## How It Works

1. **A lightweight tracking script** runs on every page of the public website. Each time a visitor loads a page, it sends an event to a new `page_views` table in Supabase with the page path, referrer, device type, browser, and country (derived from locale).

2. **An "Analytics" tab** is added to the Admin Dashboard displaying interactive charts and summary cards.

## What You'll See on the Dashboard

- **Summary Cards** (animated counters): Total views today, this week, this month, unique visitors, and top page
- **Views Over Time** (area chart): Daily page views for the last 30 days with a smooth gradient fill
- **Top Pages** (horizontal bar chart): Most visited pages ranked by views
- **Device Breakdown** (pie/donut chart): Desktop vs. Mobile vs. Tablet split
- **Blog Performance** (bar chart): Views and likes per blog post
- **Referral Sources** (bar chart): Where visitors are coming from
- **Recent Activity** (live table): Last 20 page views with timestamp, page, device, and referrer

All charts use Recharts with smooth CSS transitions and animated number counters for the summary cards.

---

## Technical Plan

### Step 1 -- Database Migration
Create a `page_views` table:

```text
page_views
  id           uuid (PK, default gen_random_uuid())
  page_path    text NOT NULL
  referrer     text
  user_agent   text
  device_type  text  (desktop / mobile / tablet)
  browser      text
  country      text
  session_id   text  (random ID per browser session)
  created_at   timestamptz DEFAULT now()
```

RLS: public INSERT (anyone can log a view), public SELECT (admin reads).

Add an index on `created_at` and `page_path` for fast aggregation queries.

### Step 2 -- Tracking Hook (`src/hooks/usePageTracking.ts`)
- Generates a random `session_id` stored in `sessionStorage`
- Parses `navigator.userAgent` to detect device type and browser (lightweight regex, no external lib)
- On every route change (via `react-router-dom`'s `useLocation`), inserts a row into `page_views`
- Debounced to avoid duplicate rapid-fire inserts

### Step 3 -- Add Tracking to App Layout
- Import and call `usePageTracking()` inside the main App component so it runs on every page navigation

### Step 4 -- Analytics Dashboard Component (`src/components/admin/AnalyticsDashboard.tsx`)
- Fetches data from `page_views` with date range filters (today, 7 days, 30 days)
- Uses Recharts (already installed) for all charts:
  - `AreaChart` for views over time
  - `BarChart` for top pages and blog performance
  - `PieChart` for device breakdown
- Animated counter cards using CSS `@keyframes` for the count-up effect
- Responsive grid layout using Tailwind
- Date range selector to filter the dashboard

### Step 5 -- Add "Analytics" Tab to Admin Page
- Add a 12th tab trigger labeled "Analytics" to the existing `TabsList`
- Render `<AnalyticsDashboard />` inside the corresponding `TabsContent`

### Files Changed / Created
| File | Action |
|------|--------|
| `supabase/migrations/` (new migration) | Create `page_views` table + RLS + index |
| `src/hooks/usePageTracking.ts` | New -- tracking hook |
| `src/App.tsx` | Add `usePageTracking()` call |
| `src/components/admin/AnalyticsDashboard.tsx` | New -- full analytics dashboard |
| `src/pages/Admin.tsx` | Add Analytics tab |

No new dependencies needed -- Recharts and all UI components are already installed.
