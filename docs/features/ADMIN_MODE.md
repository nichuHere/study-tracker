# Admin Mode (Parental Controls)

## Overview

A hidden admin mode that allows parents to move tasks to previous dates without exposing this ability to children. Admin mode is accessed through a secret gesture (tapping the app logo) and protected by a PIN code.

---

## Requirements

### Functional Requirements
- Secret entry point via logo tap (not visible as a button to kids)
- PIN-based authentication (4-digit numeric code)
- Move/backdate tasks to any past date
- Visual indicator when admin mode is active
- Auto-timeout after inactivity
- Manual exit option

### Non-Functional Requirements
- Admin mode is invisible to children (no visible menu or settings)
- PIN modal is clean and minimal
- Admin actions update both local state and Supabase
- No database schema changes required (uses existing `tasks.date` field)

---

## Access Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tap Logo    │ ──→ │  PIN Modal   │ ──→ │  Admin Mode  │
│ (GraduationCap)    │  (4-digit)   │     │   Active     │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                      │
                      Wrong PIN              ┌────┴────┐
                           │                 │  Exit:  │
                      ┌────┴────┐            │ - Logo  │
                      │  Error  │            │ - Badge │
                      │  Retry  │            │ - Timer │
                      └─────────┘            └─────────┘
```

---

## Configuration

| Setting | Value | Location |
|---------|-------|----------|
| PIN Code | `0000` | `ADMIN_PIN` constant in StudyTracker.jsx |
| Auto-timeout | 10 minutes | `adminTimeout` useEffect |
| Entry point | GraduationCap logo (top-left nav) | Navbar |

---

## Business Rules

1. **Entry**:
   - Tapping the GraduationCap logo opens the PIN modal
   - PIN is exactly 4 digits (numeric only)
   - Incorrect PIN shows error and clears input
   - Enter key submits PIN
   - Backdrop click or Cancel button closes modal

2. **Active Admin Mode**:
   - Amber Shield icon overlays the logo
   - Amber "Admin" badge appears in the navbar (right side)
   - Each task card shows a Calendar edit icon
   - Tapping Calendar icon reveals a date picker on the task card
   - Selecting a date updates the task in Supabase and local state

3. **Exit**:
   - Tap the logo again while in admin mode
   - Tap the "Admin" badge in the navbar
   - Auto-timeout after 10 minutes of entering admin mode
   - All admin UI indicators are removed on exit

4. **Date Editing**:
   - Any task can be moved to any date (past or future)
   - Update persists to Supabase immediately
   - Local state is updated optimistically
   - No confirmation dialog (direct date selection)

---

## User Interface

### PIN Modal
| Element | Description |
|---------|-------------|
| Backdrop | Black/50 opacity with backdrop blur, click to dismiss |
| Lock Icon | Amber lock icon (16x16) in circular background |
| Title | "Admin Access" |
| Subtitle | "Enter PIN to continue" |
| PIN Input | Password field, 4-char max, digits only, centered, large tracking |
| Error State | Red border, red background, "Incorrect PIN" message |
| Submit Button | Full-width amber "Unlock" button |
| Cancel Button | Gray text "Cancel" link below submit |

### Admin Indicators (when active)
| Element | Location | Description |
|---------|----------|-------------|
| Shield Badge | Over logo (top-left) | Small amber Shield icon overlay |
| Admin Button | Navbar (right side) | Amber pill with unlock icon + "Admin" text |

### Task Date Edit (when admin active)
| Element | Description |
|---------|-------------|
| Calendar Icon | Appears on each task card (amber color) |
| Date Input | HTML date picker, appears on Calendar click |
| Behavior | Selecting date triggers `updateTaskDate()` |

---

## State Management

| State | Type | Default | Description |
|-------|------|---------|-------------|
| isAdminMode | boolean | false | Whether admin mode is active |
| showPinModal | boolean | false | Whether PIN modal is visible |
| pinInput | string | '' | Current PIN input value |
| pinError | boolean | false | Whether last PIN attempt failed |
| adminTimeout | ref | null | Timer reference for auto-timeout |
| editingTaskDate | number/null | null | Task ID currently showing date picker |

### Constants
| Name | Value | Description |
|------|-------|-------------|
| ADMIN_PIN | '0000' | Required PIN to enter admin mode |

---

## Functions

### handlePinSubmit()
Validates PIN input against `ADMIN_PIN`. On success: enables admin mode, closes modal, starts timeout. On failure: shows error, clears input.

### exitAdminMode()
Disables admin mode, clears timeout, resets all admin-related state.

### updateTaskDate(taskId, newDate)
Updates task date in Supabase and local state. Closes the date picker after update.

```javascript
// Supabase update
const { error } = await supabase
  .from('tasks')
  .update({ date: newDate })
  .eq('id', taskId);

// Local state update
setTasks(prev => prev.map(t =>
  t.id === taskId ? { ...t, date: newDate } : t
));
```

---

## Security Considerations

- PIN is stored as a constant in the frontend code (not cryptographically secure)
- Intended as a **child deterrent**, not a security mechanism
- No server-side PIN validation
- Admin mode does not grant any additional Supabase permissions
- All database operations use existing RLS policies
- Auto-timeout reduces risk of leaving admin mode open

---

## Icons Used

| Icon | Package | Usage |
|------|---------|-------|
| Shield | lucide-react | Admin mode overlay on logo |
| Lock | lucide-react | PIN modal header icon |
| Unlock | lucide-react | Admin badge in navbar |
| Calendar | lucide-react | Date edit trigger on task cards |

---

## Related Specs

- [TASKS.md](TASKS.md) - Task data model and operations
- [TASK_ROLLOVER.md](TASK_ROLLOVER.md) - Automatic task date management

---

*Last updated: February 26, 2026*
