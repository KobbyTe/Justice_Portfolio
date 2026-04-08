

## Plan: Recommendation Request Links

### Overview
The admin will be able to generate unique recommendation links from the Testimonials tab. These links can be shared with recommenders, who visit a public form to submit their testimonial. Submissions are saved as inactive (pending approval), and the admin can approve/reject them from the dashboard.

### Architecture

```text
Admin Dashboard                    Public Form
┌─────────────────┐     share     ┌──────────────────────┐
│ Generate Link   │──── URL ────→ │ /recommend/:token    │
│ (name + email)  │               │ Fill name, position, │
│                 │               │ company, message,    │
│ Approve/Reject  │←── insert ───│ linkedin, twitter,   │
│ pending items   │   (inactive)  │ photo                │
└─────────────────┘               └──────────────────────┘
```

### Steps

**1. Database Migration**
- Create `recommendation_tokens` table: `id`, `token` (unique text), `recommender_name`, `recommender_email`, `is_used` (default false), `expires_at`, `created_at`
- RLS: admin-only SELECT/INSERT/UPDATE/DELETE; public SELECT for token lookup; public UPDATE to mark as used
- No changes to existing `recommendations` table (already has `is_active` column which we'll use for approval flow)

**2. New Public Page: `/recommend/:token`** (`src/pages/SubmitRecommendation.tsx`)
- Validates the token against `recommendation_tokens` (not expired, not used)
- Shows a form with: name (pre-filled from token), position, company, message (required), LinkedIn URL, Twitter URL, profile photo upload
- On submit: inserts into `recommendations` with `is_active: false`, marks token as used
- Shows success/error/expired states
- Rate limited using existing `useRateLimit` hook

**3. Add Route** in `src/App.tsx`
- Add `/recommend/:token` route with lazy-loaded `SubmitRecommendation` page

**4. Update Admin Testimonials Tab** in `src/pages/Admin.tsx`
- Change recommendations query to fetch ALL (remove `.eq('is_active', true)`) so pending ones appear
- Add "Generate Link" section: input for recommender name + email, generates a token, shows copyable URL
- Add approve/reject buttons on pending recommendations (toggle `is_active`)
- Visual distinction between approved and pending items with badges

### Technical Details
- Tokens are generated as `crypto.randomUUID()` on the client, inserted via admin's authenticated session
- Token expiry defaults to 7 days
- The public form uses `maxLength` constraints and rate limiting consistent with existing security patterns
- Photo uploads use the existing public storage bucket (`portfolio-assets`) — the public INSERT on recommendations already allows unauthenticated inserts, but we need to add a public INSERT policy for `recommendation_tokens` usage (mark as used) via an RPC or allow public UPDATE on `is_used` column only

