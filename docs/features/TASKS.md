# Tasks

## Overview

Daily study task planning and tracking system. Tasks represent specific study activities assigned to a date, with support for completion tracking, instructions, and automatic rollover of incomplete tasks.

---

## Requirements

### Functional Requirements
- Create tasks with subject, chapter, activity, duration, and date
- Mark tasks as complete/incomplete
- Edit task details
- Delete tasks
- Filter tasks by date
- Add custom instructions per task
- Track task type (Homework, Syllabus, Revision)
- Automatic rollover of incomplete tasks to today

### Non-Functional Requirements
- Tasks are scoped to active profile
- Quick task creation with sensible defaults
- Visual distinction between completed and incomplete tasks

---

## Data Model

### Task
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| subject | TEXT | Subject name (required) |
| chapter | TEXT | Chapter name (optional) |
| activity | TEXT | Activity type (e.g., "Read chapter") |
| duration | INTEGER | Estimated minutes (default: 30) |
| date | DATE | Scheduled date (required) |
| completed | BOOLEAN | Completion status (default: false) |
| instructions | TEXT | Additional notes/instructions |
| task_type | TEXT | 'homework', 'syllabus', 'revision' |
| carryover_days | INTEGER | Days task was rolled over (default: 0) |
| created_at | TIMESTAMP | Creation timestamp |

---

## Business Rules

1. **Task Creation**:
   - Subject is required
   - Date defaults to today (IST timezone)
   - Duration defaults to 30 minutes
   - carryover_days starts at 0

2. **Task Completion**:
   - Toggle completed status
   - Completed tasks show green background
   - Completion contributes to points

3. **Task Rollover**:
   - Triggered on app load/profile switch
   - Incomplete tasks from past dates move to today
   - carryover_days increments each rollover
   - See [TASK_ROLLOVER.md](TASK_ROLLOVER.md)

4. **Study Time**:
   - Only completed tasks count toward study time
   - Duration is summed for statistics

---

## User Interface

### Task List View
- Grouped by date
- Navigation to previous/next dates
- Task cards showing:
  - Subject name
  - Chapter name
  - Activity type
  - Duration badge
  - Completion checkbox
  - Carryover badge (if applicable)
  - Edit/Delete buttons

### Add Task Form
| Field | Input Type | Required |
|-------|------------|----------|
| Subject | Dropdown (from subjects) | Yes |
| Chapter | Dropdown (from subject chapters) | No |
| Activity | Dropdown + custom | No |
| Task Type | Radio (Homework/Syllabus/Revision) | No |
| Duration | Number input (minutes) | Yes |
| Date | Date picker | Yes |
| Instructions | Textarea | No |

### Task Card States
| State | Visual |
|-------|--------|
| Incomplete | White background, circle icon |
| Completed | Green background, checkmark icon |
| Carried Over | Orange badge showing days |

---

## Standard Activities

Pre-defined activity options:
- Read chapter
- Practice problems
- Review notes
- Watch video
- Take quiz

Custom activities can be added per profile.

---

## API Operations

### Load Tasks
```javascript
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('profile_id', profileId)
  .order('date', { ascending: true });
```

### Add Task
```javascript
const { data, error } = await supabase
  .from('tasks')
  .insert([{
    profile_id: activeProfile.id,
    subject: task.subject,
    chapter: task.chapter,
    activity: task.activity,
    duration: task.duration,
    date: task.date,
    completed: false,
    instructions: task.instructions,
    task_type: task.taskType,
    carryover_days: 0
  }])
  .select();
```

### Update Task
```javascript
const { error } = await supabase
  .from('tasks')
  .update({ completed: !task.completed })
  .eq('id', taskId);
```

### Delete Task
```javascript
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

---

## Points Integration

| Action | Points |
|--------|--------|
| Complete task | 10 points |
| Study time | 1 point per minute |
| 5+ tasks/day | Task Master badge |

See [POINTS_SYSTEM.md](POINTS_SYSTEM.md) for full details.

---

## State Management

| State | Type | Description |
|-------|------|-------------|
| tasks | array | All tasks for active profile |
| newTask | object | Form state for adding task |
| selectedDate | string | Currently viewed date |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Task CRUD operations |
| Dashboard | `src/components/Dashboard.jsx` | Task statistics |

---

## Related Specs

- [TASK_ROLLOVER.md](TASK_ROLLOVER.md) - Automatic task rollover
- [SUBJECTS.md](SUBJECTS.md) - Subject/chapter for task creation
- [POINTS_SYSTEM.md](POINTS_SYSTEM.md) - Task completion points
