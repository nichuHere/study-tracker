-- Migration: Add chapter_tracking_mode to profiles table
-- This migration adds support for two chapter tracking modes:
-- 'comprehensive' (Option 4): Full tracking with manual completion, study time, tasks, revisions
-- 'smart' (Option 5): Simple checkbox with auto-tracked metadata (default)

-- Add chapter_tracking_mode column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'chapter_tracking_mode'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN chapter_tracking_mode VARCHAR(20) DEFAULT 'smart' CHECK (chapter_tracking_mode IN ('comprehensive', 'smart'));
    END IF;
END $$;

-- Update existing profiles to use 'smart' mode as default
UPDATE profiles 
SET chapter_tracking_mode = 'smart' 
WHERE chapter_tracking_mode IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.chapter_tracking_mode IS 'Chapter tracking mode: comprehensive (full tracking) or smart (simple checkbox with auto-metadata)';
