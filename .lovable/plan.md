

## Checks, Improvements & Suggestions

### Issues Found

1. **React Warning: `fetchPriority` prop** — The hero image in `Home.tsx` uses `fetchPriority` which React 18 doesn't recognize as a valid DOM attribute (it expects lowercase `fetchpriority`). This generates a console warning on every render.

2. **Logo size (w-20 h-20 = 80px) expanding navbar height** — An 80px logo makes the navbar significantly taller than typical (48-64px). The nav padding is only `py-3 sm:py-4`, so the logo overflows the visual rhythm. Consider constraining the logo with `max-h-12` or `max-h-14` while keeping `w-auto` so it scales proportionally without blowing up the navbar.

3. **Mobile menu top offset hardcoded** — The mobile overlay uses `top-[56px]` but with an 80px logo, the actual navbar height is much taller. The menu will overlap or leave a gap.

### Recommended Improvements

| # | Change | File |
|---|--------|------|
| 1 | Replace `fetchPriority` with lowercase `fetchpriority` (or remove it since React 18 doesn't support it cleanly — use an HTML attribute workaround) | `Home.tsx` |
| 2 | Constrain logo to navbar-friendly height: `h-12 w-auto` or `h-14 w-auto` so it scales proportionally without stretching the navbar | `Navigation.tsx` |
| 3 | Fix mobile menu `top` offset to use a dynamic or larger value matching the actual navbar height (e.g., `top-[80px]` or use a ref-based approach) | `Navigation.tsx` |
| 4 | Add `aria-current="page"` to active nav links for better accessibility | `Navigation.tsx` |
| 5 | Add `loading="lazy"` to the portrait image on the About page for performance | `About.tsx` |

### Optional Enhancements

- **Skip-to-content link** — Add a visually hidden "Skip to main content" link at the top of the page for keyboard/screen-reader users.
- **Reduce layout shift** — Add explicit `width`/`height` attributes to the hero images to prevent CLS.
- **SEO: Add structured data (JSON-LD)** — Add Person schema markup to improve search engine understanding of the portfolio.

### Implementation Approach

All changes are minor, single-line or few-line edits across 2-3 files. No architectural changes needed. The `fetchPriority` fix and mobile menu offset fix address real bugs; the rest are quality improvements.

