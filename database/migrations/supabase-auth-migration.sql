-- Authentication Migration for Kannama Study Tracker
-- Run this in Supabase SQL Editor to enable user-based authentication

-- Add user_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Update Row Level Security Policies to be user-specific

-- Profiles: Users can only see and manage their own profiles
DROP POLICY IF EXISTS "Allow all on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

CREATE POLICY "Users can view own profiles" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" 
ON profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Subjects: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on subjects" ON subjects;
DROP POLICY IF EXISTS "Users can manage subjects" ON subjects;

CREATE POLICY "Users can manage subjects" 
ON subjects FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = subjects.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Tasks: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks" ON tasks;

CREATE POLICY "Users can manage tasks" 
ON tasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = tasks.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Exams: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on exams" ON exams;
DROP POLICY IF EXISTS "Users can manage exams" ON exams;

CREATE POLICY "Users can manage exams" 
ON exams FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = exams.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Reminders: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on reminders" ON reminders;
DROP POLICY IF EXISTS "Users can manage reminders" ON reminders;

CREATE POLICY "Users can manage reminders" 
ON reminders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = reminders.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Recurring Reminders: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on recurring_reminders" ON recurring_reminders;
DROP POLICY IF EXISTS "Users can manage recurring_reminders" ON recurring_reminders;

CREATE POLICY "Users can manage recurring_reminders" 
ON recurring_reminders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = recurring_reminders.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Standard Activities: Access through profile ownership
DROP POLICY IF EXISTS "Allow all on standard_activities" ON standard_activities;
DROP POLICY IF EXISTS "Users can manage standard_activities" ON standard_activities;

CREATE POLICY "Users can manage standard_activities" 
ON standard_activities FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = standard_activities.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Shared Activities: Allow all authenticated users to access
DROP POLICY IF EXISTS "Allow all on shared_activities" ON shared_activities;
DROP POLICY IF EXISTS "Authenticated users can manage shared_activities" ON shared_activities;

CREATE POLICY "Authenticated users can manage shared_activities" 
ON shared_activities FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Function to automatically set user_id when creating a profile
CREATE OR REPLACE FUNCTION set_profile_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically set user_id
DROP TRIGGER IF EXISTS set_profile_user_id_trigger ON profiles;
CREATE TRIGGER set_profile_user_id_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_user_id();

-- IMPORTANT: Migrate existing data
-- If you have existing profiles without user_id, you need to either:
-- 1. Delete them (if testing): DELETE FROM profiles WHERE user_id IS NULL;
-- 2. Or assign them to your user account (replace YOUR_USER_ID with actual ID from auth.users)
-- UPDATE profiles SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- Check your user ID with: SELECT id, email FROM auth.users;
