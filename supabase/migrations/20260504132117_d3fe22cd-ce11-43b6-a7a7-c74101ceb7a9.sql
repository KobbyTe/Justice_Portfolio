
-- 1. Restrict blog_likes DELETE: require matching ip_address via custom header set by client
DROP POLICY IF EXISTS "Anyone can delete own blog likes" ON public.blog_likes;

CREATE POLICY "Users can delete their own blog likes"
  ON public.blog_likes
  FOR DELETE
  USING (
    ip_address::text = COALESCE(
      current_setting('request.headers', true)::json ->> 'x-like-fingerprint',
      ''
    )
    AND COALESCE(current_setting('request.headers', true)::json ->> 'x-like-fingerprint', '') <> ''
  );

-- Admins can also delete any like
CREATE POLICY "Admins can delete any blog like"
  ON public.blog_likes
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Protect commenter email column from public exposure
-- Revoke broad column SELECT and grant only non-email columns to anon/authenticated
REVOKE SELECT ON public.blog_comments FROM anon, authenticated;
GRANT SELECT (id, post_id, parent_id, name, content, is_approved, created_at, updated_at)
  ON public.blog_comments TO anon, authenticated;
-- Admins (service_role / authenticated admins via RLS) keep full access through existing admin policy.
GRANT SELECT ON public.blog_comments TO service_role;
