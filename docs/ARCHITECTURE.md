# Kannama Study Tracker - Architecture Overview

## Overview

Kannama Study Tracker is a family-focused study management application that helps parents track their children's educational progress, plan study tasks, manage exams, and encourage learning through gamification.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18.2 | UI Components |
| Styling | Tailwind CSS | Mobile-first responsive design |
| Icons | Lucide React | UI icons |
| Database | Supabase (PostgreSQL) | Data persistence |
| Authentication | Supabase Auth | User management |
| Storage | Supabase Storage | Document uploads |
| Hosting | Vercel | Deployment |

---

## Core Features

| Feature | Description | Spec Document |
|---------|-------------|---------------|
| Authentication | User signup, login, password reset | [docs/features/AUTHENTICATION.md](features/AUTHENTICATION.md) |
| Profiles | Multi-child profile management | [docs/features/PROFILES.md](features/PROFILES.md) |
| Subjects & Chapters | Subject and chapter organization | [docs/features/SUBJECTS.md](features/SUBJECTS.md) |
| Tasks | Daily study task planning | [docs/features/TASKS.md](features/TASKS.md) |
| Task Rollover | Auto-move incomplete tasks | [docs/features/TASK_ROLLOVER.md](features/TASK_ROLLOVER.md) |
| Exams | Exam planning and preparation | [docs/features/EXAMS.md](features/EXAMS.md) |
| Reminders | One-time and recurring reminders | [docs/features/REMINDERS.md](features/REMINDERS.md) |
| Chapter Tracking | Smart vs comprehensive tracking | [docs/features/CHAPTER_TRACKING.md](features/CHAPTER_TRACKING.md) |
| Points & Leaderboard | Gamification system | [docs/features/POINTS_SYSTEM.md](features/POINTS_SYSTEM.md) |
| Badges | Achievement badges | [docs/features/BADGES.md](features/BADGES.md) |
| School Documents | Document upload & timetables | [docs/features/SCHOOL_DOCUMENTS.md](features/SCHOOL_DOCUMENTS.md) |

---

## Technical Documentation

| Document | Description |
|----------|-------------|
| [docs/technical/DATABASE_SCHEMA.md](technical/DATABASE_SCHEMA.md) | Database tables, relationships, RLS policies |
| [docs/technical/UI_RESPONSIVENESS.md](technical/UI_RESPONSIVENESS.md) | Mobile-first design, breakpoints, responsive patterns |

---

## Project Structure

```
StudyTrackerApp/
├── public/
│   └── index.html
├── src/
│   ├── components/           # React components
│   │   ├── Auth.jsx          # Authentication UI
│   │   ├── AuthPage.jsx      # Auth page wrapper
│   │   ├── BadgeIcon.jsx     # Badge display component
│   │   ├── Dashboard.jsx     # Main dashboard with stats
│   │   ├── SchoolDocuments.jsx # Document management
│   │   └── StudyTracker.jsx  # Main app component
│   ├── hooks/                # Custom React hooks
│   │   ├── index.js
│   │   ├── useDataLoader.js
│   │   ├── useProfiles.js
│   │   └── useReminders.js
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   ├── utils/
│   │   ├── badgeIcons.js     # Badge icon registry
│   │   └── helpers.js        # Utility functions
│   ├── image/
│   │   └── badges/           # Badge images
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # This file
│   ├── features/             # Feature specifications
│   └── technical/            # Technical specifications
├── database/                 # SQL files (ALL SQL goes here)
│   ├── README.md             # Setup instructions
│   ├── schema/               # Core table definitions
│   └── migrations/           # Schema updates & additions
├── build/                    # Production build
```

---

## Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   User UI   │ ──── │  React App   │ ──── │  Supabase   │
│ (Browser)   │      │ (Frontend)   │      │ (Backend)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  Custom     │
                     │  Hooks      │
                     │ (useProfiles│
                     │ useReminders│
                     │ useDataLoader)
                     └─────────────┘
```

---

## Authentication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Auth.jsx   │ ──── │ Supabase     │ ──── │ PostgreSQL  │
│  (Login/    │      │ Auth         │      │ (users)     │
│   Signup)   │      │              │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
       │                                          │
       └──────────── Session Token ───────────────┘
                            │
                     ┌──────┴──────┐
                     │ Row Level   │
                     │ Security    │
                     │ (user_id    │
                     │ isolation)  │
                     └─────────────┘
```

---

## Key Design Decisions

### 1. Mobile-First Responsive Design
All UI components are designed mobile-first with Tailwind CSS breakpoints. Navigation uses horizontal scrolling on mobile, views stack vertically, and touch targets meet accessibility standards. See [UI_RESPONSIVENESS.md](technical/UI_RESPONSIVENESS.md).

### 2. Profile-Based Data Isolation
Each child has their own profile, and all data (tasks, subjects, exams) is scoped to that profile.

### 3. Two-Mode Chapter Tracking
Users can choose between "Smart" (automatic) and "Comprehensive" (manual) tracking modes per profile.

### 4. Gamification
Points and badges encourage study habits without being punitive.

### 5. Task Rollover
Incomplete tasks automatically move to the current day, ensuring nothing is forgotten.

### 6. Custom Hooks
Business logic is extracted into reusable hooks (`useProfiles`, `useReminders`, `useDataLoader`).

---

## Environment Variables

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

---

## Related Files

- [README.md](../README.md) - Quick start guide
- [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md) - Detailed setup instructions
- [technical/DEPLOYMENT.md](technical/DEPLOYMENT.md) - Deployment guide
