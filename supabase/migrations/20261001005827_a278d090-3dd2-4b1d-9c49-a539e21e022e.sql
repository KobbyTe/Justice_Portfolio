DROP POLICY IF EXISTS "Admin reads portfolio assets" ON storage.objects;
CREATE POLICY "Admin reads portfolio assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'portfolio-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE INSERT, UPDATE, DELETE ON public.certificates FROM anon;
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;