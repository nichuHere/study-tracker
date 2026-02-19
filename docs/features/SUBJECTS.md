# Subjects & Chapters

## Overview

Subject and chapter organization system for structuring study content. Each profile has its own set of subjects, and each subject contains multiple chapters that can be tracked for completion.

---

## Requirements

### Functional Requirements
- Create subjects with unique names
- Add chapters to subjects
- Edit chapter names
- Track chapter completion status
- Delete subjects and chapters
- View chapter details and progress

### Non-Functional Requirements
- Subjects are scoped to active profile
- Chapters stored as JSON array in subjects table
- Chapter tracking mode affects available fields

---

## Data Model

### Subject
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| name | TEXT | Subject name (required) |
| chapters | JSONB | Array of chapter objects |
| created_at | TIMESTAMP | Creation timestamp |

### Chapter (in chapters JSONB)
| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID for the chapter |
| name | string | Chapter name |
| completed | boolean | Completion status |
| studyTime | number | Minutes studied (comprehensive mode) |
| tasksCompleted | number | Tasks completed for chapter |
| revisionsNeeded | number | Revisions planned (comprehensive) |
| revisionsCompleted | number | Revisions done (comprehensive) |
| lastStudied | string | ISO date of last study (comprehensive) |
| status | string | 'pending'/'started'/'completed' (comprehensive) |

---

## Business Rules

1. **Subject Creation**:
   - Name is required and should be unique per profile
   - Chapters array initializes as empty

2. **Chapter Tracking**:
   - Mode determined by profile's `chapter_tracking_mode`
   - **Smart Mode**: Auto-tracks from task completion
   - **Comprehensive Mode**: Manual entry of all fields

3. **Chapter Completion**:
   - In Smart mode: Toggle checkbox
   - In Comprehensive mode: Set status to 'completed'

4. **Subject Deletion**:
   - Cascades to remove subject from all tasks referencing it

---

## Chapter Tracking Modes

### Smart Mode (Default)
| Field | Source |
|-------|--------|
| completed | User checkbox |
| studyTime | Sum from completed tasks |
| tasksCompleted | Count from completed tasks |
| lastStudied | Auto-updated on task completion |

### Comprehensive Mode
| Field | Entry |
|-------|-------|
| status | Manual (pending/started/completed) |
| studyTime | Manual input |
| tasksCompleted | Manual input |
| revisionsNeeded | Manual input |
| revisionsCompleted | Manual input |
| lastStudied | Manual date picker |

See [CHAPTER_TRACKING.md](CHAPTER_TRACKING.md) for full details.

---

## User Interface

### Subject List View
- Card per subject showing:
  - Subject name
  - Chapter count
  - Progress indicator
  - Edit/Delete buttons
- Click to expand chapter list

### Add Subject Form
- Subject name input
- "Add Subject" button

### Subject Detail View
- Subject header with edit option
- Chapter list with:
  - Chapter name
  - Completion checkbox/status
  - Tracking fields (based on mode)
  - Edit/Delete buttons
- "Add Chapter" button

### Add Chapter Form
- Chapter name input
- "Add" button

---

## API Operations

### Load Subjects
```javascript
const { data } = await supabase
  .from('subjects')
  .select('*')
  .eq('profile_id', profileId)
  .order('name', { ascending: true });
```

### Add Subject
```javascript
const { data, error } = await supabase
  .from('subjects')
  .insert([{
    profile_id: activeProfile.id,
    name: subjectName,
    chapters: []
  }])
  .select();
```

### Add Chapter
```javascript
const updatedChapters = [
  ...subject.chapters,
  {
    id: crypto.randomUUID(),
    name: chapterName,
    completed: false,
    studyTime: 0,
    tasksCompleted: 0
  }
];

const { error } = await supabase
  .from('subjects')
  .update({ chapters: updatedChapters })
  .eq('id', subjectId);
```

### Update Chapter
```javascript
const updatedChapters = subject.chapters.map(ch =>
  ch.id === chapterId ? { ...ch, ...updates } : ch
);

const { error } = await supabase
  .from('subjects')
  .update({ chapters: updatedChapters })
  .eq('id', subjectId);
```

### Delete Subject
```javascript
const { error } = await supabase
  .from('subjects')
  .delete()
  .eq('id', subjectId);
```

---

## State Management

| State | Type | Description |
|-------|------|-------------|
| subjects | array | All subjects for active profile |
| newSubject | object | Form state for adding subject |
| viewingSubject | object | Currently expanded subject |
| editingChapter | object | Chapter being edited |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Subject/chapter CRUD |

---

## Related Specs

- [CHAPTER_TRACKING.md](CHAPTER_TRACKING.md) - Tracking mode details
- [TASKS.md](TASKS.md) - Tasks reference subjects/chapters
- [PROFILES.md](PROFILES.md) - Tracking mode stored in profile
