-- Step 2: Create blog_likes and blog_comments tables
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, ip_address)
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
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

-- Enable RLS
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read blog likes" 
ON public.blog_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create blog likes" 
ON public.blog_likes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read approved blog comments" 
ON public.blog_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Anyone can create blog comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for comments timestamp
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();