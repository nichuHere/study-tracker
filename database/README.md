# Database Schema & Migrations

This folder contains all SQL files for setting up and migrating the Supabase database.

## Folder Structure

```
database/
├── README.md           # This file
├── schema/             # Core table definitions
│   ├── supabase-schema.sql           # Base tables (profiles, tasks, subjects, etc.)
│   └── supabase-school-docs-schema.sql   # School documents table
└── migrations/         # Schema updates & additions
    ├── supabase-auth-migration.sql              # User authentication & RLS policies
    ├── supabase-general-tasks-migration.sql     # Support for non-subject tasks
    ├── supabase-chapter-tracking-mode-migration.sql  # Chapter tracking modes
    └── supabase-task-rollover-migration.sql     # Task carryover tracking
```

## Setup Order (New Database)

Run these in the Supabase SQL Editor in order:

1. **`schema/supabase-schema.sql`** - Creates all base tables
2. **`migrations/supabase-auth-migration.sql`** - Sets up authentication & RLS
3. **`migrations/supabase-general-tasks-migration.sql`** - Adds task_type column
4. **`migrations/supabase-chapter-tracking-mode-migration.sql`** - Adds tracking modes
5. **`migrations/supabase-task-rollover-migration.sql`** - Adds carryover tracking
6. **`schema/supabase-school-docs-schema.sql`** - Creates school documents table

## Migration Notes

- All migrations use `IF NOT EXISTS` / `IF EXISTS` checks - safe to re-run
- The auth migration also requires creating users in Supabase Auth dashboard
- School documents require setting up a Storage bucket named `school-documents`
