-- User Settings Migration for Kannama Study Tracker
-- Moves parent photo, account name, and parent type from localStorage to database
-- so they sync across devices (mobile + desktop)
-- Run this in Supabase SQL Editor

-- Create user_settings table (one row per authenticated user)
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    account_name TEXT DEFAULT '',
    parent_photo TEXT,        -- base64 encoded parent photo
    parent_type TEXT DEFAULT 'mother',  -- 'mother' or 'father'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON user_settings FOR DELETE
USING (auth.uid() = user_id);
