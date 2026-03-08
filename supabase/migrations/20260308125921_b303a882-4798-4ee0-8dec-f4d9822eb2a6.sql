
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 50,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to skills" ON public.skills
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills" ON public.skills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed with default skills
INSERT INTO public.skills (name, percentage, sort_order) VALUES
  ('Robotics & Arduino', 88, 0),
  ('IoT Development', 82, 1),
  ('STEM Education', 92, 2),
  ('Web Development', 75, 3),
  ('CAD & 3D Design', 65, 4),
  ('Python / C++', 70, 5);
