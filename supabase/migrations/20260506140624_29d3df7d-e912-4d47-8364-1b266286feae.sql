
-- 1. recommendation_tokens: remove public SELECT and public UPDATE; expose via SECURITY DEFINER RPCs
DROP POLICY IF EXISTS "Public read token by value" ON public.recommendation_tokens;
DROP POLICY IF EXISTS "Public mark token used" ON public.recommendation_tokens;

CREATE OR REPLACE FUNCTION public.validate_recommendation_token(_token uuid)
RETURNS TABLE (id uuid, status text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.recommendation_tokens%ROWTYPE;
BEGIN
  SELECT * INTO rec FROM public.recommendation_tokens WHERE token = _token;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, 'not_found'::text, NULL::timestamptz;
    RETURN;
  END IF;
  IF rec.is_used THEN
    RETURN QUERY SELECT rec.id, 'used'::text, rec.expires_at;
    RETURN;
  END IF;
  IF rec.expires_at < now() THEN
    RETURN QUERY SELECT rec.id, 'expired'::text, rec.expires_at;
    RETURN;
  END IF;
  RETURN QUERY SELECT rec.id, 'valid'::text, rec.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_recommendation_token_used(_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.recommendation_tokens
  SET is_used = true
  WHERE token = _token AND is_used = false AND expires_at >= now();
END;
$$;

REVOKE ALL ON FUNCTION public.validate_recommendation_token(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_recommendation_token_used(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_recommendation_token(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_recommendation_token_used(uuid) TO anon, authenticated;

-- 2. push_subscriptions: remove permissive public DELETE; only admins / edge function (service role) can delete
DROP POLICY IF EXISTS "Anyone can delete own push subscription" ON public.push_subscriptions;

CREATE POLICY "Admins can delete push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tighten INSERT checks
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Anyone can insert push subscriptions"
  ON public.push_subscriptions FOR INSERT TO public
  WITH CHECK (
    endpoint IS NOT NULL AND length(endpoint) > 10
    AND p256dh IS NOT NULL AND length(p256dh) > 0
    AND auth IS NOT NULL AND length(auth) > 0
  );

-- 3. blog_likes INSERT: tighten check
DROP POLICY IF EXISTS "Anyone can create blog likes" ON public.blog_likes;
CREATE POLICY "Anyone can create blog likes"
  ON public.blog_likes FOR INSERT TO public
  WITH CHECK (post_id IS NOT NULL AND ip_address IS NOT NULL);

-- 4. Storage: drop broad SELECT on portfolio-assets to prevent listing.
-- Public URLs continue to work without a SELECT policy on storage.objects for public buckets.
DROP POLICY IF EXISTS "Public read access to portfolio assets" ON storage.objects;

-- 5. Revoke EXECUTE on internal SECURITY DEFINER functions that should not be callable via API
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
