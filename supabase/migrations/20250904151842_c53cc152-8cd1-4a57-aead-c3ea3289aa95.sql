-- Add webp_url column to gallery table for optimized image storage
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS webp_url TEXT;