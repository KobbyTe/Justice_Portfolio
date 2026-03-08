

# Security Audit & Improvement Plan

## Critical Findings

### 1. CRITICAL: 11 Tables Have No Write Protection (Severity: HIGH)

The following tables use `ALL` policies with `USING (true)` and `WITH CHECK (true)`, meaning **anyone on the internet can insert, update, and delete all your portfolio data** without authentication:

- `about_content`, `blog_posts`, `gallery`, `hero_images`, `impact_metrics`, `projects`, `recommendations`, `resume_files`, `social_links`, `tech_stack`, `wall_messages`

**Fix**: Replace each `ALL` public policy with:
- A `SELECT` public policy (read-only for visitors)
- An `ALL` admin-only policy using `has_role(auth.uid(), 'admin')`

Exception: `wall_messages` needs public INSERT (for the wall feature) but should restrict UPDATE/DELETE to admin.

### 2. CRITICAL: Sensitive Data Exposed Publicly (Severity: HIGH)

- **Bookings table**: Names, emails, phone numbers of everyone who booked are readable by anyone via the anon key
- **Blog comments**: Commenter email addresses are returned in SELECT queries to unauthenticated users
- **Blog likes**: IP addresses of all visitors who liked posts are publicly readable
- **Page views**: Session IDs and referrer URLs (containing auth tokens) are publicly readable

**Fix**:
- Bookings: Replace public SELECT with admin-only SELECT
- Blog comments: Create a database view that excludes email, or restrict email column access
- Blog likes: Restrict SELECT to admin; use `get_blog_post_with_stats` function for public counts (already exists)
- Page views: Restrict SELECT to admin only

### 3. WARN: Blog Likes Cannot Be Deleted (Severity: MEDIUM)

The `blog_likes` table has no DELETE policy, but `LikeButton.tsx` tries to delete likes for unliking. This means the unlike feature silently fails.

**Fix**: Add a DELETE policy that allows deleting by matching IP address, or switch to an admin-only delete.

### 4. WARN: No Rate Limiting on Public Forms (Severity: MEDIUM)

Wall messages, blog comments, and booking forms have no rate limiting. A bot could spam thousands of entries.

**Fix**: Add client-side throttling and consider an edge function with rate limiting for submissions.

### 5. WARN: Wall Messages Have No Content Moderation (Severity: MEDIUM)

Anyone can post anything to the wall with no approval workflow (unlike blog comments which have `is_approved`).

**Fix**: Add an `is_approved` column and approval flow, or add basic profanity filtering.

### 6. WARN: Auth & Infrastructure Issues

- **OTP expiry too long**: Reduce to recommended threshold
- **Leaked password protection disabled**: Enable in Supabase dashboard
- **Postgres version outdated**: Upgrade to apply security patches

### 7. Minor: LikeButton Calls External IP Service

`LikeButton.tsx` calls `https://api.ipify.org` on every render and every like/unlike. This is slow, can fail, and leaks user behavior to a third party. Consider using a session-based identifier instead.

---

## Implementation Plan

### Migration 1: Lock Down RLS Policies

A single SQL migration that:
1. Drops all permissive `ALL` public policies on the 11 tables
2. Adds `SELECT`-only public policies for publicly viewable tables
3. Adds `ALL` admin-only policies using `has_role(auth.uid(), 'admin')`
4. Special-cases `wall_messages` (public INSERT + SELECT, admin-only UPDATE/DELETE)
5. Replaces `bookings` public SELECT with admin-only SELECT
6. Replaces `page_views` public SELECT with admin-only SELECT
7. Adds DELETE policy for `blog_likes` matching IP
8. Creates a view or adjusts blog_comments to exclude email from public reads

### Migration 2: Wall Message Moderation (Optional)

Add `is_approved` boolean column to `wall_messages` with default `true` (auto-approve for now, admin can toggle later).

### Code Changes

1. **`src/components/blog/LikeButton.tsx`**: Remove direct IP fetch; use a fingerprint or session ID approach instead
2. **`src/components/blog/CommentsSection.tsx`**: Ensure email is not displayed in the UI (already not shown, but data is still fetched)
3. **No admin page changes needed** -- admin already authenticates via `has_role` RPC

### Non-Code Actions (Supabase Dashboard)

- Enable leaked password protection
- Reduce OTP expiry to recommended threshold
- Upgrade Postgres version

