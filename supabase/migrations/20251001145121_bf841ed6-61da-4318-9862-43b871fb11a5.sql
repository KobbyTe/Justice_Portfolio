-- Create impact_metrics table
CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  students_impacted INTEGER NOT NULL DEFAULT 0,
  teachers_trained INTEGER NOT NULL DEFAULT 0,
  girls_mentored INTEGER NOT NULL DEFAULT 0,
  schools_taught INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public access to read impact_metrics" 
ON public.impact_metrics 
FOR SELECT 
USING (true);

-- Create policy for public write access (for admin panel)
CREATE POLICY "Public access to update impact_metrics" 
ON public.impact_metrics 
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default values
INSERT INTO public.impact_metrics (students_impacted, teachers_trained, girls_mentored, schools_taught)
VALUES (1000, 50, 200, 10)
ON CONFLICT DO NOTHING;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_impact_metrics_updated_at
BEFORE UPDATE ON public.impact_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();