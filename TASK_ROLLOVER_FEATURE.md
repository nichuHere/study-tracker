# Task Rollover Feature

## Overview
Incomplete tasks are now automatically rolled over to the next day with tracking of how many days they've been carried over.

## How It Works

### 1. Automatic Detection
- When you load your profile data (app startup or profile switch), the system checks for incomplete tasks from previous days
- Tasks are considered incomplete if:
  - Their date is before today
  - They have `completed: false`

### 2. Rollover Process
- Each incomplete task from a previous day is automatically:
  - Moved to today's date
  - Marked with a carryover count (incremented by 1)
  - Saved to the database

### 3. Visual Indicator
- Tasks that have been carried over display an orange/red badge showing:
  - "Carried over 1 day" (for tasks carried over once)
  - "Carried over X days" (for tasks carried over multiple times)
  
### 4. Badge Appearance
- The carryover badge appears below the chapter name
- It has a gradient background (orange to red) with a border
- The badge is only shown when `carryover_days > 0`
- Once a task is completed, the badge remains visible to show the task's history

## Database Changes

### New Column
- Added `carryover_days` to the `tasks` table
- Type: INTEGER
- Default: 0
- Tracks the number of times a task has been rolled over

### Migration
For existing databases:
1. Run `supabase-task-rollover-migration.sql` in your Supabase SQL Editor
2. This safely adds the column if it doesn't exist
3. Sets default value of 0 for all existing tasks

## Implementation Details

### Code Changes

#### 1. Task Creation (`addTask`)
- New tasks are created with `carryover_days: 0`

#### 2. Rollover Logic (`processTaskRollover`)
```javascript
// Called during profile data load
// Finds incomplete tasks from previous days
// Updates their date to today
// Increments carryover_days counter
```

#### 3. Profile Data Loading (`loadProfileData`)
- After loading tasks from database
- Automatically processes rollover before setting state
- Ensures UI always shows current state

#### 4. UI Display
- Carryover badge shown between chapter and instructions
- Conditional rendering: `{task.carryover_days > 0 && ...}`
- Gradient styling for visual emphasis

## User Experience

### Daily Workflow
1. Start the app
2. Incomplete tasks automatically move to today
3. See carryover badges on rolled-over tasks
4. Complete tasks to clear them from the list
5. New day? Process repeats automatically

### Benefits
- Never forget incomplete tasks
- Visual reminder of pending work
- No manual intervention needed
- Maintains task history

### Example Scenarios

**Scenario 1: Simple Carryover**
- Monday: Create task "Math homework"
- Tuesday: Don't complete it
- Wednesday: Task shows "Carried over 1 day"
- Thursday: Still incomplete, shows "Carried over 2 days"

**Scenario 2: Completion**
- Task carried over 3 days
- You complete it today
- Badge remains showing "Carried over 3 days"
- Shows completed state with green background

**Scenario 3: New Tasks**
- Create a task today
- Shows no carryover badge (carryover_days = 0)
- Only gets badge if left incomplete and rolled over

## Technical Notes

### Performance
- Rollover processing happens once per profile load
- Uses batch updates with Promise.all()
- Minimal impact on load time

### Data Integrity
- All updates are atomic (database level)
- Failed updates don't break the app
- Error handling prevents partial rollovers

### IST Timezone
- Uses getTodayDateIST() for consistent date comparison
- Ensures rollover works correctly across timezones
- Date format: YYYY-MM-DD

## Files Modified

1. **StudyTracker.jsx**
   - Added `carryover_days: 0` to task creation
   - Created `processTaskRollover()` function
   - Integrated rollover in `loadProfileData()`
   - Added carryover badge UI

2. **supabase-schema.sql**
   - Added `carryover_days INTEGER DEFAULT 0` to tasks table

3. **supabase-task-rollover-migration.sql** (NEW)
   - Migration script for existing databases
   - Safely adds column if not exists
