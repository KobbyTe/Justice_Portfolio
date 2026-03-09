
DROP POLICY IF EXISTS "Allow uploads to portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to portfolio assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from portfolio assets" ON storage.objects;

CREATE POLICY "Admin uploads to portfolio assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets'
    AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates to portfolio assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-assets'
    AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes from portfolio assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-assets'
    AND public.has_role(auth.uid(), 'admin'));
