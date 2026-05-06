
## Goal

When a visitor clicks a vlog (any blog post with `featured_video_url`), open it in a full-screen, vertical, swipe-driven player — like TikTok, but cleaner and more modern — instead of the standard article layout. Text-only posts keep using the current `BlogPost` page.

## What changes

### 1. New route: `/watch/:slug`
A dedicated full-bleed page that mounts the existing `VlogFeed` component:
- Loads the active vlog by slug.
- Loads sibling vlogs (other published posts where `featured_video_url is not null`, newest first) so the user can swipe up/down through the catalog.
- Reorders the feed so the clicked vlog is the first card; the rest follow chronologically and loop back.
- No `Navigation`/`Footer` chrome — just a small floating top-left back button and the feed.
- SEO: title = vlog title, OG image = `featured_image_url` or YouTube thumbnail, canonical = `/watch/:slug`.

### 2. Routing in `BlogCard`
`src/components/blog/BlogCard.tsx`: when the card represents a vlog, navigate to `/watch/:slug` instead of `/blog/:slug`. Non-vlog cards keep going to `/blog/:slug`.

`src/pages/Blog.tsx`: `handleBlogClick` becomes vlog-aware (or the routing decision moves entirely into `BlogCard`).

`src/pages/BlogPost.tsx`: if a user lands on `/blog/:slug` and the loaded post has a `featured_video_url`, redirect once to `/watch/:slug` (keeps existing inbound links working, removes the duplicate iframe player).

`src/App.tsx`: register the new `/watch/:slug` route, lazy-loaded.

### 3. Cleaner, more modern `VlogCard`
Targeted polish on `src/components/vlogs/VlogCard.tsx` — keep behavior, refine the surface:

- **Top bar (new)**: thin gradient with a small avatar/initial + "Justice Ansah" label + relative timestamp ("3d ago"). Replaces the orphaned action buttons floating below the global nav.
- **Action stack (right)**: drop the heavy black/40 circular pills. Use frosted, smaller (44px) icon buttons with subtle shadow, tighter spacing, and counts in a lighter weight. Animate the heart with a spring on tap.
- **Title/description (bottom-left)**: tighter type scale, max 2 lines title + 2 lines description, subtle expand-on-tap for long descriptions, tag chips rendered inline when present.
- **Progress bar**: move to the very top of the card (TikTok-style hairline) and slim it to 2px with rounded ends; remove the bottom one.
- **Mute/play affordance**: collapse the redundant top-right play+mute pair into a single mute toggle; keep tap-to-pause and double-tap-to-like on the video itself. Show a one-time, auto-fading "tap to unmute" pill for the first card only.
- **Desktop frame**: keep 9:16 column, but soften with `rounded-3xl`, a faint outer glow (`shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.25)]`), and a blurred ambient backdrop (scaled-up, blurred copy of the poster behind the frame) instead of pure black.
- **Comments sheet**: open from the bottom, rounded top corners, drag handle, max-height 80dvh (already partially present in `VlogComments`; just verify styling matches the new surface).

All colors via existing semantic tokens; no raw hex.

### 4. Feed-level polish (`VlogFeed.tsx`)
- Replace the bare black background with the same ambient blurred backdrop so swipes feel continuous.
- Keep the desktop counter pill; restyle to match (smaller, frosted, top-center).
- Add a subtle scroll-snap easing and a one-time "swipe up for more" hint on the first card on mobile.

### 5. Housekeeping
- Remove the old `<video controls>` / iframe block from `BlogPost.tsx` (lines 169–196) once the redirect is in place — vlogs no longer render here.
- Add a `Watch` CTA on `BlogCard` for vlogs (replace current "Watch Now" text with a small play-pill that visually previews the destination experience).

## Out of scope
- No new database columns or RLS changes.
- No edits to `VlogManagement` admin tooling.
- Chatbot, gamification widget, and other globals are untouched.

## Files touched
- `src/App.tsx` — add `/watch/:slug` route
- `src/pages/Watch.tsx` — new page (loads vlogs, mounts `VlogFeed`)
- `src/pages/Blog.tsx` — vlog-aware click routing
- `src/pages/BlogPost.tsx` — redirect vlogs to `/watch/:slug`, drop inline video block
- `src/components/blog/BlogCard.tsx` — route vlogs to `/watch/:slug`, refresh CTA
- `src/components/vlogs/VlogCard.tsx` — visual refresh
- `src/components/vlogs/VlogFeed.tsx` — ambient backdrop, hint
- `public/_redirects`, `vercel.json` — optional: add `/vlogs/:slug → /watch/:slug` (currently they go to `/blog/:slug`, which would then bounce to `/watch/:slug` anyway — fine to leave as-is)
