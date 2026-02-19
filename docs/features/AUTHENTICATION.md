# Authentication

## Overview

Secure user authentication system enabling account creation, login, password recovery, and session management. Each user's data is isolated through Row Level Security (RLS).

---

## Requirements

### Functional Requirements
- Users can sign up with email and password
- Users can log in with existing credentials
- Users can reset their password via email
- Users can choose to "Remember Me" for persistent sessions
- Users can log out from any session

### Non-Functional Requirements
- Passwords must be at least 6 characters
- Sessions are managed by Supabase Auth
- Data isolation enforced at database level

---

## Data Model

### User (Supabase Auth)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| email | string | User's email address |
| encrypted_password | string | Hashed password (managed by Supabase) |
| user_metadata.full_name | string | User's display name |
| created_at | timestamp | Account creation time |

### Profile-User Relationship
```sql
profiles.user_id → auth.users.id
```

---

## Business Rules

1. **Email Uniqueness**: Each email can only be registered once
2. **Password Requirements**: Minimum 6 characters
3. **Password Confirmation**: Sign-up requires matching password fields
4. **Remember Me**: 
   - When enabled: Session persists across browser restarts
   - When disabled: Session cleared on browser close
5. **Data Isolation**: Users can only see their own profiles and data

---

## User Interface

### Sign In Screen
- Email input field
- Password input field
- "Remember Me" checkbox (default: checked)
- "Login" button
- "Forgot Password?" link
- "Create Account" link

### Sign Up Screen
- Full Name input field
- Email input field
- Password input field
- Confirm Password input field
- "Sign Up" button
- "Back to Login" link

### Password Reset
- Email input field
- "Send Reset Email" button
- Success/error message display

---

## API Integration

### Sign Up
```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName }
  }
});
```

### Sign In
```javascript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### Password Reset
```javascript
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

### Sign Out
```javascript
await supabase.auth.signOut();
```

---

## Session Management

```javascript
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
});
```

### Events
- `SIGNED_IN` - User logged in
- `SIGNED_OUT` - User logged out
- `TOKEN_REFRESHED` - Session token refreshed

---

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that filter by `user_id`:

```sql
CREATE POLICY "Users can only see own profiles"
ON profiles FOR ALL
USING (user_id = auth.uid());
```

### Tables with RLS
- profiles
- subjects
- tasks
- exams
- reminders
- recurring_reminders
- school_documents

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| Auth | `src/components/Auth.jsx` | Login/signup forms |
| AuthPage | `src/components/AuthPage.jsx` | Page wrapper |

---

## Related Specs

- [PROFILES.md](PROFILES.md) - User profiles linked to auth
- [DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md) - RLS policies
