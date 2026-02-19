

# Fix Admin Upload Failures

## Root Cause

The Radix UI `<Select>` component (used for category selection in both **Gallery** and **Projects** forms) does NOT work with native HTML `FormData`. Unlike a native `<select>` element, Radix Select does not create a hidden form input, so `formData.get('category')` returns `null`. Since `category` is a required database column, the Supabase insert fails silently.

This affects:
- **Gallery uploads**: category is required (defaults to 'All' in DB, but the form sends `null`)
- **Project uploads**: category is a non-nullable USER-DEFINED enum column (`Robotics`, `Web app`, `Mobile app`, `AI`) -- sending `null` causes a hard database error

## Fix

Replace the `FormData`-based category extraction with React state management for the Select components.

### Changes to `src/pages/Admin.tsx`

1. **Add state variables** for category selections:
   - `galleryCategory` (string, default `'All'`)
   - `projectCategory` (string, default `''`)

2. **Update `handleAddProject`** (line ~299): Use `projectCategory` state instead of `formData.get('category')`

3. **Update `handleAddGalleryItem`** (line ~557): Use `galleryCategory` state instead of `formData.get('category')`

4. **Update the Select components in JSX** (lines ~868 and ~1152): Add `value` and `onValueChange` props to bind to the new state variables, and reset them after successful submission

### Technical Detail

```text
Before (broken):
  <Select name="category" required>  // Radix Select ignores "name"
  ...
  const category = formData.get('category');  // returns null

After (fixed):
  <Select value={projectCategory} onValueChange={setProjectCategory}>
  ...
  // Use projectCategory state directly in the insert
```

No database or storage changes needed -- the RLS policies and storage bucket are correctly configured.

