ALTER TABLE public.wall_messages ADD COLUMN IF NOT EXISTS affiliation text;

ALTER TABLE public.wall_messages DROP CONSTRAINT IF EXISTS wall_messages_affiliation_len;
ALTER TABLE public.wall_messages ADD CONSTRAINT wall_messages_affiliation_len CHECK (affiliation IS NULL OR char_length(affiliation) <= 80);