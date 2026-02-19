-- School Documents table for storing timetables and other school information
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS school_documents (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT, -- 'image/png', 'application/pdf', etc.
    document_type TEXT DEFAULT 'other', -- 'timetable' or 'other'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE school_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for user access through profile ownership
DROP POLICY IF EXISTS "Users can manage school_documents" ON school_documents;

CREATE POLICY "Users can manage school_documents" 
ON school_documents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = school_documents.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_school_documents_profile_id ON school_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_school_documents_type ON school_documents(document_type);

-- Setup Supabase Storage bucket for school documents
-- You need to create this bucket manually in Supabase Dashboard: Storage > Create Bucket
-- Bucket name: 'school-documents'
-- Make it public or set appropriate policies
