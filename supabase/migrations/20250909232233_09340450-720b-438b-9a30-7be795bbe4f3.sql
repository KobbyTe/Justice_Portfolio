-- Add category column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN category TEXT DEFAULT 'General',
ADD COLUMN read_time_minutes INTEGER DEFAULT 5;

-- Create blog_likes table for like functionality
CREATE TABLE public.blog_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, ip_address)
);

-- Create blog_comments table for comments system
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_likes
CREATE POLICY "Anyone can read blog likes" 
ON public.blog_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create blog likes" 
ON public.blog_likes 
FOR INSERT 
WITH CHECK (true);

-- Create policies for blog_comments
CREATE POLICY "Anyone can read approved blog comments" 
ON public.blog_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Anyone can create blog comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (true);

-- Add triggers for timestamps
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get blog post with like count
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    bp.*,
    COALESCE(bl.like_count, 0) as like_count
  FROM public.blog_posts bp
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM public.blog_likes
    GROUP BY post_id
  ) bl ON bp.id = bl.post_id
  WHERE bp.slug = post_slug AND bp.is_published = true;
$$;