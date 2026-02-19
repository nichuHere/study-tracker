# Database Schema

## Overview

PostgreSQL database hosted on Supabase with Row Level Security (RLS) for data isolation. All tables support user-specific data through `user_id` foreign key to `auth.users`.

---

## Tables

### profiles
Child profiles for study tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| user_id | UUID | REFERENCES auth.users | Owner user |
| name | TEXT | NOT NULL | Child's name |
| class | TEXT | | Grade/class |
| chapter_tracking_mode | VARCHAR(20) | DEFAULT 'smart' | 'smart' or 'comprehensive' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

### subjects
Subjects with embedded chapters JSON.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| name | TEXT | NOT NULL | Subject name |
| chapters | JSONB | DEFAULT '[]' | Array of chapter objects |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Chapter JSON Structure:**
```json
{
  "id": "uuid",
  "name": "Chapter Name",
  "completed": false,
  "studyTime": 0,
  "tasksCompleted": 0,
  "revisionsNeeded": 0,
  "revisionsCompleted": 0,
  "lastStudied": "2026-02-19",
  "status": "pending"
}
```

---

### tasks
Daily study tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| subject | TEXT | NOT NULL | Subject name |
| chapter | TEXT | | Chapter name |
| activity | TEXT | | Activity type |
| duration | INTEGER | DEFAULT 30 | Minutes |
| date | DATE | NOT NULL | Scheduled date |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| instructions | TEXT | | Additional notes |
| task_type | TEXT | | 'homework'/'syllabus'/'revision' |
| carryover_days | INTEGER | DEFAULT 0 | Rollover count |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

### exams
Exam planning with embedded subjects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| name | TEXT | NOT NULL | Exam name |
| subjects | JSONB | DEFAULT '[]' | Array of exam subjects |
| date | DATE | NOT NULL | Primary exam date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Exam Subject JSON Structure:**
```json
{
  "subject": "Mathematics",
  "date": "2026-03-15",
  "chapters": ["Chapter 1", "Chapter 2"],
  "keyPoints": "Focus on algebra"
}
```

---

### reminders
One-time reminders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| title | TEXT | NOT NULL | Reminder title |
| date | DATE | NOT NULL | Reminder date |
| description | TEXT | | Details |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

### recurring_reminders
Repeating reminders by day of week.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| title | TEXT | NOT NULL | Reminder title |
| description | TEXT | | Details |
| time | TIME | DEFAULT '19:15' | Start time |
| end_time | TIME | DEFAULT '20:00' | End time |
| days | JSONB | DEFAULT '[]' | Array of day names |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Days JSON Structure:**
```json
["Monday", "Wednesday", "Friday"]
```

---

### school_documents
Uploaded documents (timetables, circulars).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| file_name | TEXT | NOT NULL | Original filename |
| file_url | TEXT | NOT NULL | Storage URL |
| file_type | TEXT | | MIME type |
| document_type | TEXT | | 'timetable' or 'other' |
| description | TEXT | | User description |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

### shared_activities
Activities shared across all profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| title | TEXT | NOT NULL | Activity title |
| description | TEXT | | Details |
| category | TEXT | DEFAULT 'indoor' | Category |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

### standard_activities
Default activity templates per profile.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| profile_id | BIGINT | REFERENCES profiles ON DELETE CASCADE | Parent profile |
| activity | TEXT | NOT NULL | Activity name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

---

## Row Level Security (RLS)

All tables have RLS enabled to ensure users only access their own data.

### Enable RLS
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_documents ENABLE ROW LEVEL SECURITY;
```

### Profile Policies
```sql
CREATE POLICY "Users can view own profiles"
ON profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profiles"
ON profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profiles"
ON profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own profiles"
ON profiles FOR DELETE
USING (user_id = auth.uid());
```

### Related Table Policies
```sql
-- Example for subjects (similar for other tables)
CREATE POLICY "Users can manage own subjects"
ON subjects FOR ALL
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);
```

---

## Migrations

### Migration Files

| File | Purpose |
|------|---------|
| supabase-schema.sql | Base schema creation |
| supabase-auth-migration.sql | Add user_id, RLS policies |
| supabase-chapter-tracking-mode-migration.sql | Add tracking mode column |
| supabase-task-rollover-migration.sql | Add carryover_days column |
| supabase-general-tasks-migration.sql | Task type column |
| supabase-school-docs-schema.sql | School documents table |

### Running Migrations
1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Paste migration SQL
4. Click "Run"

---

## Storage Buckets

### school-documents
For uploaded files (timetables, PDFs, images).

**Policies:**
```sql
-- Public read for authenticated users
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-documents' AND auth.role() = 'authenticated');

-- Insert for authenticated users
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'school-documents' AND auth.role() = 'authenticated');

-- Delete own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'school-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │
│ (Supabase)  │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│  profiles   │──────┬───────┬───────┬───────┬───────┐
└─────────────┘      │       │       │       │       │
       │ 1:N         │       │       │       │       │
       ▼             ▼       ▼       ▼       ▼       ▼
┌──────────┐  ┌──────┐ ┌─────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│ subjects │  │tasks │ │exams│ │reminders│ │recurr. │ │school_   │
│ (JSONB   │  │      │ │     │ │         │ │remind. │ │documents │
│ chapters)│  │      │ │     │ │         │ │        │ │          │
└──────────┘  └──────┘ └─────┘ └─────────┘ └────────┘ └──────────┘
```

---

## Related Documentation

- [AUTHENTICATION.md](../features/AUTHENTICATION.md) - Auth integration
- [supabase-schema.sql](../../supabase-schema.sql) - Base schema
- [supabase-auth-migration.sql](../../supabase-auth-migration.sql) - Auth migration
