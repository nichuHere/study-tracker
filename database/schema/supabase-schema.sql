-- ============================================================
-- Kannama Study Tracker - Complete Database Schema
-- ============================================================
-- Run this SINGLE file in Supabase SQL Editor to set up the entire database.
-- Includes all tables, columns, RLS policies, indexes, and triggers.
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles table (one per child)
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class TEXT,
    profile_pic TEXT,                    -- base64-encoded profile picture
    parent_name TEXT DEFAULT 'Mamma',    -- what the child calls the parent
    chapter_tracking_mode VARCHAR(20) DEFAULT 'smart' 
        CHECK (chapter_tracking_mode IN ('comprehensive', 'smart')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table (one per authenticated user - syncs across devices)
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    account_name TEXT DEFAULT '',
    parent_photo TEXT,                   -- base64-encoded parent photo (for celebrations)
    parent_type TEXT DEFAULT 'mother',   -- 'mother' or 'father'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chapters JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (supports both subject tasks and general/non-subject tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT,                        -- NULL for general (non-subject) tasks
    task_type TEXT,                      -- 'Event', 'Project', 'Reading', etc. NULL for subject tasks
    chapter TEXT,
    activity TEXT,
    duration INTEGER DEFAULT 30,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    carryover_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_subject_or_task_type CHECK (subject IS NOT NULL OR task_type IS NOT NULL)
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subjects JSONB DEFAULT '[]'::JSONB,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Reminders table (e.g. "Tuition every Mon/Wed/Thu at 7:15 PM")
CREATE TABLE IF NOT EXISTS recurring_reminders (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time TIME NOT NULL DEFAULT '19:15',
    end_time TIME DEFAULT '20:00',
    days JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School Documents table (timetables, etc.)
CREATE TABLE IF NOT EXISTS school_documents (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,                      -- 'image/png', 'application/pdf', etc.
    document_type TEXT DEFAULT 'other',  -- 'timetable' or 'other'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared activities table (not tied to specific profile)
CREATE TABLE IF NOT EXISTS shared_activities (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'indoor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standard activities per profile
CREATE TABLE IF NOT EXISTS standard_activities (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_activities ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only manage their own profiles
DROP POLICY IF EXISTS "Allow all on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profiles" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- User Settings: Users can only access their own settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Helper function: check if user owns a profile
-- Used by all child-table policies below
CREATE OR REPLACE FUNCTION user_owns_profile(p_profile_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = p_profile_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Subjects
DROP POLICY IF EXISTS "Allow all on subjects" ON subjects;
DROP POLICY IF EXISTS "Users can manage subjects" ON subjects;
CREATE POLICY "Users can manage subjects" ON subjects FOR ALL
  USING (user_owns_profile(profile_id));

-- Tasks
DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks" ON tasks;
CREATE POLICY "Users can manage tasks" ON tasks FOR ALL
  USING (user_owns_profile(profile_id));

-- Exams
DROP POLICY IF EXISTS "Allow all on exams" ON exams;
DROP POLICY IF EXISTS "Users can manage exams" ON exams;
CREATE POLICY "Users can manage exams" ON exams FOR ALL
  USING (user_owns_profile(profile_id));

-- Reminders
DROP POLICY IF EXISTS "Allow all on reminders" ON reminders;
DROP POLICY IF EXISTS "Users can manage reminders" ON reminders;
CREATE POLICY "Users can manage reminders" ON reminders FOR ALL
  USING (user_owns_profile(profile_id));

-- Recurring Reminders
DROP POLICY IF EXISTS "Allow all on recurring_reminders" ON recurring_reminders;
DROP POLICY IF EXISTS "Users can manage recurring_reminders" ON recurring_reminders;
CREATE POLICY "Users can manage recurring_reminders" ON recurring_reminders FOR ALL
  USING (user_owns_profile(profile_id));

-- School Documents
DROP POLICY IF EXISTS "Users can manage school_documents" ON school_documents;
CREATE POLICY "Users can manage school_documents" ON school_documents FOR ALL
  USING (user_owns_profile(profile_id));

-- Standard Activities
DROP POLICY IF EXISTS "Allow all on standard_activities" ON standard_activities;
DROP POLICY IF EXISTS "Users can manage standard_activities" ON standard_activities;
CREATE POLICY "Users can manage standard_activities" ON standard_activities FOR ALL
  USING (user_owns_profile(profile_id));

-- Shared Activities: All authenticated users can access
DROP POLICY IF EXISTS "Allow all on shared_activities" ON shared_activities;
DROP POLICY IF EXISTS "Authenticated users can manage shared_activities" ON shared_activities;
CREATE POLICY "Authenticated users can manage shared_activities" ON shared_activities FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_profile_id ON subjects(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_profile_id ON tasks(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_exams_profile_id ON exams(profile_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
CREATE INDEX IF NOT EXISTS idx_recurring_reminders_profile_id ON recurring_reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_school_documents_profile_id ON school_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_school_documents_type ON school_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_standard_activities_profile_id ON standard_activities(profile_id);

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Auto-set user_id on profile insert (if not provided)
CREATE OR REPLACE FUNCTION set_profile_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_profile_user_id_trigger ON profiles;
CREATE TRIGGER set_profile_user_id_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_user_id();

-- ============================================================
-- 5. STORAGE (Manual Step)
-- ============================================================
-- Create a Storage bucket in Supabase Dashboard:
--   Storage > Create Bucket > Name: 'school-documents'
--   Set appropriate access policies for authenticated users.
