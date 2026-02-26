# Reminders

## Overview

Reminder system supporting both one-time and recurring reminders. One-time reminders are for specific dates (e.g., "Submit project"), while recurring reminders repeat on specified days (e.g., "Tuition every Monday at 7 PM").

---

## Requirements

### Functional Requirements
- Create one-time reminders with date and description
- Create recurring reminders with days, time, and duration
- Edit existing reminders
- Delete reminders
- View today's reminders prominently
- Dismiss notifications temporarily

### Non-Functional Requirements
- Reminders scoped to active profile
- Recurring reminders show for matching days
- Time displayed in 12-hour format
- Reminders can be managed from both the Reminders section and the Calendar view

---

## Data Model

### One-Time Reminder
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| title | TEXT | Reminder title (required) |
| date | DATE | Reminder date (required) |
| description | TEXT | Additional details |
| created_at | TIMESTAMP | Creation timestamp |

### Recurring Reminder
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| title | TEXT | Reminder title (required) |
| description | TEXT | Additional details |
| time | TIME | Start time (default: 19:15) |
| end_time | TIME | End time (default: 20:00) |
| days | JSONB | Array of day names |
| created_at | TIMESTAMP | Creation timestamp |

### Days Format
```javascript
["Monday", "Wednesday", "Friday"]
```

---

## Business Rules

1. **One-Time Reminders**:
   - Title and date required
   - Shown on the specified date only
   - Past reminders can still be viewed

2. **Recurring Reminders**:
   - Title required
   - At least one day must be selected
   - Time defaults to 7:15 PM
   - Shown every week on selected days

3. **Today's Reminders**:
   - One-time reminders where date = today
   - Recurring reminders where today's day is in days array

4. **Notification Display**:
   - Shown in dashboard header
   - Can be minimized
   - Can be dismissed (stored in localStorage)

---

## User Interface

### Reminder Types Toggle
- One-time / Recurring tabs
- Different forms per type

### One-Time Reminder Form
| Field | Input Type | Required |
|-------|------------|----------|
| Title | Text input | Yes |
| Date | Date picker | Yes |
| Description | Textarea | No |

### Recurring Reminder Form
| Field | Input Type | Required |
|-------|------------|----------|
| Title | Text input | Yes |
| Days | Checkbox group | Yes (at least 1) |
| Start Time | Time input | Yes |
| End Time | Time input | No |
| Description | Textarea | No |

### Day Selection
Checkboxes for:
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

### Reminders List
**One-Time Reminders:**
- Title
- Date
- Description (expandable)
- Edit/Delete buttons

**Recurring Reminders:**
- Title
- Days badges (e.g., "Mon Wed Fri")
- Time range (e.g., "7:15 PM - 8:00 PM")
- Description (expandable)
- Edit/Delete buttons

### Notifications Area
- Bell icon with count
- Dropdown/panel showing today's reminders
- Minimize/expand toggle
- Dismiss button per reminder

### Calendar View Integration
Reminders can be added, edited, and deleted directly from the Calendar view:

**Add Reminder from Calendar:**
- Click a day on the calendar to open the selected day detail panel
- Click the bell+plus button (top-right of panel) to open the add reminder form
- Empty days show a prominent "Add a Reminder" button
- Date is pre-filled to the selected calendar day
- Supports both one-time (date pre-filled) and recurring (day-of-week pre-selected) types
- Same form fields as the Reminders section

**Edit/Delete from Calendar:**
- Each reminder card in the selected day panel shows edit (pencil) and delete (trash) icons
- Edit opens an inline form within the calendar panel (amber for one-time, blue for recurring)
- Delete removes the reminder immediately
- Uses the same `startEditReminder`, `startEditRecurringReminder`, `deleteReminder`, `deleteRecurringReminder` functions

---

## API Operations

### Load Reminders
```javascript
// One-time reminders
const { data: reminders } = await supabase
  .from('reminders')
  .select('*')
  .eq('profile_id', profileId)
  .order('date', { ascending: true });

// Recurring reminders
const { data: recurring } = await supabase
  .from('recurring_reminders')
  .select('*')
  .eq('profile_id', profileId);
```

### Add One-Time Reminder
```javascript
const { data, error } = await supabase
  .from('reminders')
  .insert([{
    profile_id: activeProfile.id,
    title: reminder.title,
    date: reminder.date,
    description: reminder.description
  }])
  .select();
```

### Add Recurring Reminder
```javascript
const { data, error } = await supabase
  .from('recurring_reminders')
  .insert([{
    profile_id: activeProfile.id,
    title: reminder.title,
    days: reminder.days,
    time: reminder.time,
    end_time: reminder.endTime,
    description: reminder.description
  }])
  .select();
```

### Update Reminder
```javascript
// One-time
const { error } = await supabase
  .from('reminders')
  .update({ title, date, description })
  .eq('id', reminderId);

// Recurring
const { error } = await supabase
  .from('recurring_reminders')
  .update({ title, days, time, end_time, description })
  .eq('id', reminderId);
```

### Delete Reminder
```javascript
// One-time
const { error } = await supabase
  .from('reminders')
  .delete()
  .eq('id', reminderId);

// Recurring
const { error } = await supabase
  .from('recurring_reminders')
  .delete()
  .eq('id', reminderId);
```

---

## State Management

Managed by `useReminders` custom hook:

| State | Type | Description |
|-------|------|-------------|
| reminders | array | One-time reminders |
| recurringReminders | array | Recurring reminders |
| newReminder | object | One-time form state |
| newRecurringReminder | object | Recurring form state |
| reminderType | string | 'one-time' or 'recurring' |
| editingReminder | object | Reminder being edited |
| editingRecurringReminder | object | Recurring reminder being edited |

### Notification State
| State | Type | Description |
|-------|------|-------------|
| showNotificationsDropdown | boolean | Dropdown visibility |
| notificationsMinimized | boolean | Collapsed state |
| dismissedNotifications | array | Dismissed reminder IDs |

### Calendar Reminder State
| State | Type | Description |
|-------|------|-------------|
| showCalendarAddReminder | boolean | Calendar add form visibility |
| calendarReminderType | string | 'one-time' or 'recurring' (calendar form) |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Reminder UI and CRUD |
| useReminders | `src/hooks/useReminders.js` | Reminder state management |

---

## Related Specs

- [PROFILES.md](PROFILES.md) - Reminders scoped to profile
- [TASKS.md](TASKS.md) - Tasks vs reminders distinction
