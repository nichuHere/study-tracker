# Chapter Tracking Modes

## Overview

Two distinct chapter tracking modes allowing users to choose the level of detail that works best for them. This feature is profile-specific, meaning each child can have their own tracking mode.

---

## Requirements

### Functional Requirements
- Choose between Smart and Comprehensive tracking modes
- Set tracking mode per profile
- Prompt user to select mode when missing
- Allow changing mode anytime in profile settings

### Non-Functional Requirements
- Default to Smart mode for new profiles
- Mode change takes effect immediately
- No data loss when switching modes

---

## Data Model

### Profile Addition
| Field | Type | Description |
|-------|------|-------------|
| chapter_tracking_mode | VARCHAR(20) | 'smart' or 'comprehensive' |

### Constraint
```sql
chapter_tracking_mode IN ('comprehensive', 'smart')
DEFAULT 'smart'
```

---

## Tracking Modes

### Smart Tracking (Default)

**Best for:** Busy schedules, simple tracking, quick updates

| Feature | Description |
|---------|-------------|
| Completion | Simple checkbox |
| Study Time | Auto-calculated from completed tasks |
| Tasks Count | Auto-aggregated from task data |
| Last Studied | Auto-updated on task completion |
| Revisions | Not tracked |

**Advantages:**
- Minimal manual input
- Quick and easy
- Data stays consistent with tasks

### Comprehensive Tracking

**Best for:** Detailed planning, thorough review, structured approach

| Feature | Description |
|---------|-------------|
| Status | 5-status flow: pending → started → self_study_done → reviewed → completed |
| Study Time | Dynamically computed from tasks (sum of task durations) |
| Tasks Count | Dynamically computed from tasks (count matching subject + chapter) |
| Last Studied | Dynamically computed from most recent completed task |
| Revisions Needed | Manual entry |
| Revisions Completed | Manual entry |

**Advantages:**
- Full control over status progression
- Dynamic stats linked to actual task data
- Better for exam preparation

---

## Business Rules

1. **New Profiles**: Default to 'smart' mode
2. **Existing Profiles**: 
   - Migrated to 'smart' by default
   - Prompted to confirm on next profile switch
3. **Mode Selection**:
   - Modal appears if tracking mode is null
   - User must select to proceed
   - Can change later in settings
4. **Data Handling**:
   - Switching modes doesn't delete data
   - Smart mode ignores manual fields
   - Comprehensive mode uses all fields

---

## User Interface

### Mode Selection Modal
Appears when:
- Switching to profile with null tracking mode
- First time using profile after migration

**Content:**
- Two clickable cards (Smart / Comprehensive)
- Smart marked as "RECOMMENDED"
- Feature comparison list
- Tip: "Can be changed later in settings"

### Profile Edit Form
- Tracking Mode dropdown
- Options: Smart Tracking / Comprehensive Tracking
- Saves immediately on change

### Chapter List (Smart Mode)
- Checkbox for completion
- Auto-populated stats (read-only)
- Activity indicator (green/yellow/gray)

### Chapter List (Comprehensive Mode)
- **Click-to-cycle status button** (replaces dropdown):
  - Click advances: Pending → Started → Self Study Done → Reviewed → Completed → Pending
  - Color-coded by status (see table below)
  - Shows emoji + label (e.g., "📝 Self Study Done")
- Dynamic stats row (auto-computed from tasks):
  - 📅 Last studied date
  - 📝 Task count
  - ⏱️ Total study minutes
- Revisions needed/completed inputs
- Color-coded activity indicators

### Chapter Status Colors (Both Modes)
| Status | Background | Text | Border | Icon |
|--------|-----------|------|--------|------|
| Pending | `bg-gray-100` | `text-gray-600` | `border-gray-300` | 📋 |
| Started | `bg-yellow-100` | `text-yellow-700` | `border-yellow-300` | 📖 |
| Self Study Done | `bg-teal-100` | `text-teal-700` | `border-teal-300` | 📝 |
| Reviewed | `bg-blue-100` | `text-blue-700` | `border-blue-300` | 🔍 |
| Completed | `bg-green-100` | `text-green-700` | `border-green-300` | ✅ |

---

## Activity Indicators

Based on last studied date:

| Days Since | Color | Label |
|------------|-------|-------|
| 0-3 days | Green | Active |
| 4-7 days | Yellow | Recent |
| 8+ days | Gray | Inactive |

---

## Dynamic Task Linking

In both Smart and Comprehensive modes, chapter cards now compute stats dynamically from the `tasks` array rather than relying on static fields stored in the chapter object:

```javascript
// Filter tasks matching this subject + chapter
const chapterTasks = tasks.filter(t => 
  t.subject === subject.name && t.chapter === chapterName
);
const dynamicTaskCount = chapterTasks.length;
const dynamicStudyTime = chapterTasks.reduce(
  (sum, t) => sum + (parseInt(t.duration) || 0), 0
);
const lastTask = chapterTasks.filter(t => t.completed)
  .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
const dynamicLastStudied = lastTask ? lastTask.date : null;
```

This ensures task count, study time, and last-studied date always reflect actual task data.

---

## Migration

### Database Migration
```sql
ALTER TABLE profiles 
ADD COLUMN chapter_tracking_mode VARCHAR(20) DEFAULT 'smart' 
CHECK (chapter_tracking_mode IN ('comprehensive', 'smart'));
```

### Existing Profile Handling
1. Run migration (sets default 'smart')
2. On profile switch, check if mode is set
3. If null/unset, show selection modal
4. Save selection to database

---

## State Management

| State | Type | Description |
|-------|------|-------------|
| showTrackingModeNotification | boolean | Modal visibility |
| pendingTrackingModeProfile | object | Profile awaiting mode selection |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Mode selection, chapter display |

---

## Related Specs

- [PROFILES.md](PROFILES.md) - Mode stored in profile
- [SUBJECTS.md](SUBJECTS.md) - Chapter structure
