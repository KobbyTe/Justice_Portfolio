CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  issuer text,
  description text,
  category text NOT NULL DEFAULT 'Other',
  file_url text,
  credential_url text,
  issued_on date,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificates TO anon;
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active certificates are viewable by everyone"
ON public.certificates FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert certificates"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update certificates"
ON public.certificates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete certificates"
ON public.certificates FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE, DELETE ON public.certificates TO authenticated;

CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();