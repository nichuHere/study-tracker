-- Study Tracker Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chapters JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter TEXT,
    activity TEXT,
    duration INTEGER DEFAULT 30,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    carryover_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Recurring Reminders table (repeating reminders like "Tuition every Mon/Wed/Thu at 7:15 PM")
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_activities ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - can add authentication later)
DROP POLICY IF EXISTS "Allow all on profiles" ON profiles;
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on subjects" ON subjects;
CREATE POLICY "Allow all on subjects" ON subjects FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on tasks" ON tasks;
CREATE POLICY "Allow all on tasks" ON tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on exams" ON exams;
CREATE POLICY "Allow all on exams" ON exams FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on reminders" ON reminders;
CREATE POLICY "Allow all on reminders" ON reminders FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on recurring_reminders" ON recurring_reminders;
CREATE POLICY "Allow all on recurring_reminders" ON recurring_reminders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on shared_activities" ON shared_activities;
CREATE POLICY "Allow all on shared_activities" ON shared_activities FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on standard_activities" ON standard_activities;
CREATE POLICY "Allow all on standard_activities" ON standard_activities FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_profile_id ON subjects(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_profile_id ON tasks(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_exams_profile_id ON exams(profile_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);
CREATE INDEX IF NOT EXISTS idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
CREATE INDEX IF NOT EXISTS idx_recurring_reminders_profile_id ON recurring_reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_standard_activities_profile_id ON standard_activities(profile_id);
