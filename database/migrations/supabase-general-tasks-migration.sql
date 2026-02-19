-- Migration to support general (non-subject) tasks
-- Add task_type column to tasks table to differentiate between subject tasks and general tasks

-- Add task_type column (nullable, defaults to NULL for subject-based tasks)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS task_type TEXT;

-- Update subject column to be nullable (allows tasks without subjects)
ALTER TABLE tasks 
ALTER COLUMN subject DROP NOT NULL;

-- Add a check constraint to ensure either subject or task_type is provided
ALTER TABLE tasks
ADD CONSTRAINT check_subject_or_task_type
CHECK (subject IS NOT NULL OR task_type IS NOT NULL);

-- Create an index on task_type for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);

-- Comment on the new column
COMMENT ON COLUMN tasks.task_type IS 'Type of general task: Event, Project, Reading, Chore, Music, Sports, Personal, or General. NULL for subject-based tasks.';
