
-- =============================================
-- MIGRATION: Lock down RLS policies across all tables
-- =============================================

-- 1. DROP all permissive ALL public policies on content tables
DROP POLICY IF EXISTS "Public access to about_content" ON public.about_content;
DROP POLICY IF EXISTS "Public access to blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public access to hero_images" ON public.hero_images;
DROP POLICY IF EXISTS "Public access to update impact_metrics" ON public.impact_metrics;
DROP POLICY IF EXISTS "Public access to projects" ON public.projects;
DROP POLICY IF EXISTS "Public access to recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Public access to resume_files" ON public.resume_files;
DROP POLICY IF EXISTS "Public access to social_links" ON public.social_links;
DROP POLICY IF EXISTS "Public access to tech_stack" ON public.tech_stack;
DROP POLICY IF EXISTS "Public access to wall_messages" ON public.wall_messages;

-- 2. Add SELECT-only public policies for publicly viewable tables
CREATE POLICY "Public read about_content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public read hero_images" ON public.hero_images FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read recommendations" ON public.recommendations FOR SELECT USING (true);
CREATE POLICY "Public read resume_files" ON public.resume_files FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Public read tech_stack" ON public.tech_stack FOR SELECT USING (true);

-- 3. Add admin-only ALL policies for content tables
CREATE POLICY "Admin manage about_content" ON public.about_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage hero_images" ON public.hero_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage impact_metrics" ON public.impact_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage recommendations" ON public.recommendations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage resume_files" ON public.resume_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage social_links" ON public.social_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage tech_stack" ON public.tech_stack FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Wall messages: public SELECT + INSERT, admin-only UPDATE/DELETE
CREATE POLICY "Public read wall_messages" ON public.wall_messages FOR SELECT USING (true);
CREATE POLICY "Public insert wall_messages" ON public.wall_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage wall_messages" ON public.wall_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Bookings: replace public SELECT with admin-only SELECT
DROP POLICY IF EXISTS "Anyone can read bookings" ON public.bookings;
CREATE POLICY "Admin read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Page views: replace public SELECT with admin-only SELECT
DROP POLICY IF EXISTS "Anyone can read page views" ON public.page_views;
CREATE POLICY "Admin read page_views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Blog likes: restrict SELECT to admin, add DELETE policy
DROP POLICY IF EXISTS "Anyone can read blog likes" ON public.blog_likes;
CREATE POLICY "Admin read blog_likes" ON public.blog_likes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can delete own blog likes" ON public.blog_likes FOR DELETE USING (true);

-- 8. Blog comments: admin can manage all comments
CREATE POLICY "Admin manage blog_comments" ON public.blog_comments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
