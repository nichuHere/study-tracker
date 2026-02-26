# Exams

## Overview

Exam planning and preparation system for organizing upcoming tests. Each exam can have multiple subjects with their own dates, chapters, and key points to study.

---

## Requirements

### Functional Requirements
- Create named exams (e.g., "Mid-Term Exams")
- Add multiple subjects per exam with individual dates
- Specify chapters to study for each subject
- Add key points/notes per subject
- View upcoming vs past exams
- Minimize/expand exam cards
- Edit and delete exams

### Non-Functional Requirements
- Exams scoped to active profile
- Sort by nearest exam date
- Visual distinction for urgent exams (within 7 days)

---

## Data Model

### Exam
| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Primary key |
| profile_id | BIGINT | Foreign key to profiles |
| name | TEXT | Exam name (required) |
| subjects | JSONB | Array of exam subject objects |
| date | DATE | Overall exam date (for sorting) |
| created_at | TIMESTAMP | Creation timestamp |

### Exam Subject (in subjects JSONB)
| Field | Type | Description |
|-------|------|-------------|
| subject | string | Subject name |
| date | string | Exam date for this subject |
| chapters | array | Array of chapter objects (see below) |
| keyPoints | string | Important notes/topics |

### Exam Chapter (in chapters array)
| Field | Type | Description |
|-------|------|-------------|
| name | string | Chapter name |
| status | string | One of: `pending`, `started`, `self_study_done`, `reviewed`, `completed` |
| revisionsNeeded | number | Number of revisions planned |
| revisionsCompleted | number | Number of revisions done |
| studyMode | string | Study approach: 'Full Portions', 'Key Topics Only', 'Custom' |
| customStudyMode | string | Custom study mode description (when studyMode is 'Custom') |

---

## Business Rules

1. **Exam Creation**:
   - Name is required
   - At least one subject should be added
   - Date is set to earliest subject date

2. **Exam Subject**:
   - Subject name required
   - Date required
   - Chapters and keyPoints are optional

3. **Chapter Status Flow** (5 statuses):
   - `pending` → `started` → `self_study_done` → `reviewed` → `completed`
   - Status tracked per chapter within each exam subject
   - Click-to-cycle button advances to next status
   - Progress summary shows counts per status category

4. **Exam Visibility**:
   - Upcoming: Subject date >= today
   - Past: All subject dates < today
   - Past exams hidden by default

5. **Urgency Indicators**:
   - Red badge: Exam within 3 days
   - Orange badge: Exam within 7 days

---

## User Interface

### Exam List View
- Toggle: "Show Previous Exams"
- Exam cards with:
  - Exam name header
  - Minimize/expand button
  - Days until exam badge
  - Subject list (when expanded)
  - Edit/Delete buttons

### Chapter Status Colors
| Status | Color | Icon | Label |
|--------|-------|------|-------|
| Pending | Gray (`bg-gray-100`) | 📋 | Pending |
| Started | Yellow (`bg-yellow-100`) | 📖 | Started |
| Self Study Done | Teal (`bg-teal-100`) | 📝 | Self Study Done |
| Reviewed | Blue (`bg-blue-100`) | 🔍 | Reviewed |
| Completed | Green (`bg-green-100`) | ✅ | Completed |

### Exam Card (Expanded)
For each subject:
- Subject name
- Exam date
- Chapters list with status badges (click-to-cycle)
- Chapter progress bar (completed / total)
- Status summary (counts per status)
- Revisions needed/completed per chapter
- Study mode per chapter
- Key points text

### Add Exam Form
**Step 1: Exam Name**
- Name input

**Step 2: Add Subjects**
| Field | Input Type | Required |
|-------|------------|----------|
| Subject | Dropdown (from subjects) | Yes |
| Date | Date picker | Yes |
| Chapters | Multi-select or text input | No |
| Key Points | Textarea | No |

- "Add Subject to Exam" button
- List of added subjects
- "Save Exam" button

### Edit Exam Form
- Same as add form, pre-populated
- Can add/remove subjects

---

## API Operations

### Load Exams
```javascript
const { data } = await supabase
  .from('exams')
  .select('*')
  .eq('profile_id', profileId)
  .order('date', { ascending: true });
```

### Add Exam
```javascript
const { data, error } = await supabase
  .from('exams')
  .insert([{
    profile_id: activeProfile.id,
    name: exam.name,
    subjects: exam.subjects,
    date: earliestSubjectDate
  }])
  .select();
```

### Update Exam
```javascript
const { error } = await supabase
  .from('exams')
  .update({
    name: exam.name,
    subjects: exam.subjects,
    date: earliestSubjectDate
  })
  .eq('id', examId);
```

### Delete Exam
```javascript
const { error } = await supabase
  .from('exams')
  .delete()
  .eq('id', examId);
```

---

## Dashboard Integration

- Upcoming exams count displayed
- Next exam date highlighted
- Integration with study suggestions

---

## State Management

| State | Type | Description |
|-------|------|-------------|
| exams | array | All exams for active profile |
| newExam | object | Form state for adding exam |
| newExamSubject | object | Current subject being added |
| editingExam | object | Exam being edited |
| minimizedExams | object | Map of exam IDs to minimized state |
| showPreviousExams | boolean | Toggle past exams visibility |

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| StudyTracker | `src/components/StudyTracker.jsx` | Exam CRUD operations |
| Dashboard | `src/components/Dashboard.jsx` | Exam statistics |

---

## Related Specs

- [SUBJECTS.md](SUBJECTS.md) - Subjects used in exam planning
- [TASKS.md](TASKS.md) - Tasks can be created for exam prep
