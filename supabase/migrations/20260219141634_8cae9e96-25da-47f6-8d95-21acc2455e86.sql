-- Drop and recreate storage policy with explicit WITH CHECK for uploads
DROP POLICY IF EXISTS "Public access to portfolio assets" ON storage.objects;

CREATE POLICY "Public read access to portfolio assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Allow uploads to portfolio assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'portfolio-assets');

CREATE POLICY "Allow updates to portfolio assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'portfolio-assets')
WITH CHECK (bucket_id = 'portfolio-assets');

CREATE POLICY "Allow deletes from portfolio assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'portfolio-assets');