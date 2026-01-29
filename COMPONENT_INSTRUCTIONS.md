# StudyTracker Component - Supabase Integration

## 📝 Creating the Component

The `StudyTracker.jsx` component is the main app component. It's too large to include as a single file, so follow these steps:

### Method 1: Use the Conversion Tool (Recommended)

I've prepared a tool that will help you convert the component. Since you already have the working `study-tracker.jsx` file, you just need to update the storage calls.

### Method 2: Manual Conversion

Here's what needs to be changed in your existing component:

#### Step 1: Add Supabase Import
At the top of your component file, after the React and icon imports:

```javascript
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, ... } from 'lucide-react';
import { supabase } from '../lib/supabase';  // ADD THIS LINE
```

#### Step 2: Add Loading State
Add this to your state variables:

```javascript
const [loading, setLoading] = useState(true);
```

#### Step 3: Convert Storage Functions

Replace ALL instances of `window.storage` with Supabase calls:

**PROFILES:**

OLD:
```javascript
const loadProfiles = async () => {
  const profilesData = await window.storage.get('profiles');
  if (profilesData?.value) {
    const loaded = JSON.parse(profilesData.value);
    setProfiles(loaded);
  }
};
```

NEW:
```javascript
const loadProfiles = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    setProfiles(data || []);
    if (data && data.length > 0) {
      setActiveProfile(data[0]);
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
  } finally {
    setLoading(false);
  }
};
```

**ADD PROFILE:**

OLD:
```javascript
const addProfile = async () => {
  const newProfile = {
    id: Date.now(),
    name: newProfileName.trim(),
    class: newProfileClass.trim()
  };
  const updated = [...profiles, newProfile];
  setProfiles(updated);
  await window.storage.set('profiles', JSON.stringify(updated));
};
```

NEW:
```javascript
const addProfile = async () => {
  if (newProfileName.trim()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          name: newProfileName.trim(),
          class: newProfileClass.trim()
        }])
        .select();
      
      if (error) throw error;
      setProfiles([...profiles, data[0]]);
      setActiveProfile(data[0]);
      setNewProfileName('');
      setNewProfileClass('');
      setShowAddProfile(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add profile');
    }
  }
};
```

**DELETE PROFILE:**

OLD:
```javascript
const deleteProfile = async (profileId) => {
  const updated = profiles.filter(p => p.id !== profileId);
  setProfiles(updated);
  await window.storage.set('profiles', JSON.stringify(updated));
};
```

NEW:
```javascript
const deleteProfile = async (profileId) => {
  if (window.confirm('Delete this profile?')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
      const updated = profiles.filter(p => p.id !== profileId);
      setProfiles(updated);
      if (updated.length > 0) {
        setActiveProfile(updated[0]);
      } else {
        setActiveProfile(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
};
```

### Step 4: Apply Same Pattern to All Data Operations

Apply the same conversion pattern to:
- ✅ loadProfileData() - Load subjects, tasks, exams, reminders
- ✅ addSubject() / deleteSubject()
- ✅ addTask() / toggleTaskComplete() / deleteTask()
- ✅ addExam() / updateExam() / deleteExam()
- ✅ addChapterToExam() / updateChapterStatus()
- ✅ addReminder() / deleteReminder()
- ✅ Shared activities operations
- ✅ Standard activities operations

### Conversion Pattern Reference:

**SELECT (Load Data):**
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('profile_id', profileId);  // Add filters as needed
```

**INSERT (Add Data):**
```javascript
const { data, error } = await supabase
  .from('table_name')
  .insert([{ field1: value1, field2: value2 }])
  .select();  // Returns inserted data
```

**UPDATE (Modify Data):**
```javascript
const { error } = await supabase
  .from('table_name')
  .update({ field: newValue })
  .eq('id', itemId);
```

**DELETE (Remove Data):**
```javascript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', itemId);
```

### Step 5: Add Loading Screen

At the start of your component's return statement:

```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Study Tracker...</p>
      </div>
    </div>
  );
}
```

### Step 6: Remove localStorage Backup Function

The `exportAllData` and `importAllData` functions can stay mostly the same, but they now export from the actual database data (profiles, tasks, etc. arrays) rather than from localStorage.

## ✅ Quick Checklist

After converting, verify:
- [ ] Supabase import added
- [ ] All `window.storage.get()` replaced with `supabase.from().select()`
- [ ] All `window.storage.set()` replaced with `supabase.from().insert()` or `.update()`
- [ ] All `window.storage.delete()` replaced with `supabase.from().delete()`
- [ ] Loading state added and used
- [ ] Error handling with try-catch blocks
- [ ] No more JSON.parse() or JSON.stringify() (Supabase handles it)
- [ ] profile_id used consistently in all operations

## 🚀 Testing

After conversion:
1. Run `npm start`
2. Create a profile
3. Check Supabase Table Editor - profile should appear
4. Add a subject - check database
5. Add a task - check database
6. Refresh browser - data should persist!

## Need the Full Converted Component?

If you prefer, I can generate the complete converted component for you. Just let me know and I'll create the full `StudyTracker.jsx` file with all Supabase integrations complete.

The component is approximately 2,400 lines with all the UI and database operations integrated.
