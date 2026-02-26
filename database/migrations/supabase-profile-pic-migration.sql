-- Add profile_pic column to profiles table
-- Stores base64-encoded profile picture data
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_pic TEXT;
