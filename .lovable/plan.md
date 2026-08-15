# Redesign: "Sign the Wall" composer

Rebuild the message composer on the Wall page as a compact, expanding card — the best-in-class version of a guestbook input. Signature Blue accent stays locked; only this card changes. Message list, header, and page layout stay as they are.

## The idea

Collapsed, it is a single inviting row: a gradient avatar bubble (the user's initials once they type a name), the prompt "Leave your mark…", and a send icon. Tapping or focusing it expands the full composer with a smooth height + fade transition.

```text
COLLAPSED
┌──────────────────────────────────────────────┐
│ (JA)  Leave your mark…                    →  │
└──────────────────────────────────────────────┘

EXPANDED
┌──────────────────────────────────────────────┐
│ (JA)  Your name                              │
│                                              │
│  Write something inspiring, funny, or kind…  │
│                                              │
│  ─────────────────────────────────────────   │
│  ◔ 128/500                    [ Post → ]     │
└──────────────────────────────────────────────┘
```

## What changes

- **Compact-to-expanded card** — one-line prompt that expands on click/focus; collapses again after a successful post. Framer Motion height/opacity transition using existing shared variants.
- **Live avatar preview** — the same gradient-initials bubble used by posted messages, so the composer previews exactly how the entry will look on the wall.
- **Cleaner field treatment** — borderless inputs on a single inset surface instead of two separate boxes; the card itself carries the border and blue glow edge.
- **Character counter as a ring** — small circular progress ring instead of the faint `0/500` text; turns amber past 450, red at the limit.
- **Refined CTA** — the Post button becomes a pill with a subtle blue glow, an animated send icon on hover, and a spinner + brief success check state on submit.
- **Focus/hover polish** — a soft blue focus ring on the whole card while active, plus a gentle lift on hover.

## Accessibility and behavior

- Expansion is keyboard-triggerable (Enter/Space on the collapsed row) and Escape collapses it when empty.
- Real `<label>` elements, visually hidden, on both fields; the counter is announced politely via `aria-live`.
- Touch targets stay at 44px+; inputs keep 16px font on mobile to avoid iOS zoom.
- Respects reduced motion (existing MotionConfig).

## Unchanged

Submission logic, rate limiting, maxLength caps (50 / 500), toasts, and the Supabase insert all stay exactly as they are.

## Technical notes

- Single file: `src/pages/Wall.tsx`. The composer is extracted into a local `WallComposer` component in the same file; `getAvatarColor` is reused for the preview bubble.
- Motion from `framer-motion` via the existing `src/lib/motion.ts` variants — no new dependencies.
- All colors via existing semantic tokens (`--primary`, `--card`, `--border`, `--muted-foreground`); no hardcoded hex.
