

# Fix Admin Login Race Condition and Home Page Display

## Issues Found

After thorough testing, I identified the following:

1. **Admin page race condition**: The auth check in `Admin.tsx` has both `onAuthStateChange` and `getSession` running simultaneously, which can cause a race condition where the page redirects back to `/auth` before the role check completes. The `INITIAL_SESSION` event from `onAuthStateChange` fires at the same time as `getSession`, leading to duplicate role checks that can conflict.

2. **Home page "nothing showing"**: The Recommendations section is empty because there are no records in the database. The section still renders but shows nothing visible, which may appear broken.

## Plan

### 1. Fix Admin.tsx Auth Flow

Refactor the auth check to prevent race conditions:

- Use a flag to prevent duplicate processing from both `onAuthStateChange` and `getSession`
- Skip the `INITIAL_SESSION` event in `onAuthStateChange` since `getSession` handles it
- Add proper loading state to prevent flash of redirect

**File: `src/pages/Admin.tsx` (lines 41-85)**

The `useEffect` will be updated to:
- Only process `SIGNED_IN`, `SIGNED_OUT`, and `TOKEN_REFRESHED` events in `onAuthStateChange` (skip `INITIAL_SESSION`)
- Let `getSession` handle the initial session check
- Use a ref to track if auth has already been processed to prevent double execution

### 2. Fix Home Page Empty State

Update `src/components/Recommendations.tsx` to hide the section entirely when there are no recommendations, so the page doesn't look broken.

**File: `src/components/Recommendations.tsx`**

- Add a check: if recommendations array is empty, return `null` instead of rendering an empty section

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Fix auth race condition in useEffect |
| `src/components/Recommendations.tsx` | Hide section when no data |

