GRANT SELECT ON TABLE public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.certificates TO authenticated;
GRANT ALL ON TABLE public.certificates TO service_role;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;