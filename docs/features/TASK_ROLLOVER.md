# Task Rollover

## Overview

Automatic system that moves incomplete tasks from previous days to the current day. Tracks how many times a task has been carried over to provide visual reminders of pending work.

---

## Requirements

### Functional Requirements
- Detect incomplete tasks from past dates
- Move them to today's date automatically
- Track number of carryover days
- Display carryover indicator on tasks
- Preserve carryover history on completion

### Non-Functional Requirements
- Process on app load or profile switch
- Batch update for efficiency
- No user intervention required

---

## Data Model

### Task Addition
| Field | Type | Description |
|-------|------|-------------|
| carryover_days | INTEGER | Times rolled over (default: 0) |

---

## Business Rules

1. **Detection Criteria**:
   - Task date < today
   - Task completed = false

2. **Rollover Process**:
   - Update date to today
   - Increment carryover_days by 1
   - Save to database

3. **Carryover Display**:
   - Show badge if carryover_days > 0
   - Badge remains after completion
   - Indicates task history

4. **Trigger Points**:
   - App startup
   - Profile switch
   - Data reload

---

## Process Flow

```
┌─────────────┐
│ App Loads   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Load Tasks from DB      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Filter: date < today    │
│         AND !completed  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ For each matching task: │
│  - date = today         │
│  - carryover_days += 1  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Batch update to DB      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Display updated tasks   │
└─────────────────────────┘
```

---

## Implementation

### Rollover Function
```javascript
const processTaskRollover = async (tasks, profileId) => {
  const today = getTodayDateIST();
  
  const tasksToRollover = tasks.filter(task => 
    task.date < today && !task.completed
  );
  
  if (tasksToRollover.length === 0) return tasks;
  
  // Batch update
  for (const task of tasksToRollover) {
    await supabase
      .from('tasks')
      .update({
        date: today,
        carryover_days: (task.carryover_days || 0) + 1
      })
      .eq('id', task.id);
  }
  
  // Return updated tasks for state
  return tasks.map(task => {
    if (tasksToRollover.find(t => t.id === task.id)) {
      return {
        ...task,
        date: today,
        carryover_days: (task.carryover_days || 0) + 1
      };
    }
    return task;
  });
};
```

### Integration Point
```javascript
// In loadProfileData
const tasks = await fetchTasks(profileId);
const processedTasks = await processTaskRollover(tasks, profileId);
setTasks(processedTasks);
```

---

## User Interface

### Carryover Badge
- Position: Below chapter name
- Background: Gradient (orange to red)
- Border: Orange
- Text: "Carried over X day(s)"

### Badge Styling
```jsx
<span className="text-xs px-2 py-0.5 rounded-full 
  bg-gradient-to-r from-orange-100 to-red-100 
  text-orange-700 border border-orange-300">
  Carried over {task.carryover_days} day{task.carryover_days > 1 ? 's' : ''}
</span>
```

### Visual States
| State | Display |
|-------|---------|
| New task | No badge |
| Carried over 1 day | Orange badge: "Carried over 1 day" |
| Carried over 3+ days | Red-tinted badge: "Carried over 3 days" |
| Completed + carried | Green card + badge showing history |

---

## Example Scenarios

### Scenario 1: Simple Carryover
```
Monday: Create task "Math homework"
Tuesday: Don't complete it
Wednesday: App loads
→ Task shows "Carried over 1 day"

Thursday: Still incomplete
→ Task shows "Carried over 2 days"
```

### Scenario 2: Completion
```
Task carried over 3 days
User completes it today
→ Card shows green (completed)
→ Badge remains: "Carried over 3 days"
→ Historical record preserved
```

### Scenario 3: New Task
```
Create task today
Complete same day
→ No carryover badge
→ carryover_days = 0
```

---

## Database Migration

```sql
-- Add carryover_days column
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS carryover_days INTEGER DEFAULT 0;

-- Update existing tasks
UPDATE tasks 
SET carryover_days = 0 
WHERE carryover_days IS NULL;
```

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Rollover processing, badge display |

---

## Related Specs

- [TASKS.md](TASKS.md) - Task structure
- [DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) - Migration details
