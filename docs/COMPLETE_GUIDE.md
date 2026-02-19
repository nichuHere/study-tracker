# Kannama Study Tracker - Complete Guide

**A comprehensive family study tracking application with authentication and cloud storage**

---

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Initial Setup](#initial-setup)
- [Authentication Setup](#authentication-setup)
- [School Documents Setup](#school-documents-setup)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- **Multi-Profile Support**: Track multiple children's study activities
- **Subject & Chapter Management**: Organize subjects with chapters
- **Task Planning**: Create and track daily study tasks
- **Exam Preparation**: Plan exams with subjects, dates, and key points
- **Reminders**: One-time and recurring reminders (e.g., tuition schedules)
- **Study Analytics**: Track progress, completion rates, and study time
- **Kids Activities**: Share activity ideas across all children

### Authentication Features
- **User Sign Up/Login**: Secure email & password authentication
- **Remember Me**: Optional persistent sessions
- **Password Reset**: Email-based password recovery
- **User Isolation**: Each user sees only their own data
- **Profile Picture**: Boy logo for branding

### School Documents
- **Timetable Display**: Pin and display class timetable (always visible)
- **Document Upload**: Store PDFs and images (circulars, schedules, etc.)
- **Preview & View**: Images preview inline, PDFs open in new tab
- **Secure Storage**: Organized by profile with proper access control

### UI/UX Features
- **Personalized Headers**: Shows "[Child's Name]'s Study Tracker"
- **Date Display**: Highlighted current date (e.g., "Tuesday, February 4, 2026")
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Gradients**: Modern purple/indigo color scheme
- **Daily Suggestions**: AI-powered study recommendations

---

## 🛠 Technology Stack

- **Frontend**: React 18.2
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for school documents)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting**: Vercel (recommended)
- **Cost**: 100% FREE (Supabase + Vercel free tiers)

---

## 🚀 Initial Setup

### Prerequisites
- Node.js 20.x installed
- GitHub account (for Supabase login)
- Code editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- React & React DOM
- Supabase JS client
- Lucide React (icons)
- Tailwind CSS
- All required dependencies

### Step 2: Create Supabase Project

1. **Go to**: https://supabase.com
2. **Sign up** with GitHub or email
3. **Create New Project**:
   - Name: `kannama-study-tracker`
   - Database Password: Choose a strong password (save it!)
   - Region: Select nearest to you
   - Plan: Free tier
4. **Wait 2-3 minutes** for provisioning

### Step 3: Get Supabase Credentials

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 4: Configure Environment Variables

1. Create `.env.local` file in project root:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace with your actual credentials
3. **NEVER commit this file to git** (already in `.gitignore`)

### Step 5: Run Base Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open `supabase-schema.sql` from project
4. Copy and paste the entire content
5. Click **Run** (bottom right)

This creates:
- `profiles` table (child profiles)
- `subjects` table (subject & chapters)
- `tasks` table (daily tasks)
- `exams` table (exam planning)
- `reminders` table (one-time reminders)
- `recurring_reminders` table (repeating reminders)
- `shared_activities` table (family activities)
- `standard_activities` table (default activity templates)

### Step 6: Start Development Server

```bash
npm start
```

App opens at: http://localhost:3000

---

## 🔐 Authentication Setup

### Step 1: Enable Email Authentication

1. Supabase Dashboard → **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Optional: Disable "Confirm email" for easier testing
4. Optional: Enable "Enable email signups" if disabled

### Step 2: Run Authentication Migration

1. In Supabase Dashboard → **SQL Editor**
2. Open `supabase-auth-migration.sql` from project
3. Copy all SQL code
4. Paste into SQL Editor
5. Click **Run**

This migration:
- Adds `user_id` column to profiles table
- Creates Row Level Security (RLS) policies
- Ensures users can only see their own data
- Sets up automatic user_id assignment

### Step 3: Handle Existing Data (if any)

If you have test profiles already created:

**Option A: Delete test data**
```sql
DELETE FROM profiles WHERE user_id IS NULL;
```

**Option B: Assign to your account**
```sql
-- First, get your user ID
SELECT id, email FROM auth.users;

-- Then update profiles (replace YOUR_USER_ID)
UPDATE profiles SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
```

### Step 4: Test Authentication

1. Go to http://localhost:3000
2. Click **Sign Up**
3. Enter:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
4. Create account
5. Check email for verification (if enabled)
6. Log in with credentials

### Authentication Features

✅ **Sign Up**: Create new accounts  
✅ **Log In**: Secure email/password login  
✅ **Remember Me**: Stay logged in across sessions  
✅ **Forgot Password**: Reset via email link  
✅ **Log Out**: Clear session and return to login  
✅ **User Isolation**: Each user sees only their data  

---

## 📚 School Documents Setup

### Step 1: Run Database Schema

1. Supabase Dashboard → **SQL Editor**
2. Open `supabase-school-docs-schema.sql`
3. Copy all SQL
4. Paste and **Run**

Creates `school_documents` table with RLS policies.

### Step 2: Create Storage Bucket

1. Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Settings:
   - Name: `school-documents` (exact name)
   - **Public bucket**: ✅ Check this
   - File size limit: 50MB (default is fine)
4. Click **Create**

### Step 3: Set Storage Policies

1. Go to **SQL Editor** (not Storage Policies UI)
2. Run this SQL:

```sql
-- Allow authenticated users to manage files
CREATE POLICY "Allow authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'school-documents')
WITH CHECK (bucket_id = 'school-documents');
```

### How to Use School Documents

#### Upload Timetable:
1. Click **Docs** tab
2. Click **Upload School Document**
3. Select "Timetable (Fixed on page)"
4. Choose image (PNG/JPG) or PDF
5. Upload

Timetable displays permanently on Docs page.

#### Upload Other Documents:
1. Click **Upload School Document**
2. Select "Other Document"
3. Add description (e.g., "Science Lab Rules")
4. Choose file
5. Upload

#### View Documents:
- Click **View Documents (X)** button
- Browse list
- Click eye icon to preview
- PDFs open in new tab

**Supported Formats**: PNG, JPG, JPEG, PDF  
**Max File Size**: 5MB per file  
**Storage Limit**: 1GB (Supabase free tier)

---

## 🗄 Database Schema

### Tables Overview

1. **profiles**: Child profiles (linked to user accounts)
2. **subjects**: Subjects with chapters
3. **tasks**: Daily study tasks
4. **exams**: Exam planning
5. **reminders**: One-time reminders
6. **recurring_reminders**: Repeating reminders
7. **shared_activities**: Family activity ideas
8. **standard_activities**: Default activity templates
9. **school_documents**: Uploaded files metadata

### Row Level Security (RLS)

All tables have RLS enabled to ensure:
- Users can only access their own profiles
- Profile-related data is accessible only to the profile owner
- Shared activities are accessible to all authenticated users
- School documents are isolated per user/profile

### User Data Flow

```
User Sign Up/Login
  ↓
auth.users (Supabase managed)
  ↓
profiles.user_id (your data)
  ↓
All child profiles linked to user
  ↓
Tasks, exams, subjects linked to profiles
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click **Import Project**
   - Select your GitHub repository
   - Click **Import**

3. **Add Environment Variables**:
   - In Vercel project settings → **Environment Variables**
   - Add:
     ```
     REACT_APP_SUPABASE_URL=your-project-url
     REACT_APP_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Deploy**:
   - Vercel auto-deploys on every git push
   - First deployment takes 2-3 minutes
   - Get live URL: `https://your-app.vercel.app`

### Build for Production

```bash
npm run build
```

Creates optimized build in `build/` folder.

---

## 🔧 Troubleshooting

### Authentication Issues

**"Missing Supabase environment variables"**
- Check `.env.local` exists
- Verify variable names start with `REACT_APP_`
- Restart dev server: `npm start`

**"New user not allowed to sign up"**
- Supabase Dashboard → Authentication → Settings
- Enable "Enable email signups"

**"User can see other users' data"**
- Run `supabase-auth-migration.sql` again
- Verify RLS policies are enabled
- Check profiles have `user_id` set

### School Documents Issues

**"Failed to upload file: storage/bucket-not-found"**
- Create bucket named exactly: `school-documents`
- Verify bucket exists in Storage

**"Failed to upload file: new row violates row-level security policy"**
- Run `supabase-school-docs-schema.sql` again
- Ensure you're logged in
- Check RLS policies

**"File won't display"**
- Verify bucket is **Public**
- Check file uploaded in Supabase Storage
- Try refreshing page

### Database Issues

**"Error loading profiles"**
- Check Supabase project is running
- Verify environment variables are correct
- Check browser console for errors

**"Data not syncing"**
- Check internet connection
- Verify Supabase API is accessible
- Check browser console for API errors

### Build Issues

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**
```bash
# Kill process on port 3000
npx kill-port 3000
npm start
```

---

## 💰 Cost Breakdown

### Supabase Free Tier (Current Usage)
- ✅ 50,000 monthly active users
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ Unlimited API requests
- ✅ Email authentication
- ✅ Row Level Security
- **Cost**: $0/month

### Vercel Free Tier
- ✅ Unlimited sites
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Auto-deployments from Git
- **Cost**: $0/month

### Total Monthly Cost: $0.00 🎉

---

## 📖 User Guide

### Getting Started

1. **Sign Up**: Create your account
2. **Add Profiles**: Add your children's profiles
3. **Set Up Subjects**: Add subjects and chapters
4. **Create Tasks**: Plan daily study tasks
5. **Upload Timetable**: Add school timetable in Docs
6. **Set Reminders**: Add tuition/class reminders

### Daily Workflow

1. **Check Dashboard**: View today's tasks and suggestions
2. **Complete Tasks**: Mark tasks as done
3. **Add New Tasks**: Plan for tomorrow
4. **Review Analytics**: Check progress and study time
5. **Update Reminders**: Manage upcoming events

### Family Features

- **Switch Profiles**: Click profile dropdown to switch children
- **Shared Activities**: Browse ideas for all kids
- **School Documents**: Access timetables and circulars
- **Progress Tracking**: Monitor each child's study habits

---

## 🎯 Key Features Explained

### Daily View
- Today's tasks
- Study time tracking (0-180 mins goal)
- Smart suggestions based on upcoming exams
- Quick task completion

### Analytics View
- Subject-wise breakdown
- Completion rates
- Study time distribution
- Last 14 days activity chart
- Most/least active subjects

### Subjects View
- Manage subjects and chapters
- Edit chapter lists
- Delete subjects
- Organized by profile

### Exams View
- Create exam groups (e.g., "Mid-term Exams")
- Add multiple subjects per exam
- Track dates and chapters
- Key points notes

### Docs View
- Pinned timetable (always visible)
- Upload other school documents
- Preview images inline
- Open PDFs in new tab

---

## 🔄 Updates & Maintenance

### Updating the App

```bash
git pull origin main
npm install
npm start
```

### Database Migrations

When adding new features:
1. Create SQL migration file
2. Run in Supabase SQL Editor
3. Test thoroughly
4. Document in this guide

### Backup Data

Supabase provides automatic backups on Pro plan. For free tier:
1. Supabase Dashboard → Database → Backups
2. Manually export data periodically
3. Keep SQL schema files in version control

---

## 📞 Support

### Documentation Files
- `COMPLETE_GUIDE.md` (this file) - Everything you need
- `supabase-schema.sql` - Main database schema
- `supabase-auth-migration.sql` - Authentication setup
- `supabase-school-docs-schema.sql` - Documents feature

### Useful Links
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vercel Docs: https://vercel.com/docs

---

## ✅ Setup Checklist

### Initial Setup
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Base schema deployed
- [ ] App running locally

### Authentication
- [ ] Email provider enabled
- [ ] Auth migration run
- [ ] Test account created
- [ ] Sign up/login working
- [ ] User data isolated

### School Documents
- [ ] Documents table created
- [ ] Storage bucket created (`school-documents`)
- [ ] Storage policies set
- [ ] Test file uploaded
- [ ] Timetable displaying

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Production build successful
- [ ] Live URL accessible

---

## 🎉 You're All Set!

Your **Kannama Study Tracker** is now fully configured and ready to use!

Features you have:
✅ Multi-child study tracking  
✅ Secure authentication  
✅ School document management  
✅ Progress analytics  
✅ Exam planning  
✅ Reminders & scheduling  
✅ Family activity sharing  
✅ Beautiful, responsive UI  
✅ 100% FREE hosting & database  

**Happy tracking! 📚✨**

---

*Last updated: February 4, 2026*
