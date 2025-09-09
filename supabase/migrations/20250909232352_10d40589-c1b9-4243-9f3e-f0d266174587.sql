-- Step 1: Add columns to blog_posts if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'category') THEN
        ALTER TABLE public.blog_posts ADD COLUMN category TEXT DEFAULT 'General';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'read_time_minutes') THEN
        ALTER TABLE public.blog_posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5;
    END IF;
END $$;