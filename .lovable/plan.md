

## Plan: Add Vlog Content to Blog Section

### What Changes

The blog system already supports video URLs but treats vlogs the same as text posts. This plan adds a dedicated **Vlog** content type with video-first presentation, a Blog/Vlog toggle filter, and enhanced video cards.

### 1. Add Blog/Vlog Content Type Toggle to Search & Filters

**File: `src/components/blog/SearchAndFilters.tsx`**
- Add a segmented toggle above categories: **All | Blog | Vlog**
- Pass a new `onContentTypeChange` prop and `selectedContentType` state
- Style as pill-shaped buttons with icons (FileText for Blog, Video for Vlog)

### 2. Update Blog Page with Content Type Filtering

**File: `src/pages/Blog.tsx`**
- Add `selectedContentType` state (`'' | 'blog' | 'vlog'`)
- Filter logic: Vlog = posts with `featured_video_url` set; Blog = posts without
- Pass content type state to `SearchAndFilters`
- Update page heading to reflect selection ("Blog", "Vlogs", or "Blog & Vlogs")

### 3. Redesign BlogCard for Video-First Vlog Display

**File: `src/components/blog/BlogCard.tsx`**
- When the post has a `featured_video_url`, render a video-first card:
  - Show a large play button overlay on the thumbnail area
  - Add a "Vlog" badge alongside the category badge
  - For YouTube/Vimeo URLs, extract and display a thumbnail image automatically
  - Add a subtle video duration indicator style
- Keep the existing image card design for regular blog posts

### 4. Enhance BlogPost Page for Vlog Playback

**File: `src/pages/BlogPost.tsx`**
- When a post has `featured_video_url`, prioritize the video hero over the image (already partially done, but refine):
  - Make the video player larger and more prominent
  - Add a "Watch" duration indicator
  - Style the content below as supplementary notes rather than the main content

### Technical Details

- No database changes needed; `featured_video_url` column already exists on `blog_posts`
- YouTube thumbnail extraction: parse video ID from URL, use `https://img.youtube.com/vi/{ID}/hqdefault.jpg`
- Content type detection is purely based on whether `featured_video_url` is truthy
- All changes are UI-only, leveraging existing data

