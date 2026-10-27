-- 1) Hide commenter emails again.
-- Migration 20260602034133 re-granted table-wide SELECT on blog_comments,
-- which undid the column-level restriction from 20260504132117 and exposed
-- the email column of approved comments through the public API.
REVOKE SELECT ON public.blog_comments FROM anon, authenticated;
GRANT SELECT (id, post_id, parent_id, name, content, is_approved, created_at, updated_at)
  ON public.blog_comments TO anon, authenticated;

-- 2) Only approved wall messages are publicly readable
--    (admins still see everything via "Admin manage wall_messages").
DROP POLICY IF EXISTS "Public read wall_messages" ON public.wall_messages;
CREATE POLICY "Public read wall_messages" ON public.wall_messages
  FOR SELECT USING (is_approved = true);

-- 3) Only active (approved) recommendations are publicly readable
--    (admins still see everything via "Admin manage recommendations").
DROP POLICY IF EXISTS "Public read recommendations" ON public.recommendations;
CREATE POLICY "Public read recommendations" ON public.recommendations
  FOR SELECT USING (is_active = true);
