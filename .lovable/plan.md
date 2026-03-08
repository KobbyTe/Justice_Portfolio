

# Fix Project Upload/Add in Admin Panel

## Problem Analysis

After reviewing the Admin page code (`src/pages/Admin.tsx` lines 306-369 and 890-955), I found two bugs that cause project creation/editing to fail:

### Bug 1: Edit mode doesn't set category state
When clicking "Edit" on a project, `handleEditProject` (line 371) sets `formData`, `isEditing`, and `editingId` -- but never calls `setProjectCategory(project.category)`. Since `projectCategory` stays as `''` (empty string), the validation on line 320 fires: "Please select a project category" and blocks submission.

### Bug 2: Form reset doesn't clear React state
After a successful add, `e.target.reset()` clears native inputs but the `projectCategory` Select (controlled by React state) is never reset. This is minor but can cause confusion.

### Bug 3: Edit form doesn't pre-populate the Select value
When editing, the category Select doesn't reflect the current project's category because `projectCategory` state is not updated.

---

## Fix Plan

### File: `src/pages/Admin.tsx`

**Fix 1** -- Update `handleEditProject` (around line 371) to also set the category state:

```typescript
const handleEditProject = (project) => {
  setFormData(project);
  setIsEditing(true);
  setEditingId(project.id);
  setProjectCategory(project.category); // <-- ADD THIS
};
```

**Fix 2** -- In `handleAddProject` success path (around line 361), ensure `projectCategory` is reset:

```typescript
setProjectCategory(''); // already exists, verify it's present
```

This is already in the code at line 361, so this is correct.

**Fix 3** -- In the Cancel button handler (around line 945-949), also reset `projectCategory`:

```typescript
<Button type="button" variant="outline" onClick={() => {
  setIsEditing(false);
  setEditingId(null);
  setFormData({});
  setProjectCategory(''); // <-- ADD THIS
}}>
```

---

## Summary

The root cause is a single missing line: `setProjectCategory(project.category)` in the edit handler. For new projects, the flow works as long as a category is selected from the dropdown. Both adding and editing will work reliably after these fixes.

