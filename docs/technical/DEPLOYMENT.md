# Deployment Guide - Vercel + Supabase

## Environment Variables Setup

### 1. Vercel Environment Variables
Add these in your Vercel Dashboard → Project Settings → Environment Variables:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Optional (for explicit redirect control):
```
REACT_APP_REDIRECT_URL=https://your-app.vercel.app
```

### 2. Supabase Configuration

**CRITICAL:** Configure these in Supabase Dashboard → Authentication → URL Configuration:

#### Site URL:
```
https://your-app-name.vercel.app
```

#### Redirect URLs (Add all of these):
```
https://your-app-name.vercel.app/**
http://localhost:3000/**
```

If using a custom domain:
```
https://your-custom-domain.com/**
```

### 3. Common Issues & Fixes

#### Issue: Redirects to localhost after authentication
**Solution:** 
- Make sure your production URL is added to Supabase Redirect URLs
- Verify Site URL is set to your production domain (not localhost)
- Redeploy your Vercel app after adding environment variables

#### Issue: Authentication doesn't work
**Solution:**
- Double-check environment variables are set in Vercel
- Ensure REACT_APP_ prefix is used (required for Create React App)
- Trigger a new deployment after changing env vars

### 4. Deployment Checklist

- [ ] Environment variables added in Vercel
- [ ] Supabase Site URL set to production domain
- [ ] Supabase Redirect URLs configured with production domain
- [ ] Redeployed after env var changes
- [ ] Tested authentication flow on production URL

### 5. Vercel Deployment

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or use Git integration:
- Push to your main branch
- Vercel will auto-deploy
