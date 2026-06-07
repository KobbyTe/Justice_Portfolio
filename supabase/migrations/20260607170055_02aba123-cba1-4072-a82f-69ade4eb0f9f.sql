
-- 1) Revoke EXECUTE on internal trigger SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2) Replace permissive INSERT policies with validated WITH CHECK expressions
DROP POLICY IF EXISTS "Anyone can create blog comments" ON public.blog_comments;
CREATE POLICY "Anyone can create blog comments" ON public.blog_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(content) BETWEEN 1 AND 5000
    AND char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND is_approved IS NOT TRUE
  );

DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(page_path) BETWEEN 1 AND 500
    AND (referrer IS NULL OR char_length(referrer) <= 2000)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
    AND (session_id IS NULL OR char_length(session_id) <= 100)
  );

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR char_length(phone) <= 30)
    AND (message IS NULL OR char_length(message) <= 2000)
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Public insert wall_messages" ON public.wall_messages;
CREATE POLICY "Public insert wall_messages" ON public.wall_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(message) BETWEEN 1 AND 1000
    AND is_approved IS NOT TRUE
  );

DROP POLICY IF EXISTS "Public insert recommendations" ON public.recommendations;
CREATE POLICY "Public insert recommendations" ON public.recommendations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(message) BETWEEN 1 AND 2000
    AND (position IS NULL OR char_length(position) <= 150)
    AND (company IS NULL OR char_length(company) <= 150)
    AND is_active IS NOT TRUE
  );
