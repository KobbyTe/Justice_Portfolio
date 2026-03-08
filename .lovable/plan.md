

## Auto-Scrolling Logo Carousel

### What we're building
An infinite auto-scrolling horizontal carousel showing logos of companies, organizations, exhibitions, and competitions Justice has volunteered for or exhibited at. Placed on the homepage between the hero section and Impact Metrics.

### Database
Create a new `partner_logos` table:
- `id` (uuid, PK)
- `name` (text) — organization name
- `logo_url` (text) — image URL
- `category` (text) — e.g. "company", "organization", "exhibition", "competition"
- `sort_order` (int, default 0)
- `is_active` (boolean, default true)
- RLS: public read, authenticated write

### New Component: `LogoCarousel.tsx`
- Fetches active logos from `partner_logos` ordered by `sort_order`
- Renders a CSS-animation-based infinite scroll (duplicate the logo list for seamless loop)
- Uses `@keyframes scroll` to translate the strip horizontally
- Pauses on hover
- Section heading: "Trusted By & Featured At" or similar
- Grayscale logos that colorize on hover

### Homepage Integration
Insert `<LogoCarousel />` in `Home.tsx` between the hero `</section>` and `<ImpactMetrics />`.

### Admin Management
Add a simple logo management section in the Admin page to upload/manage partner logos.

### Files to create/edit
1. **SQL migration** — create `partner_logos` table with RLS
2. **`src/components/LogoCarousel.tsx`** — new component
3. **`src/pages/Home.tsx`** — import and place the carousel
4. **`src/pages/Admin.tsx`** — add logo management UI
5. **`tailwind.config.ts`** — add `scroll` keyframe animation if needed

