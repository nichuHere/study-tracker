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
| Status | Manual: pending/started/completed |
| Study Time | Manual entry (minutes) |
| Tasks Count | Manual entry |
| Revisions Needed | Manual entry |
| Revisions Completed | Manual entry |
| Last Studied | Manual date selection |

**Advantages:**
- Full control over all metrics
- Detailed planning capabilities
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
- Status dropdown (pending/started/completed)
- Editable study time input
- Editable tasks count
- Revisions needed/completed inputs
- Date picker for last studied
- Color-coded activity indicators

---

## Activity Indicators

Based on last studied date:

| Days Since | Color | Label |
|------------|-------|-------|
| 0-3 days | Green | Active |
| 4-7 days | Yellow | Recent |
| 8+ days | Gray | Inactive |

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
