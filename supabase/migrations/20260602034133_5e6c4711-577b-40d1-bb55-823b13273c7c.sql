
-- Drop the policy that depends on ip_address so we can change its type
DROP POLICY IF EXISTS "Anyone can create blog likes" ON public.blog_likes;

ALTER TABLE public.blog_likes ALTER COLUMN ip_address TYPE text USING ip_address::text;

CREATE POLICY "Anyone can create blog likes"
ON public.blog_likes
FOR INSERT
TO anon, authenticated
WITH CHECK (
  post_id IS NOT NULL
  AND ip_address IS NOT NULL
  AND length(ip_address) BETWEEN 8 AND 100
);

-- Restore Data API grants
GRANT SELECT, INSERT ON public.blog_likes TO anon, authenticated;
GRANT DELETE ON public.blog_likes TO authenticated;
GRANT ALL ON public.blog_likes TO service_role;

GRANT SELECT, INSERT ON public.blog_comments TO anon, authenticated;
GRANT ALL ON public.blog_comments TO service_role;

GRANT EXECUTE ON FUNCTION public.delete_own_blog_like(uuid, text) TO anon, authenticated;
