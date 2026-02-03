# Fix: Add `end_time` Column to Recurring Reminders

## Problem
You're getting this error:
```
Failed to add recurring reminder: Could not find the 'end_time' column of 'recurring_reminders' in the schema cache
```

This happens because the `recurring_reminders` table in Supabase doesn't have the `end_time` column yet.

## Solution: Add the Column to Your Database

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com and log in
2. Select your project
3. Click **SQL Editor** (left sidebar)

### Step 2: Run the Migration
1. Click **New Query**
2. Copy and paste this SQL code:

```sql
-- Add end_time column to recurring_reminders table
ALTER TABLE recurring_reminders ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '20:00';

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'recurring_reminders' ORDER BY ordinal_position;
```

3. Click **Run** button
4. You should see "Success" message

### Step 3: Refresh Your App
1. Go back to your Study Tracker app
2. Press **Ctrl+F5** to refresh (hard refresh)
3. Try adding a recurring reminder again - it should work now!

## What Was Added
The `recurring_reminders` table now has:
- ✅ `title` - Reminder name
- ✅ `time` - Start time (e.g., 7:15 PM)
- ✅ `end_time` - End time (e.g., 8:00 PM) ← **NEW!**
- ✅ `description` - Optional notes
- ✅ `days` - Array of days (0=Sun, 1=Mon, etc.)
- ✅ `profile_id` - Links to profile

## Example
```
Title: Tuition
Start Time: 7:15 PM
End Time: 8:30 PM
Days: Monday, Wednesday, Thursday
```

Will display as:
```
Tuition
Mon, Wed, Thu
7:15 PM - 8:30 PM
```

---

**Need help?** Check the Supabase documentation: https://supabase.com/docs/guides/database

Once this is done, you can use the full recurring reminder feature! 🎉
