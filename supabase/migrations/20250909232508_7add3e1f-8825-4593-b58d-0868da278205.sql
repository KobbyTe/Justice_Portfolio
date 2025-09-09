-- Step 3: Create the function to get blog post with stats
CREATE OR REPLACE FUNCTION public.get_blog_post_with_stats(post_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  slug TEXT,
  category TEXT,
  read_time_minutes INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    bp.id,
    bp.title,
    bp.content,
    bp.excerpt,
    bp.featured_image_url,
    bp.slug,
    bp.category,
    bp.read_time_minutes,
    bp.published_at,
    COALESCE(bl.like_count, 0) as like_count
  FROM public.blog_posts bp
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM public.blog_likes
    GROUP BY post_id
  ) bl ON bp.id = bl.post_id
  WHERE bp.slug = post_slug AND bp.is_published = true;
$$;