-- Migration: Add carryover_days column to tasks table
-- This adds support for tracking how many days a task has been carried over
-- Run this in Supabase SQL Editor if you have an existing database

-- Add carryover_days column to tasks table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'carryover_days'
    ) THEN
        ALTER TABLE tasks 
        ADD COLUMN carryover_days INTEGER DEFAULT 0;
        
        -- Update existing tasks to have carryover_days = 0
        UPDATE tasks 
        SET carryover_days = 0 
        WHERE carryover_days IS NULL;
        
        RAISE NOTICE 'Added carryover_days column to tasks table';
    ELSE
        RAISE NOTICE 'carryover_days column already exists';
    END IF;
END $$;
