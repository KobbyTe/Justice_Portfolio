# Remove all Lovable branding from the platform

Goal: zero visible or hidden Lovable trace — no badge on the published site, no Lovable name in tabs/shares, no Lovable URL in SEO, no Lovable references in repo files, and assets renamed off the `lovable-*` namespace.

## 1. Hide the "Edit with Lovable" badge on published deployments
- Call `publish_settings--set_badge_visibility` with `hide_badge: true`.
- Note: requires a Pro plan or higher. If the workspace is on Free, this call will fail and the user must upgrade — I'll surface that clearly if it happens.

## 2. Favicon & shared-link preview image (already the platform logo)
Current state already uses `/favicon.png` and `/logo.png` (the Justice Ansah logo) — no Lovable favicon is shipped. Two cleanup steps:
- Delete the legacy `public/favicon.ico` (browsers auto-request `/favicon.ico` and could still surface a stale icon).
- Confirm `index.html`, `manifest.json`, and `sw.js` all point at `/favicon.png` and `/logo.png` (they already do — no change needed).

## 3. SEO base URL (currently leaks `lovable.app`)
File: `src/components/SEO.tsx`
- Replace `const BASE_URL = 'https://justiceansah.lovable.app'` with the production custom domain. Since none is configured yet, use a relative fallback (`window.location.origin` at runtime, with a safe SSR fallback of `''`) so og/twitter/canonical URLs never expose `lovable.app` once a custom domain is connected.

## 4. Page title / meta tags
`index.html` already says "Justice Ansah" everywhere — no Lovable strings present. No change needed beyond confirming after edits.

## 5. Repo-level Lovable references (not user-visible, but requested)
- **`README.md`** — rewrite as a plain project README for "Justice Ansah" with no Lovable URLs, no "Use Lovable" section, no docs links.
- **`vite.config.ts`** — remove the `import { componentTagger } from "lovable-tagger"` line and its usage in the plugins array (it only runs in `development` mode, but it's a Lovable-named dependency).
- **`package.json`** — remove the `lovable-tagger` dependency entry.
- **`public/lovable-uploads/`** — rename folder to `public/uploads/` and move the one image (`a43e9266-…png`) inside. No code references this path, so it's a safe rename. (If anything in the database stores a `/lovable-uploads/...` URL we'll add a lightweight redirect rule in `public/_redirects`: `/lovable-uploads/* /uploads/:splat 200`.)

## 6. Verification
After edits, re-run `rg -i "lovable"` across the repo (excluding `.lovable/`, lockfiles, and `node_modules`) and confirm zero matches. Reload preview and check:
- Browser tab title + favicon = Justice Ansah logo
- View-source `<head>` has no `lovable` strings
- Share link preview (og:image) resolves to `/logo.png`

## Technical summary of file changes
| File | Change |
|---|---|
| (tool call) `set_badge_visibility` | `hide_badge: true` |
| `public/favicon.ico` | delete |
| `public/lovable-uploads/` | rename → `public/uploads/` |
| `public/_redirects` | add legacy redirect for old upload path |
| `src/components/SEO.tsx` | replace hardcoded `lovable.app` BASE_URL with origin-based value |
| `vite.config.ts` | remove `lovable-tagger` import + plugin |
| `package.json` | drop `lovable-tagger` dependency |
| `README.md` | rewrite without Lovable references |

No UI/component logic changes. No database changes.
