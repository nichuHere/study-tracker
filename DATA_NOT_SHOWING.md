# Why Data Is Not Showing (Subjects, Tasks, Exams, etc.)

## Issue
You see only the profile selection screen, but no Subjects, Tasks, Exams, or other data sections.

## Root Cause
The app requires these steps in order:

1. **Profile must be created** ✅ (You did this)
2. **Profile must be selected/active** ← This is the step you might be missing
3. **Then you can add Subjects, Tasks, Exams**

## Solution

### Step 1: Make Sure You Have a Profile
When you first load the app, you should see a profile creation form at the top.

### Step 2: Select/Activate the Profile
Once a profile exists, you should see it in the **Profile Selector** dropdown.

**Click on your profile name** to select it. Once selected, the navigation menu will appear showing:
- Daily (Home)
- Analytics (Charts/Progress)
- Subjects (Subject & Chapter management)
- Exams (Exam preparation)

### Step 3: Now You Can Add Data
With a profile selected, you'll see buttons to add:
- ✅ Subjects (click "Subjects" tab → "Add Subject" button)
- ✅ Tasks (click "Daily" tab → "Quick Add Task")
- ✅ Exams (click "Exams" tab → "Add Exam")
- ✅ Reminders (School Reminders section)
- ✅ Recurring Reminders (↻ Recurring button in School Reminders)

---

## Troubleshooting

### Q: I don't see any profile in the dropdown
**A:** Click "Add Profile" button and create one (e.g., "Sachu", "Grade 5")

### Q: I see the profile but navigation buttons don't show
**A:** Make sure the profile is actually **selected** (click on it in the dropdown)

### Q: I added data but it's not saving
**A:** 
1. Check Supabase connection (look in browser console for errors)
2. Verify `.env.local` file has correct credentials
3. Check Supabase > Table Editor to see if tables exist

### Q: Database tables don't exist
**A:**
1. Go to Supabase → SQL Editor
2. Run the `supabase-schema.sql` file from your project
3. Wait for "Success" message

---

## Data Structure

Your data is organized by profile. Each profile has:
- **Subjects** (e.g., Math, Science with chapters)
- **Tasks** (daily assignments)
- **Exams** (upcoming tests with chapters)
- **Reminders** (one-time alerts)
- **Recurring Reminders** (daily/weekly activities like "Tuition Mon/Wed/Thu at 7:15 PM")

All data is stored in Supabase PostgreSQL database and syncs in real-time!

---

## Next Steps

1. ✅ Create a profile
2. ✅ Select the profile (activate it)
3. ✅ Add some subjects
4. ✅ Add some tasks for today
5. ✅ Add an exam with chapters
6. ✅ Try the new Recurring Reminders feature (↻ Recurring button)

**Everything works automatically once you have an active profile!** 🎯
