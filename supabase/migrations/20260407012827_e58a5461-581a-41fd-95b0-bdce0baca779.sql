-- Fix: Restrict public blog_posts SELECT to published only
DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read published blog_posts" ON public.blog_posts
  FOR SELECT TO public USING (is_published = true);

-- Fix: Wall messages should require approval before appearing
ALTER TABLE public.wall_messages ALTER COLUMN is_approved SET DEFAULT false;