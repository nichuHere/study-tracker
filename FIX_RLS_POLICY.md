# Fix: RLS Policy Error for Recurring Reminders

## Problem
You're getting this error:
```
Failed to add recurring reminder: new row violates row-level security policy for table "recurring_reminders"
```

This means the `recurring_reminders` table doesn't have the proper RLS policy enabled.

## Solution: Apply the RLS Policy

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com and log in
2. Select your project
3. Click **SQL Editor** (left sidebar)

### Step 2: Reset the RLS Policy
1. Click **New Query**
2. Copy and paste this SQL code:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all on recurring_reminders" ON recurring_reminders;

-- Create new policy to allow all operations
CREATE POLICY "Allow all on recurring_reminders" ON recurring_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verify the policy exists
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'recurring_reminders';
```

3. Click **Run** button
4. You should see the policy in the results

### Step 3: Test It
1. Go back to your app
2. Press **Ctrl+F5** to refresh
3. Try adding a recurring reminder - it should work now!

## What This Does
- Removes any conflicting RLS policy
- Creates a new policy that allows all operations (SELECT, INSERT, UPDATE, DELETE)
- The `WITH CHECK (true)` part allows both reading AND writing data

## If Still Not Working
Try this more complete reset:

```sql
-- Disable RLS temporarily to verify it's the issue
ALTER TABLE recurring_reminders DISABLE ROW LEVEL SECURITY;

-- Then re-enable with the policy
ALTER TABLE recurring_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on recurring_reminders" ON recurring_reminders;
CREATE POLICY "Allow all on recurring_reminders" ON recurring_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

---

Once this runs successfully, your recurring reminders should save without any RLS policy errors! 🎉
