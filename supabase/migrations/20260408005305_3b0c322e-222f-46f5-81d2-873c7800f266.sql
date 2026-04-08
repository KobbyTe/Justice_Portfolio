
-- Create recommendation_tokens table
CREATE TABLE public.recommendation_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  recommender_name text NOT NULL,
  recommender_email text,
  is_used boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendation_tokens ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin manage recommendation_tokens"
  ON public.recommendation_tokens FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can look up tokens by value (for the form page)
CREATE POLICY "Public read token by value"
  ON public.recommendation_tokens FOR SELECT
  TO public
  USING (true);

-- Public can mark token as used
CREATE POLICY "Public mark token used"
  ON public.recommendation_tokens FOR UPDATE
  TO public
  USING (is_used = false)
  WITH CHECK (is_used = true);

-- Allow public to insert recommendations (for the submission form)
CREATE POLICY "Public insert recommendations"
  ON public.recommendations FOR INSERT
  TO public
  WITH CHECK (true);
