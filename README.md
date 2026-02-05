# Kannama Study Tracker

A comprehensive family study tracking application with authentication, cloud storage, and school document management.

## 📚 Complete Documentation

**For complete setup and usage instructions, please refer to:**

👉 **[COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)** 👈

This guide contains everything you need:
- ✅ Initial setup instructions
- ✅ Authentication configuration
- ✅ School documents feature
- ✅ Database schema details
- ✅ Deployment to Vercel
- ✅ Troubleshooting guide
- ✅ Cost breakdown (100% FREE!)

## ⚡ Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Supabase project** at https://supabase.com

3. **Configure environment:**
   Create `.env.local`:
   ```env
   REACT_APP_SUPABASE_URL=your-project-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run database schema:**
   - Copy `supabase-schema.sql` content
   - Paste in Supabase SQL Editor
   - Click Run

5. **Start app:**
   ```bash
   npm start
   ```

## 🎯 Key Features

- Multi-child profile management
- Subject & chapter organization
- Daily task planning
- Exam preparation tools
- Reminders (one-time & recurring)
- Study analytics & progress tracking
- School document storage (timetables, PDFs)
- Secure authentication
- Beautiful, responsive UI

## 📖 Important Files

- `COMPLETE_GUIDE.md` - **Read this first!** Complete setup & usage guide
- `supabase-schema.sql` - Main database schema
- `supabase-auth-migration.sql` - Authentication setup
- `supabase-school-docs-schema.sql` - School documents feature
- `.env.local` - Your environment variables (create this)

## 💰 Cost

**$0/month** - 100% FREE using Supabase and Vercel free tiers!

## 🚀 Tech Stack

- React 18.2
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS
- Lucide React Icons
- Vercel Hosting

---

**For detailed instructions, troubleshooting, and advanced features, see [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)**
6. Click "Run" button
7. You should see "Success. No rows returned"

✅ Your database is now set up with all tables!

#### 3d. Get API Credentials
1. Go to Settings (gear icon) → API
2. Find these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
3. Keep this page open, you'll need these values

### Step 4: Configure Environment Variables

1. In VSCode, find the file `.env.example`
2. Create a new file called `.env.local` (in the same root folder)
3. Copy this template:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

4. Replace:
   - `https://your-project.supabase.co` with your Project URL
   - `your_anon_key_here` with your anon public key

5. Save the file

⚠️ **IMPORTANT**: The file MUST be named `.env.local` exactly (with the dot at the start)

### Step 5: Run the App

In the terminal, run:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

✅ **You're done!** The app is now running with database!

---

## 🎯 Testing the Database Connection

1. Create a profile (e.g., "Sachu", "Grade 5")
2. Refresh the page - the profile should still be there
3. Go to Supabase → Table Editor → profiles
4. You should see your profile in the database!

---

## 🌐 Deploy to Vercel (Online Access)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Study Tracker"

# Create a new repository on GitHub (github.com)
# Then connect it:
git remote add origin https://github.com/nichuHere/study-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New..." → "Project"
4. Import your `study-tracker` repository
5. Configure:
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `build` (auto-filled)
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add `REACT_APP_SUPABASE_URL` = your URL
   - Add `REACT_APP_SUPABASE_ANON_KEY` = your key
7. Click "Deploy"
8. Wait 2-3 minutes

✅ Your app is now live at: `https://study-tracker-xxx.vercel.app`

---

## 📁 Project Structure

```
study-tracker-supabase/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── StudyTracker.jsx    # Main app component
│   ├── lib/
│   │   └── supabase.js          # Supabase client
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env.example                  # Environment template
├── .env.local                    # Your credentials (create this)
├── .gitignore
├── package.json
├── supabase-schema.sql          # Database setup
└── README.md                     # This file
```

---

## 🔧 Troubleshooting

### Problem: `npm install` fails
**Solution**: 
- Make sure you have Node.js installed (https://nodejs.org/)
- Check version: `node --version` (should be 16+)
- Try: `npm cache clean --force` then `npm install` again

### Problem: Blank page after `npm start`
**Solution**:
1. Open browser console (F12)
2. Look for errors
3. Common fixes:
   - Check `.env.local` file exists and has correct values
   - Make sure Supabase credentials are correct
   - Verify database schema was run successfully

### Problem: "Missing Supabase environment variables" error
**Solution**:
- File `.env.local` doesn't exist or has wrong name
- Create file `.env.local` in root folder
- Copy your credentials from Supabase
- Restart the dev server (`npm start`)

### Problem: Data not saving to database
**Solution**:
1. Go to Supabase → Table Editor
2. Check if tables exist (profiles, subjects, tasks, etc.)
3. If not, run the `supabase-schema.sql` again
4. Check browser console for errors

### Problem: Vercel deployment fails
**Solution**:
- Make sure environment variables are added in Vercel
- Check build logs for specific errors
- Ensure `.env.local` is in `.gitignore` (should not be pushed to GitHub)

---

## 💾 Backup Your Database

### Export Data (Recommended Weekly)

1. In the app, click profile menu
2. Click "📥 Backup & Restore"
3. Click "Download Backup File"
4. Save the JSON file to Google Drive/Dropbox

### Restore Data

1. Click "📥 Backup & Restore"
2. Click "Select Backup File"
3. Choose your saved JSON file
4. Data will be imported

---

## 🆘 Need Help?

### Check these resources:
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vercel Docs**: https://vercel.com/docs

### Common Issues:
1. ✅ Make sure Node.js is installed
2. ✅ Run `npm install` before `npm start`
3. ✅ Create `.env.local` with correct credentials
4. ✅ Run database schema in Supabase
5. ✅ Check browser console for errors

---

## ✨ Features

✅ Multi-profile support (track multiple kids)
✅ Subject and chapter management
✅ Daily task tracking with voice input
✅ Exam preparation with chapter status
✅ Progress analytics and charts
✅ School reminders
✅ Kids activities hub
✅ Smart daily suggestions
✅ Backup/restore functionality
✅ Calendar view for exams
✅ Real-time data sync across devices

---

## 📊 Free Tier Limits (Supabase)

Your usage will be well within free limits:
- ✅ 500 MB database (you'll use ~1-5 MB)
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- ✅ 50 GB file storage

**You won't pay anything!** 🎉

---

## 🎓 Next Steps

1. ✅ Set up the app locally (Steps 1-5)
2. ✅ Create profiles for your kids
3. ✅ Add subjects and chapters
4. ✅ Start tracking daily tasks
5. ✅ Deploy to Vercel for online access
6. ✅ Set up weekly data backups

**Enjoy tracking your kids' study progress!** 🚀

---

**Version**: 1.0.0
**Last Updated**: 2026-01-22
**Database**: Supabase PostgreSQL
**Hosting**: Vercel (Free)
**Total Cost**: $0/month
