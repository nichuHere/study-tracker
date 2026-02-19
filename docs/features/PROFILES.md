# Profiles

## Overview

Multi-child profile management system allowing parents to track study activities for multiple children, each with their own subjects, tasks, and progress tracking preferences.

---

## Requirements

### Functional Requirements
- Create child profiles with name and class/grade
- Switch between profiles
- Edit profile details
- Delete profiles (with confirmation)
- Set chapter tracking mode per profile
- Display account name in header

### Non-Functional Requirements
- Profile data is isolated per user (via RLS)
- Profile switching should be instant
- Deleted profiles cascade to delete all related data

---

## Data Model

### Profile
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | TEXT | Child's name (required) |
| class | TEXT | Grade/class (e.g., "Grade 5") |
| chapter_tracking_mode | VARCHAR(20) | 'smart' or 'comprehensive' |
| created_at | TIMESTAMP | Creation timestamp |

### Constraints
```sql
chapter_tracking_mode IN ('smart', 'comprehensive')
DEFAULT 'smart'
```

---

## Business Rules

1. **Profile Creation**: 
   - Name is required
   - Class is optional
   - Default tracking mode is "smart"

2. **Profile Switching**:
   - Switching profiles clears current view state
   - If profile has no tracking mode set, prompt user to choose

3. **Profile Deletion**:
   - Requires confirmation
   - Cascades to delete all related data (subjects, tasks, exams, etc.)
   - Cannot delete while deletion is in progress

4. **Account Name**:
   - Stored in user_metadata
   - Editable from profile settings

---

## User Interface

### Profile Selector (Header)
- Dropdown showing all profiles
- Current profile highlighted
- "Add Profile" button

### Profile Modal
**Tabs:**
1. **Kids Profiles Tab**
   - List of all child profiles
   - Edit/Delete buttons per profile
   - Add new profile form

2. **Account Tab**
   - Edit account name
   - (Future: account settings)

### Add Profile Form
- Name input (required)
- Class/Grade input (optional)
- "Add Profile" button

### Edit Profile Form
- Name input (pre-filled)
- Class/Grade input (pre-filled)
- Chapter Tracking Mode dropdown
- "Save" / "Cancel" buttons

### Tracking Mode Selection Modal
- Appears when switching to profile without tracking mode
- Two cards: "Smart Tracking" and "Comprehensive Tracking"
- "Smart Tracking" marked as recommended

---

## Tracking Modes

| Mode | Description | Best For |
|------|-------------|----------|
| Smart | Automatic metadata tracking from tasks | Quick, simple tracking |
| Comprehensive | Manual entry of all metrics | Detailed planning |

See [CHAPTER_TRACKING.md](CHAPTER_TRACKING.md) for full details.

---

## API Operations

### Load Profiles
```javascript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: true });
```

### Add Profile
```javascript
const { data, error } = await supabase
  .from('profiles')
  .insert([{ 
    name, 
    class: profileClass,
    chapter_tracking_mode: 'smart'
  }])
  .select();
```

### Update Profile
```javascript
const { error } = await supabase
  .from('profiles')
  .update({ name, class: profileClass, chapter_tracking_mode })
  .eq('id', profileId);
```

### Delete Profile
```javascript
const { error } = await supabase
  .from('profiles')
  .delete()
  .eq('id', profileId);
```

---

## State Management

Managed by `useProfiles` custom hook:

| State | Type | Description |
|-------|------|-------------|
| profiles | array | All profiles for current user |
| activeProfile | object | Currently selected profile |
| showAddProfile | boolean | Add profile form visibility |
| showProfileModal | boolean | Profile settings modal visibility |
| editingProfile | object | Profile being edited |
| deletingProfileId | number | Profile being deleted |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Main app, profile switching |
| useProfiles | `src/hooks/useProfiles.js` | Profile state management |

---

## Related Specs

- [AUTHENTICATION.md](AUTHENTICATION.md) - User-profile relationship
- [CHAPTER_TRACKING.md](CHAPTER_TRACKING.md) - Tracking mode details
- [DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) - Table structure
