DROP POLICY IF EXISTS "Active certificates are viewable by everyone" ON public.certificates;

CREATE POLICY "Public can view active certificates"
ON public.certificates
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can view all certificates"
ON public.certificates
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));