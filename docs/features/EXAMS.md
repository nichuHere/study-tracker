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
| chapters | array | Chapter names to study |
| keyPoints | string | Important notes/topics |

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

3. **Exam Visibility**:
   - Upcoming: Subject date >= today
   - Past: All subject dates < today
   - Past exams hidden by default

4. **Urgency Indicators**:
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

### Exam Card (Expanded)
For each subject:
- Subject name
- Exam date
- Chapters list (chips)
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
