ALTER TABLE public.impact_metrics
ADD COLUMN years_of_mentoring INTEGER NOT NULL DEFAULT 0,
ADD COLUMN years_of_experience INTEGER NOT NULL DEFAULT 0;