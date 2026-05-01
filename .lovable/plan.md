## Plan: TikTok-Style Vlog Feed

A new dedicated page (`/vlogs`) delivering a full-screen, vertically-snapping video feed that mimics TikTok's browsing experience. Separate from the existing `/blog` page (which keeps its grid + Blog/Vlog filter).

### 1. New Route & Navigation

- Add route `/vlogs` in `src/App.tsx` (lazy-loaded).
- Add "Vlogs" item to the nav in `src/components/Navigation.tsx` (between Blog and Gallery).
- The existing `/blog` page is unchanged.

### 2. New Page: `src/pages/Vlogs.tsx`

- Fetches all published `blog_posts` where `featured_video_url` is not null, ordered by `published_at` desc.
- Falls back to a hardcoded array of 5 sample vlogs if none exist (sample MP4s from `https://commondatastorm.s3.amazonaws.com/...` style public test videos, e.g. Big Buck Bunny / Google sample MP4s).
- Each video object: `{ id, title, description, videoUrl, likes, comments }`.
- Renders a vertical scroll container of `VlogCard` items.
- Hides the global Navigation/Footer for an immersive feed (renders its own minimal top bar with a back button + page title).

### 3. New Component: `src/components/vlogs/VlogFeed.tsx`

The scroll container:
- Full-viewport height (`h-[100dvh]`) with `overflow-y-scroll snap-y snap-mandatory`.
- Dark background (`bg-black`).
- Hides scrollbar (`scrollbar-hide` utility via inline style).
- Tracks `activeIndex` using an `IntersectionObserver` (threshold 0.6) on each card to drive autoplay/pause.
- On desktop (≥ md), renders fixed up/down arrow buttons on the right that programmatically `scrollTo` the previous/next card.
- Keyboard support: ArrowUp/ArrowDown navigate cards.

### 4. New Component: `src/components/vlogs/VlogCard.tsx`

Each snap section:
- `h-[100dvh] w-full snap-start flex items-center justify-center bg-black`.
- Inner video frame: full screen on mobile; on desktop centered column `max-w-[420px] aspect-[9/16]` with rounded corners and subtle shadow; surrounding area dimmed black.
- HTML5 `<video>` with `playsInline`, `loop`, `muted` (controlled), `preload="metadata"`, `poster` optional.
- Plays only when active (driven by prop from feed); pauses & resets when not active.
- Click/tap on the video toggles a shared `muted` state (lifted to feed) — TikTok behavior. Show a brief mute/unmute icon flash on toggle.
- Double-tap (mobile) / heart button triggers like animation.

Overlay UI (absolutely positioned within the video frame):
- **Bottom-left**: title (bold) + description (clamped to 2 lines), with subtle gradient background from black/70 to transparent for legibility.
- **Bottom-right**: vertically stacked action column with Like (Heart), Comment (MessageCircle), Share (Share2) — each icon button with a count below. Local state for like toggle + optimistic count.
- **Bottom edge**: thin progress bar (`<div>` width tied to `currentTime / duration` from the video's `timeupdate` event).
- **Top-right**: mute/unmute toggle (Volume2 / VolumeX) as a fallback to tap-to-unmute.

### 5. Styling & Responsive Behavior

- Mobile (< md): video fills the full viewport, no margins, native swipe via snap-mandatory.
- Desktop (≥ md): screen stays black; video card centered at `max-w-[420px]`, aspect 9/16; arrow nav buttons appear to the right of the card.
- Add a small CSS utility in `src/index.css` for `.scrollbar-hide` (webkit + firefox).

### 6. Data Source

- Pulls from existing `blog_posts.featured_video_url`, mapping:
  - `title` ← `post.title`
  - `description` ← `post.excerpt`
  - `videoUrl` ← `post.featured_video_url`
  - `likes` ← `post.likes_count` (if column exists, else random seed for demo)
  - `comments` ← length of related comments (or 0 placeholder)
- If feed is empty, sample dummy data is used so the experience is testable immediately.

### Technical Details

```text
src/
  App.tsx                              [edit] add /vlogs route
  components/
    Navigation.tsx                     [edit] add Vlogs link
    vlogs/
      VlogFeed.tsx                     [new]  scroll container + active index + arrow nav
      VlogCard.tsx                     [new]  video + overlay UI
  pages/
    Vlogs.tsx                          [new]  fetch + render feed
  index.css                            [edit] .scrollbar-hide utility
```

- Autoplay-with-sound is blocked by browsers; videos start muted, and the first user click anywhere unmutes globally (state lifted to feed).
- IntersectionObserver root = the scroll container; threshold 0.6 ensures only one card is "active" at a time.
- Progress bar updates throttled via `requestAnimationFrame` on `timeupdate`.
- No DB schema changes. No new dependencies (uses existing `lucide-react`, Tailwind, framer-motion already in project).
