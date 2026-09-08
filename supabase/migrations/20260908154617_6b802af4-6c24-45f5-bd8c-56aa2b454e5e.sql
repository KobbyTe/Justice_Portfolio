GRANT SELECT ON TABLE public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.certificates TO authenticated;
GRANT ALL ON TABLE public.certificates TO service_role;