# Database Schema & Migrations

This folder contains all SQL files for the Supabase database.

## Folder Structure

```
database/
├── README.md
├── schema/
│   └── supabase-schema.sql           # Complete schema (ALL tables, RLS, indexes, triggers)
└── migrations/                        # Historical migrations (already applied)
    ├── supabase-auth-migration.sql
    ├── supabase-chapter-tracking-mode-migration.sql
    ├── supabase-general-tasks-migration.sql
    ├── supabase-parent-name-migration.sql
    ├── supabase-profile-pic-migration.sql
    ├── supabase-task-rollover-migration.sql
    └── supabase-user-settings-migration.sql
```

## Fresh Setup (New Database)

Run **one file** in the Supabase SQL Editor:

1. **`schema/supabase-schema.sql`** — Creates everything: all tables, RLS policies, indexes, and triggers.

Then manually create a Storage bucket:
- Supabase Dashboard → Storage → Create Bucket → Name: `school-documents`

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | One per child (name, class, profile pic, parent name, tracking mode) |
| `user_settings` | One per user account (parent photo, account name, parent type) — syncs across devices |
| `subjects` | Subjects with chapters (JSONB) per profile |
| `tasks` | Study tasks + general tasks (subject or task_type) |
| `exams` | Exams with subject/chapter lists |
| `reminders` | One-time reminders |
| `recurring_reminders` | Repeating reminders (days of week, time) |
| `school_documents` | Uploaded timetables and documents |
| `shared_activities` | Activities shared across all profiles |
| `standard_activities` | Per-profile activity templates |

## Migrations Folder

The `migrations/` folder contains the individual ALTER TABLE scripts that were run historically as features were added. They are kept for reference but are **not needed for a fresh setup** — the consolidated `schema/supabase-schema.sql` already includes everything.
