-- Add tags and video support to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN tags TEXT[],
ADD COLUMN featured_video_url TEXT;

-- Add an index for better tag searching
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);

-- Add comments for the new columns
COMMENT ON COLUMN public.blog_posts.tags IS 'Array of tags for the blog post';
COMMENT ON COLUMN public.blog_posts.featured_video_url IS 'URL for featured video (alternative to featured image)';