## Goal
Cut Time-to-Interactive on first load and make navigations feel instant. Focus on the biggest wins, not micro-tweaks.

## What's slow today
1. **Render-blocking Google Fonts** in `<head>` — blocks first paint until the CSS arrives.
2. **No LCP preload** — the hero background image starts downloading only after JS parses `Home.tsx`.
3. **Heavy libs ship on first load** — `framer-motion`, `recharts`, `quill`/`react-quill`, `embla`, `heic2any` are all in one main chunk even though Quill/recharts/heic only run in admin.
4. **Eager widgets above the fold** — `AIChatbot` and `GamificationWidget` import on every route at mount, adding JS + network before paint.
5. **Service worker doesn't precache hashed assets** — repeat visits still hit network for the app shell.
6. **`PageLoader` spinner** flashes for every lazy route because there's no route prefetch on hover/idle.
7. **Home does 3 sequential-ish Supabase queries before paint** even though hero has perfectly good fallback images.

## Plan

### 1. Unblock first paint
- Swap render-blocking `<link rel="stylesheet">` for Google Fonts into `<link rel="preload" as="style" onload="...">` + `<noscript>` fallback, and add `&display=swap` (already there). Drop the `Inter` weights down to just `400;600` — `Montserrat` already covers headings.
- Add `<link rel="preload" as="image" href="/hero-lcp.webp" fetchpriority="high">` in `index.html`. Export the current hero-workspace.jpg to `public/hero-lcp.webp` (smaller, fixed filename, no hashing) and use it as the first frame in `Home.tsx` so the preload actually matches the LCP element.
- Add `<link rel="dns-prefetch">` + `preconnect` for the Supabase URL.

### 2. Code-split the heavy stuff
- Manual Vite chunks in `vite.config.ts`:
  ```ts
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'charts': ['recharts'],
          'editor': ['quill', 'react-quill'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    target: 'es2020',
    cssCodeSplit: true,
  }
  ```
- Lazy-import `heic2any` only inside the upload handler that needs it (dynamic `import()`).
- Confirm `Admin.tsx` and its sub-editors are already lazy (they are via `App.tsx`), and that recharts/quill are only referenced from admin sub-trees so they fall out of the main bundle.

### 3. Defer non-critical widgets
- In `App.tsx`, wrap `AIChatbot` and `GamificationWidget` in `lazy(() => import(...))` and mount them inside a `requestIdleCallback` (with `setTimeout` fallback) wrapper component so they don't compete with the hero render.

### 4. Smarter route prefetch
- Add a tiny `usePrefetchRoutes` hook that, after the home route is interactive (`requestIdleCallback`), warms `import('./pages/Projects')`, `import('./pages/About')`, `import('./pages/Resume')`. Removes the spinner flash for the most common next-clicks.
- Optionally prefetch on `<Link>` hover via a `PrefetchLink` wrapper for nav items.

### 5. Service worker: precache + faster repeat loads
- On `install`, additionally `cache.addAll(['/', '/offline.html', '/manifest.json', '/logo.png'])`.
- Keep navigation network-first (already correct), but for `/assets/*` already cache-first — good.
- Add stale-while-revalidate for same-origin images (`/*.webp`, `/*.png`, `/*.jpg`) so the hero image loads from cache on repeat visits.
- Bump `CACHE_NAME` to `justice-ansah-v4`.

### 6. Home page data: don't block paint
- Render the hero immediately with `fallbackImages` and `aboutContent = null` (already the case).
- Move `loadData()` into a `useEffect` that runs inside `requestIdleCallback` — Supabase fetches stop competing with the LCP image decode.
- Switch `Promise.all` to fire-and-forget per-section so a slow `about_content` query doesn't delay `social_links`.

### 7. Tiny polish
- Add `loading="eager"` + `fetchpriority="high"` only on the first hero `<img>`; everything else stays lazy (already mostly correct).
- Add `content-visibility: auto` on below-the-fold sections (`LogoCarousel`, `ImpactMetrics`, `Recommendations`, `Footer`) via a utility class.
- Replace the full-screen `PageLoader` spinner with a 1-frame skeleton matching nav height so layout doesn't jump.

## Files touched
- `index.html` — font preload, LCP preload, preconnect
- `vite.config.ts` — manualChunks, target
- `public/sw.js` — precache + SWR for images, version bump
- `src/App.tsx` — idle-mount chatbot/gamification, prefetch hook
- `src/main.tsx` — no change
- `src/pages/Home.tsx` — idle data load, LCP image swap
- `src/hooks/usePrefetchRoutes.ts` — new
- `src/components/IdleMount.tsx` — new
- anywhere `heic2any` is imported — convert to dynamic import

## Out of scope
- Image format conversion pipeline (would need `vite-imagetools` + asset rework). Call out separately if you want it next.
- SSR/prerender — not worth the rewrite for this app.

## Expected impact
- First Contentful Paint: ~40-50% faster (fonts unblocked, LCP preloaded).
- Main JS bundle: ~30-50% smaller after splitting motion/charts/quill out.
- Route navigations: feel instant after first idle prefetch.
- Repeat visits: near-instant via SW precache.