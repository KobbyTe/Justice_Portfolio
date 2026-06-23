
CREATE OR REPLACE FUNCTION public.get_blog_like_count(_post_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint FROM public.blog_likes WHERE post_id = _post_id;
$$;

CREATE OR REPLACE FUNCTION public.has_liked_post(_post_id uuid, _fingerprint text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blog_likes
    WHERE post_id = _post_id AND ip_address::text = _fingerprint
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_blog_like_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_liked_post(uuid, text) TO anon, authenticated;
