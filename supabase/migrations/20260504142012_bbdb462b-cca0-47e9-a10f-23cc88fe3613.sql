
-- Replace fingerprint-header policy with a secure RPC approach.
DROP POLICY IF EXISTS "Users can delete their own blog likes" ON public.blog_likes;

-- Now blog_likes has no public DELETE policy; only admins can delete.
-- Provide a SECURITY DEFINER function for visitors to remove their own like.
CREATE OR REPLACE FUNCTION public.delete_own_blog_like(_post_id uuid, _fingerprint text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _fingerprint IS NULL OR length(_fingerprint) < 8 THEN
    RAISE EXCEPTION 'invalid fingerprint';
  END IF;

  DELETE FROM public.blog_likes
  WHERE post_id = _post_id
    AND ip_address::text = _fingerprint;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_blog_like(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_own_blog_like(uuid, text) TO anon, authenticated;
