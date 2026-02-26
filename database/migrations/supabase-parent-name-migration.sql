-- Add parent_name column to profiles table
-- This stores what the child calls their parent (e.g., "Amma", "Mamma", "Mom", "Dad")
-- Used in badge celebration messages
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_name TEXT DEFAULT 'Mamma';
