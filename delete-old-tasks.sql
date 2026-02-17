-- Delete all tasks before February 9th, 2026
-- Run this in Supabase SQL Editor

-- First, let's see what will be deleted (PREVIEW - don't modify anything)
SELECT 
    id,
    profile_id,
    subject,
    activity,
    duration,
    date,
    completed,
    created_at
FROM tasks
WHERE date < '2026-02-09'
ORDER BY date, profile_id;

-- If the preview looks correct, run this DELETE statement:
-- UNCOMMENT THE LINES BELOW TO ACTUALLY DELETE

-- DELETE FROM tasks
-- WHERE date < '2026-02-09';

-- To verify deletion, check remaining tasks:
-- SELECT COUNT(*) as remaining_tasks, MIN(date) as earliest_date, MAX(date) as latest_date
-- FROM tasks;
