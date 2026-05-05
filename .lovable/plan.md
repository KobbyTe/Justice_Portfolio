## Plan: Ship the cleanup

### 1. Remove NotificationPrompt
- `src/App.tsx` — drop the import and the `<NotificationPrompt />` mount.
- Delete `src/components/NotificationPrompt.tsx`.
- Leave `push_subscriptions` table and `send-push` edge function intact (admin-side push still works); only the visitor-facing prompt goes.

### 2. Service worker — proper registration + safe caching
- `index.html` — replace the bare `register('/sw.js')` with a guarded registration:
  - Skip in iframes and on `id-preview--*.lovable.app` / `lovableproject.com` hosts (unregister any existing SW there to clear the preview cache).
  - `register('/sw.js').catch(...)` with console error.
  - On `updatefound`, listen for the new worker's `statechange`; when it becomes `installed` and there's a controller, send `{type:'SKIP_WAITING'}` and reload once.
- `public/sw.js`:
  - Bump `CACHE_NAME` to `justice-ansah-v3` (and tie it to a build timestamp comment).
  - Add `message` listener: `if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()`.
  - Switch navigation handler to **NetworkFirst with a 3s timeout** that does NOT cache `index.html` / navigations into `CACHE_NAME` (only fall back to cached `/offline.html` on failure). This kills the "stale index.html forever" problem.
  - Keep static-asset caching for hashed Vite assets only (filter URL by `/assets/` prefix) so JS/CSS bundles are still cached but HTML is always fresh.

### 3. SEO meta — fix the lovable-preview leak and OG image
- `src/components/SEO.tsx`:
  - Introduce `SITE_URL` constant. Use `import.meta.env.VITE_SITE_URL` if present, fall back to a configured production URL (use `https://justiceansah.com` placeholder — user can swap once domain is set), and only fall back to `window.location.origin` when neither is set AND the host is not a lovable preview.
  - Tighten `DEFAULT_DESCRIPTION` to a punchier one-liner.
  - Default OG image to `/og-image.png` (1200×630). Note: ship a placeholder; user can replace.
- `index.html`:
  - Mirror the same `og:image` (`/og-image.png`) and add `og:image:width=1200`, `og:image:height=630`.
  - Add `<meta name="robots" content="index,follow">`.

### 4. Merge Vlogs into Blog
- `src/pages/Blog.tsx` — remove `.is('featured_video_url', null)` filter and the post-filter; vlog posts now appear in Blog. `BlogCard` already renders the play-button overlay + "Vlog" badge + "Watch Now" CTA, so no card changes needed.
- `src/components/blog/SearchAndFilters.tsx` — re-enable the content type toggle (or add a simple "All / Articles / Vlogs" pill set) so users can filter. Remove the `hideContentTypeToggle` prop usage in `Blog.tsx` and wire `selectedContentType` to filter `featured_video_url` presence.
- `src/App.tsx` — delete the `/vlogs` and `/vlogs/:slug` routes and the `Vlogs` lazy import.
- `src/components/Navigation.tsx` — remove the `Vlogs` nav item.
- `public/_redirects` and `vercel.json` — add `/vlogs` → `/blog` (301) and `/vlogs/:slug` → `/blog/:slug` (301) so old links don't 404.
- `src/components/AIChatbot.tsx` and `src/components/GamificationWidget.tsx` — drop the `/vlogs` path checks (no longer needed).
- Delete `src/pages/Vlogs.tsx`. Keep `src/components/vlogs/*` and `src/components/admin/VlogManagement.tsx` for admin (admin still creates video posts; they just live in the unified Blog feed). Optionally rename the admin tab label from "Vlogs" to "Videos" — nice-to-have, will do.
- `src/pages/BlogPost.tsx` already has the "Video Hero for Vlogs" branch, so deep-linked playback at `/blog/:slug` works.

### 5. Rename "Frames of Action" → "Gallery"
- `src/components/Navigation.tsx` — change the label on the `/gallery` item to `Gallery`. Route already correct.
- Quick `rg "Frames of Action"` sweep to catch any stray copies (page heading in `src/pages/Gallery.tsx`, footer, etc.) and rename them.

### Resulting nav (8 → 7 items)
```text
Home · About · Resume · Projects · Blog · Gallery · Booking · Wall
```

### Notes / non-goals
- Not touching the chatbot or gamification widget mounts in this pass (separate decision).
- Not changing admin Vlog Management table/columns — vlogs remain `blog_posts` rows with `featured_video_url`; only the public surface is merged.
- OG image file (`public/og-image.png`) will be created as a simple branded placeholder; swap with a designed asset later.
