
-- Add moderation to wall messages
ALTER TABLE public.wall_messages ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
