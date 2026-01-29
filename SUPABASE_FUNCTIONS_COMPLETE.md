# Complete Supabase Functions - Copy & Paste Ready

## 🎯 How to Use This File

1. Open `StudyTracker-base.jsx` in VSCode
2. Find each function below by name (Ctrl+F to search)
3. Replace the entire function with the Supabase version provided here
4. Save and test!

---

## 📦 Required Changes at Top of File

### 1. Add Supabase Import (after lucide-react import)
```javascript
import { supabase } from '../lib/supabase';
```

### 2. Add Loading State (after newProfileClass state)
```javascript
const [loading, setLoading] = useState(true);
```

### 3. Add Loading Screen (at start of return statement, before any other JSX)
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

---

## 🔄 COMPLETE SUPABASE FUNCTIONS

Copy and paste these complete function replacements:

```javascript
// ===================
// PROFILE FUNCTIONS
// ===================

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

const addProfile = async () => {
  if (newProfileName.trim()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ name: newProfileName.trim(), class: newProfileClass.trim() }])
        .select();
      
      if (error) throw error;
      
      setProfiles([...profiles, data[0]]);
      setActiveProfile(data[0]);
      setNewProfileName('');
      setNewProfileClass('');
      setShowAddProfile(false);
    } catch (error) {
      console.error('Error adding profile:', error);
      alert('Failed to add profile. Please try again.');
    }
  }
};

const deleteProfile = async (profileId) => {
  if (window.confirm('Are you sure you want to delete this profile? All data will be lost.')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
      
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      
      if (updatedProfiles.length > 0) {
        setActiveProfile(updatedProfiles[0]);
      } else {
        setActiveProfile(null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile. Please try again.');
    }
  }
};

// ===================
// DATA LOADING
// ===================

const loadSharedActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('shared_activities')
      .select('*')
      .order('created_at', { ascending: false});
    
    if (error) throw error;
    setSharedActivities(data || []);
  } catch (error) {
    console.error('Error loading shared activities:', error);
  }
};

const loadProfileData = async (profileId) => {
  try {
    // Load subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });
    
    if (subjectsError) throw subjectsError;
    setSubjects(subjectsData || []);

    // Load tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false });
    
    if (tasksError) throw tasksError;
    setTasks(tasksData || []);

    // Load exams
    const { data: examsData, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: true });
    
    if (examsError) throw examsError;
    setExams(examsData || []);

    // Load reminders
    const { data: remindersData, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: true });
    
    if (remindersError) throw remindersError;
    setReminders(remindersData || []);

    // Load standard activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('standard_activities')
      .select('*')
      .eq('profile_id', profileId);
    
    if (activitiesError) throw activitiesError;
    
    if (activitiesData && activitiesData.length > 0) {
      setStandardActivities(activitiesData.map(a => a.activity));
    } else {
      setStandardActivities([
        'Read chapter',
        'Practice problems',
        'Review notes',
        'Watch video',
        'Take quiz'
      ]);
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
};

// ===================
// SHARED ACTIVITIES
// ===================

const addSharedActivity = async () => {
  if (newSharedActivity.title.trim()) {
    try {
      const { data, error } = await supabase
        .from('shared_activities')
        .insert([newSharedActivity])
        .select();
      
      if (error) throw error;
      
      setSharedActivities([data[0], ...sharedActivities]);
      setNewSharedActivity({ title: '', description: '', category: 'indoor' });
    } catch (error) {
      console.error('Error adding shared activity:', error);
      alert('Failed to add activity.');
    }
  }
};

const deleteSharedActivity = async (id) => {
  try {
    const { error } = await supabase
      .from('shared_activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setSharedActivities(sharedActivities.filter(a => a.id !== id));
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

// ===================
// STANDARD ACTIVITIES
// ===================

const addStandardActivity = async () => {
  if (newActivityName.trim() && !standardActivities.includes(newActivityName.trim())) {
    const newActivity = newActivityName.trim();
    
    try {
      const { error } = await supabase
        .from('standard_activities')
        .insert([{ profile_id: activeProfile.id, activity: newActivity }]);
      
      if (error) throw error;
      
      setStandardActivities([...standardActivities, newActivity]);
      setNewActivityName('');
    } catch (error) {
      console.error('Error adding standard activity:', error);
    }
  }
};

const updateStandardActivity = async (oldName, newName) => {
  if (newName.trim() && newName !== oldName) {
    try {
      await supabase
        .from('standard_activities')
        .delete()
        .eq('profile_id', activeProfile.id)
        .eq('activity', oldName);
      
      await supabase
        .from('standard_activities')
        .insert([{ profile_id: activeProfile.id, activity: newName.trim() }]);
      
      setStandardActivities(standardActivities.map(act => act === oldName ? newName.trim() : act));
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }
};

const deleteStandardActivity = async (activityName) => {
  try {
    await supabase
      .from('standard_activities')
      .delete()
      .eq('profile_id', activeProfile.id)
      .eq('activity', activityName);
    
    setStandardActivities(standardActivities.filter(act => act !== activityName));
  } catch (error) {
    console.error('Error deleting activity:', error);
  }
};

// ===================
// SUBJECTS
// ===================

const addSubject = async () => {
  if (newSubject.name.trim()) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          profile_id: activeProfile.id,
          name: newSubject.name.trim(),
          chapters: newSubject.chapters || []
        }])
        .select();
      
      if (error) throw error;
      
      setSubjects([...subjects, data[0]]);
      setNewSubject({ name: '', chapters: [] });
      setNewChapterName('');
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject.');
    }
  }
};

const deleteSubject = async (id) => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setSubjects(subjects.filter(s => s.id !== id));
  } catch (error) {
    console.error('Error deleting subject:', error);
  }
};

const addChapterToSubject = async (subjectId, chapterName) => {
  if (!chapterName || !chapterName.trim()) return;
  
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return;
  
  const updatedChapters = [...(subject.chapters || []), chapterName.trim()];
  
  try {
    const { error } = await supabase
      .from('subjects')
      .update({ chapters: updatedChapters })
      .eq('id', subjectId);
    
    if (error) throw error;
    
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, chapters: updatedChapters } : s
    ));
  } catch (error) {
    console.error('Error adding chapter:', error);
  }
};

// ===================
// TASKS
// ===================

const addTask = async () => {
  if (newTask.subject) {
    try {
      const taskToAdd = {
        profile_id: activeProfile.id,
        subject: newTask.subject,
        chapter: newTask.chapter || null,
        activity: newTask.activity.trim() || 'General study',
        duration: newTask.duration,
        date: newTask.date,
        completed: false,
        instructions: newTask.instructions || null
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToAdd])
        .select();
      
      if (error) throw error;
      
      setTasks([data[0], ...tasks]);
      setNewTask({ 
        subject: '', 
        chapter: '', 
        activity: '', 
        duration: 30, 
        date: new Date().toISOString().split('T')[0],
        completed: false,
        instructions: ''
      });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task.');
    }
  }
};

const toggleTaskComplete = async (id) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id);
    
    if (error) throw error;
    
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

const deleteTask = async (id) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setTasks(tasks.filter(t => t.id !== id));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// ===================
// EXAMS
// ===================

const addExam = async () => {
  if (newExam.subject && newExam.date) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([{
          profile_id: activeProfile.id,
          subject: newExam.subject,
          date: newExam.date,
          chapters: newExam.chapters || [],
          key_points: newExam.keyPoints || null
        }])
        .select();
      
      if (error) throw error;
      
      setExams([...exams, data[0]]);
      setNewExam({ subject: '', date: '', chapters: [], keyPoints: '' });
      setExamChapterInput('');
      setShowAddExam(false);
    } catch (error) {
      console.error('Error adding exam:', error);
      alert('Failed to add exam.');
    }
  }
};

const deleteExam = async (id) => {
  try {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setExams(exams.filter(e => e.id !== id));
  } catch (error) {
    console.error('Error deleting exam:', error);
  }
};

const updateExam = async (examId, field, value) => {
  try {
    const { error } = await supabase
      .from('exams')
      .update({ [field]: value })
      .eq('id', examId);
    
    if (error) throw error;
    
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, [field]: value } : exam
    ));
    setEditingExam(null);
  } catch (error) {
    console.error('Error updating exam:', error);
  }
};

const addChapterToExam = async (examId, chapterName) => {
  if (!chapterName.trim()) return;
  
  const exam = exams.find(e => e.id === examId);
  if (!exam) return;
  
  const updatedChapters = [
    ...(exam.chapters || []),
    { name: chapterName.trim(), status: 'pending' }
  ];
  
  try {
    const { error } = await supabase
      .from('exams')
      .update({ chapters: updatedChapters })
      .eq('id', examId);
    
    if (error) throw error;
    
    setExams(exams.map(e => 
      e.id === examId ? { ...e, chapters: updatedChapters } : e
    ));
    setExamChapterInput('');
  } catch (error) {
    console.error('Error adding chapter to exam:', error);
  }
};

const updateChapterStatus = async (examId, chapterIndex, newStatus) => {
  const exam = exams.find(e => e.id === examId);
  if (!exam) return;
  
  const updatedChapters = [...exam.chapters];
  updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], status: newStatus };
  
  try {
    const { error } = await supabase
      .from('exams')
      .update({ chapters: updatedChapters })
      .eq('id', examId);
    
    if (error) throw error;
    
    setExams(exams.map(e => 
      e.id === examId ? { ...e, chapters: updatedChapters } : e
    ));
  } catch (error) {
    console.error('Error updating chapter status:', error);
  }
};

const deleteChapterFromExam = async (examId, chapterIndex) => {
  const exam = exams.find(e => e.id === examId);
  if (!exam) return;
  
  const updatedChapters = exam.chapters.filter((_, i) => i !== chapterIndex);
  
  try {
    const { error } = await supabase
      .from('exams')
      .update({ chapters: updatedChapters })
      .eq('id', examId);
    
    if (error) throw error;
    
    setExams(exams.map(e => 
      e.id === examId ? { ...e, chapters: updatedChapters } : e
    ));
  } catch (error) {
    console.error('Error deleting chapter from exam:', error);
  }
};

// ===================
// REMINDERS
// ===================

const addReminder = async () => {
  if (newReminder.title && newReminder.date) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          profile_id: activeProfile.id,
          title: newReminder.title,
          date: newReminder.date,
          description: newReminder.description || null
        }])
        .select();
      
      if (error) throw error;
      
      setReminders([...reminders, data[0]]);
      setNewReminder({ title: '', date: '', description: '' });
      setShowAddReminder(false);
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder.');
    }
  }
};

const deleteReminder = async (id) => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    setReminders(reminders.filter(r => r.id !== id));
  } catch (error) {
    console.error('Error deleting reminder:', error);
  }
};
```

---

## ✅ Verification Checklist

After making all changes:

- [ ] Supabase import added at top
- [ ] Loading state added
- [ ] Loading screen added in return statement
- [ ] All functions above replaced
- [ ] No `window.storage` calls remain
- [ ] No `JSON.parse()` or `JSON.stringify()` for database operations
- [ ] File saves without errors

---

## 🚀 Testing

1. Run `npm start`
2. Create a profile
3. Check Supabase Table Editor - you should see the profile!
4. Add subjects, tasks, exams
5. Refresh browser - data persists!

---

## Need Help?

The UI/JSX parts remain the same - only the data functions change!
All helper functions (getDaysUntil, formatDateWithDay, getExamProgress, etc.) stay exactly as they were.
