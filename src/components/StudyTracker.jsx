import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, CheckCircle, Circle, Mic, X, Book, Target, TrendingUp, AlertCircle, LogOut, User, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SchoolDocuments from './SchoolDocuments';

const StudyTrackerApp = ({ session }) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileClass, setNewProfileClass] = useState('');
  const [_loading, _setLoading] = useState(true);
  
  // Profile settings
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [editingAccountName, setEditingAccountName] = useState(false);
  const [tempAccountName, setTempAccountName] = useState('');
  const [profileTab, setProfileTab] = useState('kids'); // 'account' or 'kids'
  const [editingProfile, setEditingProfile] = useState(null); // ID of profile being edited
  const [editProfileData, setEditProfileData] = useState({ name: '', class: '' });
  const [deletingProfileId, setDeletingProfileId] = useState(null);
  
  // Shared activities across all kids
  const [sharedActivities, setSharedActivities] = useState([]);
  const [showSharedActivities, setShowSharedActivities] = useState(false);
  const [newSharedActivity, setNewSharedActivity] = useState({ title: '', description: '', category: 'indoor' });
  
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [standardActivities, setStandardActivities] = useState([
    'Read chapter',
    'Practice problems',
    'Review notes',
    'Watch video',
    'Take quiz'
  ]);
  
  const [activeView, setActiveView] = useState('daily');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showActivitiesManager, setShowActivitiesManager] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const [newSubject, setNewSubject] = useState({ name: '', chapters: [] });
  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [newTask, setNewTask] = useState(() => ({ 
    subject: '', 
    chapter: '', 
    activity: '', 
    duration: 30, 
    date: (() => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return istTime.toISOString().split('T')[0];
    })(),
    completed: false,
    instructions: ''
  }));
  const [newExam, setNewExam] = useState({
    name: '', // e.g., "First Mid-term Exams"
    subjects: [], // Array of {subject: '', date: '', chapters: [], keyPoints: ''}
  });
  const [newExamSubject, setNewExamSubject] = useState({
    subject: '',
    date: '',
    chapters: [],
    keyPoints: ''
  });
  const [examChapterInput, setExamChapterInput] = useState('');
  const [_editingExamChapter, _setEditingExamChapter] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [minimizedExams, setMinimizedExams] = useState({});
  const [_showEditExam, _setShowEditExam] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [expandedReminders, setExpandedReminders] = useState({});
  const [editingReminder, setEditingReminder] = useState(null);
  const [editReminderData, setEditReminderData] = useState({ title: '', date: '', description: '' });
  const [newRecurringReminder, setNewRecurringReminder] = useState({
    title: '',
    description: '',
    time: '19:15',
    end_time: '20:00',
    days: [] // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  });
  const [reminderType, setReminderType] = useState('one-time'); // 'one-time' or 'recurring'
  const [editingRecurringReminder, setEditingRecurringReminder] = useState(null);
  const [recurringReminders, setRecurringReminders] = useState([]);
  const [notificationsMinimized, setNotificationsMinimized] = useState(false);
  const [todayNotificationsMinimized, setTodayNotificationsMinimized] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // Load account name from metadata or localStorage
  useEffect(() => {
    const loadAccountName = async () => {
      try {
        // Try to get from user metadata first
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.account_name) {
          setAccountName(user.user_metadata.account_name);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('accountName');
          if (saved) setAccountName(saved);
        }
      } catch (error) {
        console.error('Error loading account name:', error);
      }
    };
    loadAccountName();
  }, []);

  // Load data from storage on mount
  useEffect(() => {
    const init = async () => {
      _setLoading(true);
      await Promise.all([loadProfiles(), loadSharedActivities()]);
      
      // Load dismissed notifications from localStorage
      const dismissed = localStorage.getItem('dismissedNotifications');
      if (dismissed) {
        setDismissedNotifications(JSON.parse(dismissed));
      }
      
      _setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSharedActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_activities')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setSharedActivities(data);
      }
    } catch (error) {
      console.error('Error loading shared activities:', error);
    }
  };

  // Load profile data when active profile changes
  useEffect(() => {
    const load = async () => {
      if (activeProfile) {
        _setLoading(true);
        await loadProfileData(activeProfile.id);
        _setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user?.id) // Only load profiles for current user
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setProfiles(data);
        setActiveProfile(data[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  // Process task rollover - move incomplete tasks from previous days to today
  const processTaskRollover = async (tasks, _profileId) => {
    const today = getTodayDateIST();
    const incompletePastTasks = tasks.filter(task => 
      task.date < today && !task.completed
    );

    if (incompletePastTasks.length === 0) {
      return tasks;
    }

    // Update each incomplete past task
    const rolloverUpdates = incompletePastTasks.map(async (task) => {
      const carryoverDays = (task.carryover_days || 0) + 1;
      
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            date: today,
            carryover_days: carryoverDays 
          })
          .eq('id', task.id);
        
        if (error) throw error;
        
        return {
          ...task,
          date: today,
          carryover_days: carryoverDays
        };
      } catch (error) {
        console.error('Error rolling over task:', error);
        return task;
      }
    });

    const updatedTasks = await Promise.all(rolloverUpdates);
    
    // Merge updated tasks with original tasks
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    updatedTasks.forEach(ut => {
      taskMap.set(ut.id, ut);
    });
    
    return Array.from(taskMap.values());
  };

  const loadProfileData = async (profileId) => {
    try {
      // Load data from Supabase
      const [subjectsResult, tasksResult, examsResult, remindersResult, standardResult, recurringRemindersResult] = await Promise.all([
        supabase.from('subjects').select('*').eq('profile_id', profileId),
        supabase.from('tasks').select('*').eq('profile_id', profileId),
        supabase.from('exams').select('*').eq('profile_id', profileId),
        supabase.from('reminders').select('*').eq('profile_id', profileId),
        supabase.from('standard_activities').select('*').eq('profile_id', profileId),
        supabase.from('recurring_reminders').select('*').eq('profile_id', profileId)
      ]);

      setSubjects(subjectsResult.data || []);
      
      // Process task rollover for incomplete tasks from previous days
      const tasksData = tasksResult.data || [];
      const updatedTasks = await processTaskRollover(tasksData, profileId);
      setTasks(updatedTasks);
      
      const examsData = examsResult.data || [];
      console.log('📚 Loading exams from database:', examsData);
      setExams(examsData);
      // Initialize all exams as minimized
      const minimizedState = {};
      examsData.forEach(exam => {
        minimizedState[exam.id] = true;
      });
      setMinimizedExams(minimizedState);
      setReminders(remindersResult.data || []);
      setRecurringReminders(recurringRemindersResult.data || []);
      
      if (standardResult.data && standardResult.data.length > 0) {
        setStandardActivities(standardResult.data.map(item => item.activity));
      } else {
        setStandardActivities(['Read chapter', 'Practice problems', 'Review notes', 'Watch video', 'Take quiz']);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setSubjects([]);
      setTasks([]);
      setExams([]);
      setReminders([]);
      setStandardActivities(['Read chapter', 'Practice problems', 'Review notes', 'Watch video', 'Take quiz']);
    }
  };

  const saveData = async (key, data) => {
    if (!activeProfile) return;
    try {
      await window.storage.set(`${key}_${activeProfile.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Profile management
  const addProfile = async () => {
    if (newProfileName.trim()) {
      // Check if max limit reached
      if (profiles.length >= 5) {
        alert('Maximum of 5 children profiles allowed');
        return;
      }
      
      try {
        // Insert into Supabase - user_id will be automatically set by trigger
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              name: newProfileName.trim(),
              class: newProfileClass.trim(),
              user_id: session?.user?.id // Explicitly set user_id from session
            }
          ])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newProfile = data[0];
          setProfiles([...profiles, newProfile]);
          setActiveProfile(newProfile);
        }
        
        setNewProfileName('');
        setNewProfileClass('');
        setShowAddProfile(false);
      } catch (error) {
        console.error('Error adding profile:', error);
        alert('Failed to create profile: ' + error.message);
      }
    }
  };

  // Account name management
  const saveAccountName = async (name) => {
    try {
      // Save to user metadata
      const { error } = await supabase.auth.updateUser({
        data: { account_name: name }
      });
      
      if (error) throw error;
      
      // Also save to localStorage as backup
      localStorage.setItem('accountName', name);
      setAccountName(name);
      setEditingAccountName(false);
    } catch (error) {
      console.error('Error saving account name:', error);
      alert('Failed to save account name: ' + error.message);
    }
  };

  const updateProfile = async (profileId) => {
    if (editProfileData.name.trim()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: editProfileData.name.trim(),
            class: editProfileData.class.trim()
          })
          .eq('id', profileId);
        
        if (error) throw error;
        
        // Update local state
        const updatedProfiles = profiles.map(p => 
          p.id === profileId 
            ? { ...p, name: editProfileData.name.trim(), class: editProfileData.class.trim() }
            : p
        );
        setProfiles(updatedProfiles);
        
        // Update active profile if it's the one being edited
        if (activeProfile?.id === profileId) {
          setActiveProfile({ ...activeProfile, name: editProfileData.name.trim(), class: editProfileData.class.trim() });
        }
        
        setEditingProfile(null);
        setEditProfileData({ name: '', class: '' });
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile: ' + error.message);
      }
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      // Supabase will cascade delete related data due to ON DELETE CASCADE
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
      
      // Update profiles list
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      
      // Switch to first profile or null
      if (updatedProfiles.length > 0) {
        if (activeProfile?.id === profileId) {
          setActiveProfile(updatedProfiles[0]);
        }
      } else {
        setActiveProfile(null);
      }
      
      setDeletingProfileId(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile: ' + error.message);
    }
  };

  const switchProfile = (profile) => {
    _setLoading(true);
    setActiveProfile(profile);
    setActiveView('daily');
  };

  // Dismiss notification
  const dismissNotification = (id, type) => {
    const notificationId = `${type}-${id}`;
    const newDismissed = [...dismissedNotifications, notificationId];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  // Check if notification is dismissed
  const isNotificationDismissed = (id, type) => {
    const notificationId = `${type}-${id}`;
    return dismissedNotifications.includes(notificationId);
  };

  // Shared activities management
  const addSharedActivity = async () => {
    if (newSharedActivity.title.trim()) {
      try {
        const { data, error } = await supabase
          .from('shared_activities')
          .insert([{
            title: newSharedActivity.title.trim(),
            description: newSharedActivity.description.trim(),
            category: newSharedActivity.category
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSharedActivities([...sharedActivities, data[0]]);
        }
        
        setNewSharedActivity({ title: '', description: '', category: 'indoor' });
      } catch (error) {
        console.error('Error adding shared activity:', error);
        alert('Failed to add activity: ' + error.message);
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
      
      const updated = sharedActivities.filter(a => a.id !== id);
      setSharedActivities(updated);
    } catch (error) {
      console.error('Error deleting shared activity:', error);
    }
  };

  const _updateSharedActivity = async (id, field, value) => {
    try {
      const { error } = await supabase
        .from('shared_activities')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = sharedActivities.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      );
      setSharedActivities(updated);
    } catch (error) {
      console.error('Error updating shared activity:', error);
    }
  };



  // Standard activities management
  const addStandardActivity = async () => {
    if (newActivityName.trim() && !standardActivities.includes(newActivityName.trim())) {
      const updated = [...standardActivities, newActivityName.trim()];
      setStandardActivities(updated);
      await saveData('standardActivities', updated);
      setNewActivityName('');
    }
  };

  const updateStandardActivity = async (oldName, newName) => {
    if (newName.trim() && newName !== oldName) {
      const updated = standardActivities.map(act => act === oldName ? newName.trim() : act);
      setStandardActivities(updated);
      await saveData('standardActivities', updated);
      setEditingActivity(null);
    }
  };

  const deleteStandardActivity = async (activityName) => {
    const updated = standardActivities.filter(act => act !== activityName);
    setStandardActivities(updated);
    await saveData('standardActivities', updated);
  };

  // Voice input handler
  const startVoiceInput = (callback) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      callback(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Subject management
  const addSubject = async () => {
    if (newSubject.name.trim() && activeProfile) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .insert([
            {
              profile_id: activeProfile.id,
              name: newSubject.name.trim(),
              chapters: newSubject.chapters || []
            }
          ])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSubjects([...subjects, data[0]]);
        }
        
        setNewSubject({ name: '', chapters: [] });
        setShowAddSubject(false);
      } catch (error) {
        console.error('Error adding subject:', error);
        alert('Failed to add subject: ' + error.message);
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
      
      const updated = subjects.filter(s => s.id !== id);
      setSubjects(updated);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const addChapterToSubject = async (subjectId, chapterName) => {
    if (!chapterName || !chapterName.trim()) return;
    
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const updatedChapters = [...(subject.chapters || []), chapterName.trim()];
      
      const { error } = await supabase
        .from('subjects')
        .update({ chapters: updatedChapters })
        .eq('id', subjectId);
      
      if (error) throw error;
      
      const updated = subjects.map(s => 
        s.id === subjectId 
          ? { ...s, chapters: updatedChapters }
          : s
      );
      setSubjects(updated);
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  // Task management
  const addTask = async () => {
    if (newTask.subject && activeProfile) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            profile_id: activeProfile.id,
            subject: newTask.subject,
            chapter: newTask.chapter || null,
            activity: newTask.activity.trim() || 'General study',
            duration: newTask.duration,
            date: newTask.date,
            completed: newTask.completed,
            instructions: newTask.instructions || null,
            carryover_days: 0
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTasks([...tasks, data[0]]);
        }
        
        setNewTask({ 
          subject: '', 
          chapter: '', 
          activity: '', 
          duration: 30, 
          date: getTodayDateIST(),
          completed: false,
          instructions: ''
        });
        setShowAddTask(false);
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task: ' + error.message);
      }
    }
  };

  const toggleTaskComplete = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      setTasks(updated);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Exam management
  const addExam = async () => {
    if (newExam.name.trim() && newExam.subjects.length > 0 && activeProfile) {
      try {
        const { data, error } = await supabase
          .from('exams')
          .insert([{
            profile_id: activeProfile.id,
            name: newExam.name.trim(),
            subjects: newExam.subjects,
            date: newExam.subjects[0]?.date || getTodayDateIST()
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setExams([...exams, data[0]]);
          // Set new exam as minimized by default
          setMinimizedExams(prev => ({
            ...prev,
            [data[0].id]: true
          }));
        }
        
        setNewExam({ name: '', subjects: [] });
        setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
        setExamChapterInput('');
        setShowAddExam(false);
      } catch (error) {
        console.error('Error adding exam:', error);
        alert('Failed to add exam: ' + error.message);
      }
    }
  };

  const addSubjectToExam = () => {
    if (newExamSubject.subject.trim() && newExamSubject.date) {
      setNewExam({
        ...newExam,
        subjects: [...newExam.subjects, { ...newExamSubject }]
      });
      setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
    }
  };

  const removeSubjectFromExam = (index) => {
    const updatedSubjects = newExam.subjects.filter((_, i) => i !== index);
    setNewExam({ ...newExam, subjects: updatedSubjects });
  };

  const updateExam = async (examId, updates) => {
    try {
      console.log('📝 Updating exam:', examId, updates);
      const { error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', examId);
      
      if (error) throw error;
      
      const updated = exams.map(exam => 
        exam.id === examId ? { ...exam, ...updates } : exam
      );
      console.log('✅ Exam updated in state:', updated.find(e => e.id === examId));
      setExams(updated);
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  };

  const deleteExam = async (id) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = exams.filter(e => e.id !== id);
      setExams(updated);
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const addChapterToExamSubject = async (examId, subjectIndex, chapterName) => {
    if (!chapterName.trim()) return;
    
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = [...exam.subjects];
      updatedSubjects[subjectIndex] = {
        ...updatedSubjects[subjectIndex],
        chapters: [...(updatedSubjects[subjectIndex].chapters || []), { 
          name: chapterName.trim(), 
          status: 'pending',
          revisionsNeeded: 0,
          revisionsCompleted: 0
        }]
      };
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const updateChapterStatus = async (examId, subjectIndex, chapterIndex, newStatus) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = [...exam.subjects];
      const updatedChapters = [...updatedSubjects[subjectIndex].chapters];
      updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], status: newStatus };
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], chapters: updatedChapters };
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error updating chapter status:', error);
    }
  };

  const updateChapterRevisions = async (examId, subjectIndex, chapterIndex, revisionsNeeded, revisionsCompleted) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = [...exam.subjects];
      const updatedChapters = [...updatedSubjects[subjectIndex].chapters];
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        revisionsNeeded: revisionsNeeded ?? updatedChapters[chapterIndex].revisionsNeeded ?? 0,
        revisionsCompleted: revisionsCompleted ?? updatedChapters[chapterIndex].revisionsCompleted ?? 0
      };
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], chapters: updatedChapters };
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error updating chapter revisions:', error);
    }
  };

  const incrementChapterRevision = async (examId, subjectIndex, chapterIndex) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const chapter = exam.subjects[subjectIndex]?.chapters[chapterIndex];
      if (!chapter) return;
      
      const revisionsNeeded = chapter.revisionsNeeded ?? 0;
      const revisionsCompleted = Math.min((chapter.revisionsCompleted ?? 0) + 1, revisionsNeeded);
      
      await updateChapterRevisions(examId, subjectIndex, chapterIndex, revisionsNeeded, revisionsCompleted);
    } catch (error) {
      console.error('Error incrementing revision:', error);
    }
  };

  const decrementChapterRevision = async (examId, subjectIndex, chapterIndex) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const chapter = exam.subjects[subjectIndex]?.chapters[chapterIndex];
      if (!chapter) return;
      
      const revisionsNeeded = chapter.revisionsNeeded ?? 0;
      const revisionsCompleted = Math.max((chapter.revisionsCompleted ?? 0) - 1, 0);
      
      await updateChapterRevisions(examId, subjectIndex, chapterIndex, revisionsNeeded, revisionsCompleted);
    } catch (error) {
      console.error('Error decrementing revision:', error);
    }
  };

  const deleteChapterFromExamSubject = async (examId, subjectIndex, chapterIndex) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = [...exam.subjects];
      const updatedChapters = updatedSubjects[subjectIndex].chapters.filter((_, i) => i !== chapterIndex);
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], chapters: updatedChapters };
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const deleteSubjectFromExam = async (examId, subjectIndex) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = exam.subjects.filter((_, i) => i !== subjectIndex);
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error deleting subject from exam:', error);
    }
  };

  const getExamProgress = (exam) => {
    if (!exam.subjects || exam.subjects.length === 0) return { pending: 0, started: 0, completed: 0, percentage: 0 };
    
    let totalChapters = 0;
    let pending = 0;
    let started = 0;
    let completed = 0;
    
    exam.subjects.forEach(subject => {
      if (subject.chapters && subject.chapters.length > 0) {
        totalChapters += subject.chapters.length;
        pending += subject.chapters.filter(c => c.status === 'pending').length;
        started += subject.chapters.filter(c => c.status === 'started').length;
        completed += subject.chapters.filter(c => c.status === 'completed').length;
      }
    });
    
    const percentage = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
    
    return { pending, started, completed, percentage, totalChapters };
  };

  // Reminder management
  const addReminder = async () => {
    if (newReminder.title && newReminder.date && activeProfile) {
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
        
        if (data && data.length > 0) {
          setReminders([...reminders, data[0]]);
        }
        
        setNewReminder({ title: '', date: '', description: '' });
        setShowAddReminder(false);
      } catch (error) {
        console.error('Error adding reminder:', error);
        alert('Failed to add reminder: ' + error.message);
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
      
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const startEditReminder = (reminder) => {
    setEditingReminder(reminder.id);
    setEditReminderData({
      title: reminder.title,
      date: reminder.date,
      description: reminder.description
    });
  };

  const saveEditReminder = async () => {
    if (!editReminderData.title.trim() || !editReminderData.date) {
      alert('Title and date are required');
      return;
    }

    try {
      await supabase
        .from('reminders')
        .update({
          title: editReminderData.title,
          date: editReminderData.date,
          description: editReminderData.description
        })
        .eq('id', editingReminder);

      const updatedReminders = reminders.map(r =>
        r.id === editingReminder
          ? { ...r, ...editReminderData }
          : r
      );
      setReminders(updatedReminders);
      setEditingReminder(null);
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Failed to update reminder');
    }
  };

  // Get current date/time in IST (India Standard Time, UTC+5:30)
  const getISTNow = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return istTime;
  };

  // Get today's day of week in IST (0=Sun, 1=Mon, ..., 6=Sat)
  const getTodayDayOfWeekIST = () => {
    return getISTNow().getDay();
  };

  // Get today's date in IST
  const getTodayDateIST = () => {
    const istDate = getISTNow();
    return istDate.toISOString().split('T')[0];
  };

  // Convert 24-hour time format (HH:MM) to 12-hour AM/PM format
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let hours12 = parseInt(hours);
    const ampm = hours12 >= 12 ? 'PM' : 'AM';
    hours12 = hours12 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  // Add recurring reminder
  const addRecurringReminder = async () => {
    if (newRecurringReminder.title && newRecurringReminder.days.length > 0 && activeProfile) {
      try {
        const { data, error } = await supabase
          .from('recurring_reminders')
          .insert([{
            profile_id: activeProfile.id,
            title: newRecurringReminder.title,
            description: newRecurringReminder.description || null,
            time: newRecurringReminder.time,
            end_time: newRecurringReminder.end_time,
            days: newRecurringReminder.days // Array of day numbers
          }])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setRecurringReminders([...recurringReminders, data[0]]);
        }
        
        setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
        setShowAddReminder(false);
      } catch (error) {
        console.error('Error adding recurring reminder:', error);
        alert('Failed to add recurring reminder: ' + error.message);
      }
    }
  };

  // Get reminders for today (both one-time and recurring)
  const _getTodayReminders = () => {
    const todayIST = getTodayDateIST();
    const todayDayOfWeek = getTodayDayOfWeekIST();
    
    // One-time reminders for today
    const oneTimeReminders = getUpcomingReminders().filter(r => 
      r.date === todayIST
    ).map(r => ({ ...r, isRecurring: false, isToday: true }));
    
    // Recurring reminders for today
    const todayRecurringReminders = recurringReminders
      .filter(r => r.days.includes(todayDayOfWeek))
      .map(r => ({ ...r, isRecurring: true, isToday: true }));
    
    return [...oneTimeReminders, ...todayRecurringReminders];
  };

  // Delete recurring reminder
  const deleteRecurringReminder = async (id) => {
    try {
      const { error } = await supabase
        .from('recurring_reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = recurringReminders.filter(r => r.id !== id);
      setRecurringReminders(updated);
    } catch (error) {
      console.error('Error deleting recurring reminder:', error);
    }
  };

  const startEditRecurringReminder = (reminder) => {
    setEditingRecurringReminder(reminder.id);
    setNewRecurringReminder({
      title: reminder.title,
      description: reminder.description,
      time: reminder.time,
      end_time: reminder.end_time || '20:00',
      days: reminder.days
    });
    setReminderType('recurring');
    setShowAddReminder(false); // Close the add form if open
  };

  const saveEditRecurringReminder = async () => {
    if (!newRecurringReminder.title.trim() || newRecurringReminder.days.length === 0) {
      alert('Title and at least one day are required');
      return;
    }

    try {
      await supabase
        .from('recurring_reminders')
        .update({
          title: newRecurringReminder.title,
          description: newRecurringReminder.description,
          time: newRecurringReminder.time,
          end_time: newRecurringReminder.end_time,
          days: newRecurringReminder.days
        })
        .eq('id', editingRecurringReminder);

      const updatedReminders = recurringReminders.map(r =>
        r.id === editingRecurringReminder
          ? { ...r, ...newRecurringReminder }
          : r
      );
      setRecurringReminders(updatedReminders);
      setEditingRecurringReminder(null);
      setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
    } catch (error) {
      console.error('Error updating recurring reminder:', error);
      alert('Failed to update recurring reminder');
    }
  };

    // Calculate days until exam
  const getDaysUntil = (dateString) => {
    const today = new Date();
    const examDate = new Date(dateString);
    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date with day name
  const formatDateWithDay = (dateString) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${dayName}, ${formattedDate}`;
  };

  // Get today's tasks
  const getTodayTasks = () => {
    const today = getTodayDateIST();
    return tasks.filter(t => t.date === today);
  };

  // Get upcoming reminders
  const getUpcomingReminders = () => {
    const todayIST = getTodayDateIST();
    return reminders.filter(r => r.date >= todayIST)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getTodaysReminders = () => {
    const todayIST = getTodayDateIST();
    return reminders.filter(r => r.date === todayIST);
  };

  const getTodaysRecurringReminders = () => {
    const nowIST = getISTNow();
    const dayOfWeek = nowIST.getDay();
    return recurringReminders.filter(r => r.days && r.days.includes(dayOfWeek));
  };

  // Combine and prioritize all reminders (both one-time and recurring)
  const getCombinedReminders = () => {
    const todayIST = getTodayDateIST();
    const nowIST = getISTNow();
    const currentDayOfWeek = nowIST.getDay();
    
    // Get one-time reminders
    const oneTimeReminders = reminders
      .filter(r => r.date >= todayIST)
      .map(r => {
        const reminderDate = new Date(r.date);
        const today = new Date(todayIST);
        const daysUntil = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
        
        return {
          id: r.id,
          type: 'one-time',
          title: r.title,
          description: r.description,
          date: r.date,
          displayDate: new Date(r.date).toLocaleDateString(),
          daysUntil,
          priority: daysUntil === 0 ? 'today' : daysUntil <= 7 ? 'urgent' : 'normal',
          isToday: daysUntil === 0,
          sortKey: r.date,
          original: r
        };
      });
    
    // Get recurring reminders with next occurrence calculation
    const recurringRemindersList = recurringReminders.map(r => {
      const isToday = r.days && r.days.includes(currentDayOfWeek);
      
      // Calculate next occurrence
      let nextOccurrence = null;
      let daysUntil = 999; // Large number for sorting
      
      if (r.days && r.days.length > 0) {
        // Find the nearest day
        const sortedDays = [...r.days].sort((a, b) => a - b);
        let foundNext = false;
        
        // First check if any day is today or after today this week
        for (const day of sortedDays) {
          if (day >= currentDayOfWeek) {
            daysUntil = day - currentDayOfWeek;
            foundNext = true;
            break;
          }
        }
        
        // If not found, take the first day of next week
        if (!foundNext) {
          daysUntil = (7 - currentDayOfWeek) + sortedDays[0];
        }
        
        const nextDate = new Date(nowIST);
        nextDate.setDate(nextDate.getDate() + daysUntil);
        nextOccurrence = nextDate.toISOString().split('T')[0];
      }
      
      const daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daysNames = r.days ? r.days.map(d => daysText[d]).join(', ') : '';
      
      return {
        id: r.id,
        type: 'recurring',
        title: r.title,
        description: r.description,
        time: r.time,
        end_time: r.end_time,
        days: r.days,
        daysNames,
        displayDate: `${daysNames} · ${convertTo12Hour(r.time)}-${convertTo12Hour(r.end_time)}`,
        nextOccurrence,
        daysUntil,
        priority: isToday ? 'today' : daysUntil <= 7 ? 'urgent' : 'normal',
        isToday,
        sortKey: nextOccurrence || '9999-12-31',
        original: r
      };
    });
    
    // Combine and sort by priority and date
    const combined = [...oneTimeReminders, ...recurringRemindersList];
    
    // Sort: today first, then by days until, then by date
    combined.sort((a, b) => {
      // Today's reminders first
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      
      // Then by days until
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
      
      // Then by date
      return a.sortKey.localeCompare(b.sortKey);
    });
    
    return combined;
  };

  // Get upcoming exams
  const getUpcomingExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return exams.filter(exam => {
      if (!exam.subjects || exam.subjects.length === 0) return false;
      // Check if any subject has a future or today's date
      return exam.subjects.some(s => {
        const examDate = new Date(s.date);
        examDate.setHours(0, 0, 0, 0);
        return examDate >= today;
      });
    }).sort((a, b) => {
      // Sort by earliest subject date
      const earliestA = Math.min(...a.subjects.map(s => new Date(s.date)));
      const earliestB = Math.min(...b.subjects.map(s => new Date(s.date)));
      return earliestA - earliestB;
    });
  };

  // Get all upcoming exam subjects (flattened for calendar view)
  const getUpcomingExamSubjects = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingSubjects = [];
    exams.forEach(exam => {
      if (exam.subjects && exam.subjects.length > 0) {
        exam.subjects.forEach(subject => {
          const examDate = new Date(subject.date);
          examDate.setHours(0, 0, 0, 0);
          
          if (examDate >= today) {
            upcomingSubjects.push({
              examName: exam.name,
              examId: exam.id,
              subject: subject.subject,
              date: subject.date,
              chapters: subject.chapters || [],
              keyPoints: subject.keyPoints || ''
            });
          }
        });
      }
    });
    
    // Sort by date
    return upcomingSubjects.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Categorize exams by urgency for better UI presentation
  // eslint-disable-next-line no-unused-vars
  const _categorizeExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const urgent = [];    // < 7 days
    const soon = [];      // 7-21 days (3 weeks)
    const future = [];    // > 21 days
    
    getUpcomingExams().forEach(exam => {
      // Find the earliest exam date from all subjects
      const earliestDate = Math.min(...exam.subjects.map(s => new Date(s.date)));
      const daysUntil = Math.ceil((earliestDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 7) {
        urgent.push({ ...exam, daysUntil });
      } else if (daysUntil < 21) {
        soon.push({ ...exam, daysUntil });
      } else {
        future.push({ ...exam, daysUntil });
      }
    });
    
    return { urgent, soon, future };
  };

  // Get subject-level progress for an exam
  // eslint-disable-next-line no-unused-vars
  const _getSubjectProgress = (subject) => {
    const totalChapters = subject.chapters?.length || 0;
    const completedChapters = subject.chapters?.filter(c => c.status === 'completed').length || 0;
    const startedChapters = subject.chapters?.filter(c => c.status === 'started').length || 0;
    
    return {
      total: totalChapters,
      completed: completedChapters,
      started: startedChapters,
      pending: totalChapters - completedChapters - startedChapters,
      percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) *  100) : 0
    };
  };

  // Legacy function for backward compatibility
  const _getSubjectProgressLegacy = () => {
    return subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subject === subject.name);
      const completedTasks = subjectTasks.filter(t => t.completed).length;
      const totalTasks = subjectTasks.length;
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        name: subject.name,
        completed: completedTasks,
        total: totalTasks,
        percentage
      };
    });
  };

  // Calculate daily study time
  const getTodayStudyTime = () => {
    const todayTasks = getTodayTasks();
    const completedTime = todayTasks.filter(t => t.completed)
      .reduce((sum, t) => sum + (t.duration || 0), 0);
    return completedTime;
  };

  // Get tasks for a specific date
  const getTasksForDate = (dateString) => {
    return tasks.filter(t => t.date === dateString);
  };

  // Get last N days of data
  const getLastNDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(dateString);
      const completedTime = dayTasks.filter(t => t.completed)
        .reduce((sum, t) => sum + (t.duration || 0), 0);
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completedTime,
        totalTasks: dayTasks.length,
        completedTasks: dayTasks.filter(t => t.completed).length
      });
    }
    return days;
  };

  // Get subject-wise analytics
  const getSubjectAnalytics = () => {
    const _last7Days = getLastNDays(7);
    const subjectData = {};

    subjects.forEach(subject => {
      const subjectTasks = tasks.filter(t => t.subject === subject.name);
      const completedTasks = subjectTasks.filter(t => t.completed);
      const totalTime = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      
      // Last 7 days activity
      const recentTasks = subjectTasks.filter(t => {
        const taskDate = new Date(t.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate >= weekAgo;
      });

      subjectData[subject.name] = {
        name: subject.name,
        totalTasks: subjectTasks.length,
        completedTasks: completedTasks.length,
        totalTime,
        recentActivity: recentTasks.length,
        completionRate: subjectTasks.length > 0 
          ? Math.round((completedTasks.length / subjectTasks.length) * 100) 
          : 0
      };
    });

    return Object.values(subjectData);
  };

  // Identify neglected subjects (no activity in last 3 days)
  const getNeglectedSubjects = () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return subjects.filter(subject => {
      const recentTasks = tasks.filter(t => 
        t.subject === subject.name && 
        new Date(t.date) >= threeDaysAgo
      );
      return recentTasks.length === 0;
    });
  };

  // Get most active subjects
  const getMostActiveSubjects = () => {
    const analytics = getSubjectAnalytics();
    return analytics
      .filter(s => s.recentActivity > 0)
      .sort((a, b) => b.recentActivity - a.recentActivity)
      .slice(0, 3);
  };

  // Get smart daily suggestions
  const getDailySuggestions = () => {
    const suggestions = [];
    const _today = new Date();
    
    // Check for urgent exams (within 5 days) with pending chapters
    const urgentExams = exams.filter(exam => {
      // For new exam structure, check all subjects within the exam
      if (!exam.subjects || !Array.isArray(exam.subjects)) return false;
      
      return exam.subjects.some(subject => {
        const daysLeft = getDaysUntil(subject.date);
        return daysLeft <= 5 && daysLeft >= 0;
      });
    });

    urgentExams.forEach(exam => {
      if (!exam.subjects || !Array.isArray(exam.subjects)) return;
      
        exam.subjects.forEach((subject, _subjectIndex) => {
        const daysLeft = getDaysUntil(subject.date);
        if (daysLeft <= 5 && daysLeft >= 0) {
          // Calculate progress for this specific subject only
          const subjectChapters = subject.chapters || [];
          const pendingCount = subjectChapters.filter(c => c.status === 'pending').length;
          const startedCount = subjectChapters.filter(c => c.status === 'started').length;
          const remainingCount = pendingCount + startedCount;
          
          if (remainingCount > 0) {
            const pendingChapters = subjectChapters
              .filter(c => c.status === 'pending' || c.status === 'started')
              .slice(0, 2);
            
            suggestions.push({
              type: 'urgent-exam',
              priority: 'high',
              subject: subject.subject,
              message: `${exam.name} - ${subject.subject} in ${daysLeft} days`,
              details: `${remainingCount} chapter${remainingCount !== 1 ? 's' : ''} remaining`,
              chapters: pendingChapters.map(c => c.name),
              examId: exam.id
            });
          }
        }
      });
    });

    // Check for neglected subjects
    const neglected = getNeglectedSubjects();
    neglected.slice(0, 2).forEach(subject => {
      // Check if there's an upcoming exam for this subject
      const upcomingExam = exams.find(e => {
        if (!e.subjects || !Array.isArray(e.subjects)) return false;
        return e.subjects.some(s => 
          s.subject === subject.name && 
          getDaysUntil(s.date) > 0 && 
          getDaysUntil(s.date) <= 14
        );
      });

      suggestions.push({
        type: 'neglected',
        priority: upcomingExam ? 'high' : 'medium',
        subject: subject.name,
        message: `No ${subject.name} study in 3+ days`,
        details: upcomingExam 
          ? `Exam coming up soon` 
          : 'Schedule some practice time'
      });
    });

    // Suggest starting chapters marked as "started" but not completed
    exams.forEach(exam => {
      if (!exam.subjects || !Array.isArray(exam.subjects)) return;
      
      exam.subjects.forEach(subject => {
        const startedChapters = (subject.chapters || []).filter(c => c.status === 'started');
        const daysLeft = getDaysUntil(subject.date);
        
        if (startedChapters.length > 0 && daysLeft > 0) {
          startedChapters.slice(0, 1).forEach(chapter => {
            suggestions.push({
              type: 'continue',
              priority: daysLeft <= 7 ? 'high' : 'medium',
              subject: subject.subject,
              message: `Continue ${subject.subject}: ${chapter.name}`,
              details: `Exam in ${daysLeft} days`
            });
          });
        }
      });
    });

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {_loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <div className="text-indigo-700 font-semibold text-lg">Loading...</div>
          </div>
        </div>
      )}
      <div className={`max-w-4xl mx-auto${_loading ? ' opacity-30 pointer-events-none select-none' : ''}`}>
        {/* Profile Selector */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Kannama Study Tracker!</h2>
            <p className="text-gray-600 mb-6">Create a profile for your first child to get started</p>
            
            <div className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                placeholder="Child's name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Class/Grade (e.g., Grade 5)"
                value={newProfileClass}
                onChange={(e) => setNewProfileClass(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={addProfile}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Selection Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {profiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile)}
                    className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeProfile?.id === profile.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{profile.name}</div>
                    <div className="text-xs opacity-90">{profile.class}</div>
                  </button>
                ))}
                
                {/* Add Profile Button */}
                {profiles.length >= 5 ? (
                  <div className="flex-shrink-0 px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-400 bg-gray-50">
                    <div className="text-xs text-center">Max 5 kids</div>
                  </div>
                ) : showAddProfile ? (
                  <div className="flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Class/Grade"
                      value={newProfileClass}
                      onChange={(e) => setNewProfileClass(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addProfile}
                        className="flex-1 bg-indigo-600 text-white py-1 rounded text-sm hover:bg-indigo-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddProfile(false);
                          setNewProfileName('');
                          setNewProfileClass('');
                        }}
                        className="px-3 bg-gray-200 text-gray-600 py-1 rounded text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddProfile(true)}
                    className="flex-shrink-0 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    <Plus className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs">Add Child</div>
                  </button>
                )}
              </div>
              
            </div>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold text-indigo-600">
                    {activeProfile?.name}'s Study Tracker
                  </h1>
                  <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-indigo-50 rounded-lg w-fit">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleDateString('en-US', { month: 'long' })} {new Date().getDate()}, {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all"
                    title="View Profile Settings"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs opacity-80">Account</span>
                      <span className="font-semibold text-sm leading-tight">
                        {accountName || session?.user?.email?.split('@')[0] || 'Profile'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Today: {getTodayStudyTime()} / 180 mins</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((getTodayStudyTime() / 180) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Only show content if profile is selected */}
        {activeProfile && (
          <>
            {/* Activities Manager Modal */}
            {showActivitiesManager && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Manage Default Activities</h2>
                  <button
                    onClick={() => {
                      setShowActivitiesManager(false);
                      setEditingActivity(null);
                      setNewActivityName('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Add New Activity */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New activity name"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStandardActivity()}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      onClick={addStandardActivity}
                      className="px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-2">
                  {standardActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white border rounded-lg">
                      {editingActivity === activity ? (
                        <>
                          <input
                            type="text"
                            defaultValue={activity}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateStandardActivity(activity, e.target.value);
                              }
                            }}
                            onBlur={(e) => updateStandardActivity(activity, e.target.value)}
                            className="flex-1 p-2 border rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingActivity(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-gray-700">{activity}</span>
                          <button
                            onClick={() => setEditingActivity(activity)}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStandardActivity(activity)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowActivitiesManager(false);
                      setEditingActivity(null);
                      setNewActivityName('');
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shared Kids Activities Modal */}
        {showSharedActivities && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
              <div className="sticky top-0 bg-white border-b p-6 rounded-t-lg z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-600">Kids Activities Hub</h2>
                    <p className="text-sm text-gray-600">Fun activities for when they need a break</p>
                  </div>
                  <button
                    onClick={() => setShowSharedActivities(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(85vh-180px)] overflow-y-auto p-6">
                {/* Add New Activity */}
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Add New Activity</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Activity title"
                      value={newSharedActivity.title}
                      onChange={(e) => setNewSharedActivity({ ...newSharedActivity, title: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                    <textarea
                      placeholder="Description or instructions"
                      value={newSharedActivity.description}
                      onChange={(e) => setNewSharedActivity({ ...newSharedActivity, description: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows="2"
                    />
                    <div className="flex gap-2 items-center">
                      <select
                        value={newSharedActivity.category}
                        onChange={(e) => setNewSharedActivity({ ...newSharedActivity, category: e.target.value })}
                        className="flex-1 p-2 border rounded-lg"
                      >
                        <option value="indoor">🏠 Indoor</option>
                        <option value="outdoor">🌳 Outdoor</option>
                        <option value="creative">🎨 Creative</option>
                        <option value="physical">⚽ Physical</option>
                        <option value="educational">📚 Educational</option>
                        <option value="relaxing">🧘 Relaxing</option>
                      </select>
                      <button
                        onClick={addSharedActivity}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activities List by Category */}
                {sharedActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No activities yet!</p>
                    <p className="text-sm">Add fun activities for kids when they need a break from studying.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {['indoor', 'outdoor', 'creative', 'physical', 'educational', 'relaxing'].map(category => {
                      const categoryActivities = sharedActivities.filter(a => a.category === category);
                      if (categoryActivities.length === 0) return null;

                      const categoryIcons = {
                        indoor: '🏠',
                        outdoor: '🌳',
                        creative: '🎨',
                        physical: '⚽',
                        educational: '📚',
                        relaxing: '🧘'
                      };

                      return (
                        <div key={category} className="border rounded-lg p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span>{categoryIcons[category]}</span>
                            <span className="capitalize">{category}</span>
                            <span className="text-xs text-gray-500">({categoryActivities.length})</span>
                          </h3>
                          <div className="space-y-2">
                            {categoryActivities.map(activity => (
                              <div key={activity.id} className="bg-white p-3 rounded-lg border">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">{activity.title}</div>
                                    {activity.description && (
                                      <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteSharedActivity(activity.id)}
                                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
                <button
                  onClick={() => setShowSharedActivities(false)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Profile Settings</h2>
                      <p className="text-sm text-white/80">Manage your account & kids</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      setEditingAccountName(false);
                      setProfileTab('kids');
                      setEditingProfile(null);
                      setDeletingProfileId(null);
                    }}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setProfileTab('kids')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      profileTab === 'kids'
                        ? 'bg-white text-indigo-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Kids Profiles
                  </button>
                  <button
                    onClick={() => setProfileTab('account')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      profileTab === 'account'
                        ? 'bg-white text-indigo-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Account Settings
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                {/* Kids Profiles Tab */}
                {profileTab === 'kids' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Manage Kids</h3>
                      <span className="text-sm text-gray-600">{profiles.length} profile{profiles.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* List of all kids */}
                    {profiles.map((profile) => (
                      <div 
                        key={profile.id}
                        className={`border rounded-lg p-4 transition-all ${
                          activeProfile?.id === profile.id 
                            ? 'border-indigo-300 bg-indigo-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {editingProfile === profile.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editProfileData.name}
                                onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Child's name"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Grade/Class</label>
                              <input
                                type="text"
                                value={editProfileData.class}
                                onChange={(e) => setEditProfileData({ ...editProfileData, class: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., Grade 5"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => updateProfile(profile.id)}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProfile(null);
                                  setEditProfileData({ name: '', class: '' });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : deletingProfileId === profile.id ? (
                          // Delete confirmation mode
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-red-800">Delete {profile.name}'s Profile?</p>
                                <p className="text-xs text-red-700 mt-1">
                                  This will permanently delete all data including subjects, tasks, exams, and reminders. This action cannot be undone.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteProfile(profile.id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeletingProfileId(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                                {activeProfile?.id === profile.id && (
                                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">Active</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {profile.class || 'Grade not set'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {activeProfile?.id !== profile.id && (
                                <button
                                  onClick={() => switchProfile(profile)}
                                  className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium"
                                >
                                  Switch
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingProfile(profile.id);
                                  setEditProfileData({ name: profile.name, class: profile.class || '' });
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                title="Edit profile"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {profiles.length > 1 && (
                                <button
                                  onClick={() => setDeletingProfileId(profile.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete profile"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add new profile hint */}
                    <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-200">
                      <p className="text-sm text-gray-700 text-center">
                        💡 To add a new kid, use the "Add Child" button in the profiles section above (max 5 kids)
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Settings Tab */}
                {profileTab === 'account' && (
                  <div className="space-y-6">
                    {/* Account Name Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Account Name</label>
                      {editingAccountName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempAccountName}
                            onChange={(e) => setTempAccountName(e.target.value)}
                            placeholder="Enter your name"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (tempAccountName.trim()) {
                                saveAccountName(tempAccountName.trim());
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingAccountName(false);
                              setTempAccountName('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-800 font-medium">
                            {accountName || 'Not set'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingAccountName(true);
                              setTempAccountName(accountName);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">Your personal account name</p>
                    </div>

                    {/* Email Section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-800">{session?.user?.email}</span>
                      </div>
                      <p className="text-xs text-gray-500">Your login email address</p>
                    </div>

                    {/* Personalization Section (Placeholder) */}
                    <div className="space-y-2 pt-4 border-t">
                      <label className="block text-sm font-semibold text-gray-700">Personalization</label>
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <p className="text-sm text-gray-600 text-center">
                          🎨 Theme preferences, notifications, and more customization options coming soon!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 p-4 rounded-b-lg border-t flex gap-2 flex-shrink-0">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setEditingAccountName(false);
                    setProfileTab('kids');
                    setEditingProfile(null);
                    setDeletingProfileId(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-4 p-2 flex gap-2 overflow-x-auto">
          {['daily', 'calendar', 'analytics', 'subjects', 'exams', 'docs'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeView === view
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setShowSharedActivities(true)}
            className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Activities
          </button>
        </div>

        {/* Daily View */}
        {activeView === 'daily' && (
          <div className="space-y-6">
            {/* Today's Overview Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋</h1>
                  <p className="text-white/90 text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-4xl font-bold">{getTodayTasks().length}</div>
                  <div className="text-sm text-white/80">Tasks Today</div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{getTodayTasks().filter(t => t.completed).length}/{getTodayTasks().length}</div>
                  <div className="text-xs text-white/80">Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{getTodaysReminders().length + getTodaysRecurringReminders().length}</div>
                  <div className="text-xs text-white/80">Reminders</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{getDailySuggestions().filter(s => s.priority === 'high').length}</div>
                  <div className="text-xs text-white/80">Urgent</div>
                </div>
              </div>
            </div>

            {/* Today's Notifications & Reminders */}
            {(getDailySuggestions().length > 0 || getTodaysReminders().length > 0 || getTodaysRecurringReminders().length > 0) && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-2">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Today's Notifications</h2>
                      {todayNotificationsMinimized && (
                        <p className="text-xs text-gray-600">
                          {getDailySuggestions().filter((s, i) => !isNotificationDismissed(i, 'suggestion')).length + 
                           getTodaysReminders().filter(r => !isNotificationDismissed(r.id, 'reminder')).length + 
                           getTodaysRecurringReminders().filter(r => !isNotificationDismissed(r.id, 'recurring')).length} active
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!todayNotificationsMinimized && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        {getDailySuggestions().filter((s, i) => !isNotificationDismissed(i, 'suggestion')).length + 
                         getTodaysReminders().filter(r => !isNotificationDismissed(r.id, 'reminder')).length + 
                         getTodaysRecurringReminders().filter(r => !isNotificationDismissed(r.id, 'recurring')).length}
                      </span>
                    )}
                    <button
                      onClick={() => setTodayNotificationsMinimized(!todayNotificationsMinimized)}
                      className="p-2 bg-white hover:bg-orange-100 rounded-lg transition-all border border-orange-200 shadow-sm hover:shadow-md"
                      title={todayNotificationsMinimized ? 'Expand notifications' : 'Minimize notifications'}
                    >
                      {todayNotificationsMinimized ? <ChevronDown className="w-5 h-5 text-orange-700" /> : <ChevronUp className="w-5 h-5 text-orange-700" />}
                    </button>
                  </div>
                </div>
                
                <div 
                  className="transition-all duration-500 ease-in-out"
                  style={{ 
                    maxHeight: todayNotificationsMinimized ? '0' : '2000px',
                    opacity: todayNotificationsMinimized ? '0' : '1',
                    overflow: todayNotificationsMinimized ? 'hidden' : 'visible'
                  }}
                >
                  <div className="p-6">
                
                <div className="space-y-3">
                  {/* Today's Reminders */}
                  {getTodaysReminders()
                    .filter(reminder => !isNotificationDismissed(reminder.id, 'reminder'))
                    .map((reminder) => (
                    <div key={reminder.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-400 rounded-lg hover:shadow-md transition-all">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">TODAY</span>
                          <span className="font-bold text-gray-800">{reminder.title}</span>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {e.stopPropagation(); dismissNotification(reminder.id, 'reminder');}}
                        className="text-gray-500 hover:text-gray-700 p-2 flex-shrink-0 hover:bg-gray-100 rounded-lg transition-all"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Today's Recurring Reminders */}
                  {getTodaysRecurringReminders()
                    .filter(reminder => !isNotificationDismissed(reminder.id, 'recurring'))
                    .map((reminder) => (
                    <div key={reminder.id} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-400 rounded-lg hover:shadow-md transition-all">
                      <div className="bg-indigo-100 rounded-full p-2 flex-shrink-0">
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded">RECURRING</span>
                          <span className="font-bold text-gray-800">{reminder.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{reminder.time}{reminder.end_time && ` - ${reminder.end_time}`}</span>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {e.stopPropagation(); dismissNotification(reminder.id, 'recurring');}}
                        className="text-gray-500 hover:text-gray-700 p-2 flex-shrink-0 hover:bg-gray-100 rounded-lg transition-all"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Study Suggestions */}
                  {getDailySuggestions()
                    .filter((suggestion, i) => !isNotificationDismissed(i, 'suggestion'))
                    .map((suggestion, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-3 p-4 rounded-lg border-l-4 hover:shadow-md transition-all ${
                        suggestion.priority === 'high' 
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500' 
                          : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500'
                      }`}
                    >
                      <div className={`rounded-full p-2 flex-shrink-0 ${
                        suggestion.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {suggestion.priority === 'high' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Book className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {suggestion.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">URGENT</span>
                          )}
                          <span className="font-bold text-gray-800">{suggestion.message}</span>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.details}</p>
                        {suggestion.chapters && suggestion.chapters.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {suggestion.chapters.map((ch, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-700">
                                {ch}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => dismissNotification(i, 'suggestion')}
                        className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Tasks */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Today's Tasks</h2>
                  </div>
                  <button
                    onClick={() => startVoiceInput((text) => {
                      setNewTask({ ...newTask, activity: text });
                      setShowAddTask(true);
                    })}
                    className={`p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-all`}
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                
                {showAddTask ? (
                  <div className="space-y-3 mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <select
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    
                    {newTask.subject && (
                      <select
                        value={newTask.chapter}
                        onChange={(e) => setNewTask({ ...newTask, chapter: e.target.value })}
                        className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Chapter (Optional)</option>
                        {subjects.find(s => s.name === newTask.subject)?.chapters?.map((ch, i) => (
                          <option key={i} value={ch}>{ch}</option>
                        ))}
                      </select>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">Activity</label>
                        <button
                          onClick={() => setShowActivitiesManager(true)}
                          className="text-xs px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded font-semibold"
                        >
                          Manage Activities
                        </button>
                      </div>
                      
                      <select
                        value={standardActivities.includes(newTask.activity) ? newTask.activity : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setNewTask({ ...newTask, activity: '' });
                          } else {
                            setNewTask({ ...newTask, activity: e.target.value });
                          }
                        }}
                        className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Activity (Optional)</option>
                        {standardActivities.map((act, i) => (
                          <option key={i} value={act}>{act}</option>
                        ))}
                        <option value="custom">--- Custom Activity ---</option>
                      </select>
                    </div>
                    
                    {(!standardActivities.includes(newTask.activity) || newTask.activity === '') && (
                      <input
                        type="text"
                        placeholder="Enter custom activity or leave blank"
                        value={standardActivities.includes(newTask.activity) ? '' : newTask.activity}
                        onChange={(e) => setNewTask({ ...newTask, activity: e.target.value })}
                        className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}
                    
                    <input
                      type="number"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                      placeholder="Duration (minutes)"
                      className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    
                    <textarea
                      value={newTask.instructions}
                      onChange={(e) => setNewTask({ ...newTask, instructions: e.target.value })}
                      placeholder="Instructions or notes (optional)"
                      className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={addTask}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTask({ 
                            subject: '', 
                            chapter: '', 
                            activity: '', 
                            duration: 30, 
                            date: getTodayDateIST(),
                            completed: false,
                            instructions: ''
                          });
                        }}
                        className="px-6 bg-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="w-full border-2 border-dashed border-indigo-300 rounded-xl py-4 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all mb-4 group"
                  >
                    <Plus className="w-6 h-6 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Add New Task</span>
                  </button>
                )}

                {getTodayTasks().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No tasks for today</p>
                    <p className="text-sm text-gray-400 mt-1">Add a task to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getTodayTasks().map(task => (
                      <div
                        key={task.id}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          task.completed 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="flex-shrink-0 transition-all hover:scale-110"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-7 h-7 text-green-600" />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.subject} {task.activity && `- ${task.activity}`}
                          </div>
                          {task.chapter && (
                            <div className="text-sm text-indigo-600 font-medium">{task.chapter}</div>
                          )}
                          {task.carryover_days > 0 && (
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-full">
                              <span className="text-xs font-semibold text-orange-700">
                                Carried over {task.carryover_days} {task.carryover_days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          )}
                          {task.instructions && (
                            <div className="text-sm text-gray-600 mt-1 italic">{task.instructions}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{task.duration} mins</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* School Reminders Management */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg p-2">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Reminders</h2>
                      {notificationsMinimized && (
                        <p className="text-xs text-gray-600">
                          {getCombinedReminders().length} total reminders
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notificationsMinimized && (
                      <button
                        onClick={() => {
                          const todayDate = getTodayDateIST();
                          setNewReminder({ title: '', date: todayDate, description: '' });
                          setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                          setReminderType('one-time');
                          setShowAddReminder(true);
                        }}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsMinimized(!notificationsMinimized)}
                      className="p-2 bg-white hover:bg-amber-100 rounded-lg transition-all border border-amber-200 shadow-sm hover:shadow-md"
                      title={notificationsMinimized ? 'Expand notifications' : 'Minimize notifications'}
                    >
                      {notificationsMinimized ? <ChevronDown className="w-5 h-5 text-amber-700" /> : <ChevronUp className="w-5 h-5 text-amber-700" />}
                    </button>
                  </div>
                </div>
                
                <div 
                  className="transition-all duration-500 ease-in-out overflow-hidden"
                  style={{ 
                    maxHeight: notificationsMinimized ? '0' : '3000px',
                    opacity: notificationsMinimized ? '0' : '1'
                  }}
                >
                  <div className="p-6">
                
                {showAddReminder && (
                  <div className="mb-4 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 space-y-4 shadow-lg">
                    <h3 className="font-bold text-gray-800 text-lg">Add Reminder</h3>
                    
                    {/* Reminder Type Selector */}
                    <div className="flex gap-2 p-1 bg-white rounded-lg border-2 border-indigo-200">
                      <button
                        onClick={() => setReminderType('one-time')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                          reminderType === 'one-time'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        📅 One-Time
                      </button>
                      <button
                        onClick={() => setReminderType('recurring')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                          reminderType === 'recurring'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        🔁 Recurring
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder={reminderType === 'one-time' ? 'Reminder title' : 'Reminder title (e.g., Tuition, Sports class)'}
                      value={reminderType === 'one-time' ? newReminder.title : newRecurringReminder.title}
                      onChange={(e) => {
                        if (reminderType === 'one-time') {
                          setNewReminder({ ...newReminder, title: e.target.value });
                        } else {
                          setNewRecurringReminder({ ...newRecurringReminder, title: e.target.value });
                        }
                      }}
                      className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                    />

                    {reminderType === 'one-time' ? (
                      <input
                        type="date"
                        value={newReminder.date}
                        onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                        className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-sm text-gray-700 font-bold block mb-2">🕐 Start Time</label>
                            <input
                              type="time"
                              value={newRecurringReminder.time}
                              onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, time: e.target.value })}
                              className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm text-gray-700 font-bold block mb-2">🕐 End Time</label>
                            <input
                              type="time"
                              value={newRecurringReminder.end_time}
                              onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, end_time: e.target.value })}
                              className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">📅 Select Days:</label>
                          <div className="flex flex-wrap gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  const newDays = newRecurringReminder.days.includes(idx)
                                    ? newRecurringReminder.days.filter(d => d !== idx)
                                    : [...newRecurringReminder.days, idx];
                                  setNewRecurringReminder({ ...newRecurringReminder, days: newDays });
                                }}
                                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-md ${
                                  newRecurringReminder.days.includes(idx)
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <textarea
                      placeholder="Description (optional)"
                      value={reminderType === 'one-time' ? newReminder.description : newRecurringReminder.description}
                      onChange={(e) => {
                        if (reminderType === 'one-time') {
                          setNewReminder({ ...newReminder, description: e.target.value });
                        } else {
                          setNewRecurringReminder({ ...newRecurringReminder, description: e.target.value });
                        }
                      }}
                      className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (reminderType === 'one-time') {
                            addReminder();
                          } else {
                            addRecurringReminder();
                          }
                        }}
                        className={`flex-1 text-white py-3 rounded-lg font-bold shadow-lg transition-all ${
                          reminderType === 'one-time'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        }`}
                      >
                        {reminderType === 'one-time' ? '➕ Add Reminder' : '➕ Add Recurring Reminder'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddReminder(false);
                          setNewReminder({ title: '', date: '', description: '' });
                          setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                          setReminderType('one-time');
                        }}
                        className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {editingReminder && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 space-y-3">
                    <h3 className="font-bold text-gray-800">Edit Reminder</h3>
                    <input
                      type="text"
                      placeholder="Reminder title"
                      value={editReminderData.title}
                      onChange={(e) => setEditReminderData({ ...editReminderData, title: e.target.value })}
                      className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={editReminderData.date}
                      onChange={(e) => setEditReminderData({ ...editReminderData, date: e.target.value })}
                      className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={editReminderData.description}
                      onChange={(e) => setEditReminderData({ ...editReminderData, description: e.target.value })}
                      className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditReminder}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingReminder(null);
                          setEditReminderData({ title: '', date: '', description: '' });
                        }}
                        className="px-6 bg-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                All Reminders
              </h3>
              
              {(() => {
                const allReminders = getCombinedReminders();
                const thisWeekReminders = allReminders.filter(r => r.daysUntil <= 7);
                const laterReminders = allReminders.filter(r => r.daysUntil > 7);
                
                if (allReminders.length === 0) {
                  return <p className="text-gray-500 text-center py-8 italic">No reminders</p>;
                }
                
                return (
                  <>
                    {thisWeekReminders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 italic">No reminders this week</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {thisWeekReminders.map(reminder => (
                          <div 
                            key={`${reminder.type}-${reminder.id}`}
                            className={`group p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all ${
                              reminder.isToday 
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400 shadow-md' 
                                : reminder.priority === 'urgent'
                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300'
                                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
                            }`}
                            onClick={() => setExpandedReminders({...expandedReminders, [`${reminder.type}-${reminder.id}`]: !expandedReminders[`${reminder.type}-${reminder.id}`]})}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {reminder.type === 'recurring' ? (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md ${
                                    reminder.isToday ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white animate-pulse' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                  }`}>
                                    {reminder.isToday ? '⭐' : '🔔'}
                                  </div>
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                                    reminder.isToday ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                                  }`}>
                                    <AlertCircle className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <div className="font-bold text-gray-800 text-lg">{reminder.title}</div>
                                  {reminder.isToday && (
                                    <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-md">
                                      ✨ TODAY
                                    </span>
                                  )}
                                  {reminder.type === 'recurring' && (
                                    <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full font-bold">
                                      🔁 Recurring
                                    </span>
                                  )}
                                  {!reminder.isToday && reminder.priority === 'urgent' && (
                                    <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full font-bold">
                                      ⚡ {reminder.daysUntil === 1 ? 'Tomorrow' : `${reminder.daysUntil} days`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700 font-semibold">
                                  📅 {reminder.displayDate}
                                </div>
                                {reminder.description && (
                                  <div className={`text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words transition-all ${expandedReminders[`${reminder.type}-${reminder.id}`] ? '' : 'line-clamp-2'}`}>
                                    {reminder.description}
                                    {!expandedReminders[`${reminder.type}-${reminder.id}`] && <span className="text-blue-700 font-bold ml-1">... (click to expand)</span>}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (reminder.type === 'recurring') {
                                      startEditRecurringReminder(reminder.original);
                                    } else {
                                      startEditReminder(reminder.original);
                                    }
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (reminder.type === 'recurring') {
                                      deleteRecurringReminder(reminder.id);
                                    } else {
                                      deleteReminder(reminder.id);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {laterReminders.length > 0 && (
                      <div className="mt-4 border-t-2 border-gray-200 pt-4">
                        <button
                          onClick={() => setShowAllReminders(!showAllReminders)}
                          className="w-full p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg font-semibold text-gray-700 transition-all flex items-center justify-center gap-2"
                        >
                          {showAllReminders ? (
                            <>
                              <ChevronUp className="w-5 h-5" />
                              Hide Later Reminders ({laterReminders.length})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5" />
                              Show Later Reminders ({laterReminders.length})
                            </>
                          )}
                        </button>
                        
                        {showAllReminders && (
                          <div className="space-y-3 mt-4">
                            {laterReminders.map(reminder => (
                              <div 
                                key={`${reminder.type}-${reminder.id}`}
                                className="group p-4 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 rounded-xl cursor-pointer hover:shadow-lg transition-all opacity-75 hover:opacity-100"
                                onClick={() => setExpandedReminders({...expandedReminders, [`${reminder.type}-${reminder.id}`]: !expandedReminders[`${reminder.type}-${reminder.id}`]})}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {reminder.type === 'recurring' ? (
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                                        🔔
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                                        <AlertCircle className="w-6 h-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <div className="font-bold text-gray-800 text-lg">{reminder.title}</div>
                                      {reminder.type === 'recurring' && (
                                        <span className="text-xs bg-gradient-to-r from-gray-400 to-gray-600 text-white px-2 py-1 rounded-full font-bold">
                                          🔁 Recurring
                                        </span>
                                      )}
                                      <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded-full font-bold">
                                        {reminder.daysUntil} days away
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 font-semibold">
                                      📅 {reminder.displayDate}
                                    </div>
                                    {reminder.description && (
                                      <div className={`text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words transition-all ${expandedReminders[`${reminder.type}-${reminder.id}`] ? '' : 'line-clamp-2'}`}>
                                        {reminder.description}
                                        {!expandedReminders[`${reminder.type}-${reminder.id}`] && <span className="text-gray-600 font-bold ml-1">... (click to expand)</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (reminder.type === 'recurring') {
                                          startEditRecurringReminder(reminder.original);
                                        } else {
                                          startEditReminder(reminder.original);
                                        }
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (reminder.type === 'recurring') {
                                          deleteRecurringReminder(reminder.id);
                                        } else {
                                          deleteReminder(reminder.id);
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
              
{editingRecurringReminder && (
                <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 space-y-4 shadow-lg">
                  <h3 className="font-bold text-gray-800 text-lg">✏️ Edit Recurring Reminder</h3>
                  <input
                    type="text"
                    placeholder="Reminder title (e.g., Tuition, Sports class)"
                    value={newRecurringReminder.title}
                    onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, title: e.target.value })}
                    className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 font-bold block mb-2">🕐 Start Time</label>
                      <input
                        type="time"
                        value={newRecurringReminder.time}
                        onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, time: e.target.value })}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 font-bold block mb-2">🕐 End Time</label>
                      <input
                        type="time"
                        value={newRecurringReminder.end_time}
                        onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, end_time: e.target.value })}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={newRecurringReminder.description}
                    onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, description: e.target.value })}
                    className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">📅 Select Days:</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const newDays = newRecurringReminder.days.includes(idx)
                              ? newRecurringReminder.days.filter(d => d !== idx)
                              : [...newRecurringReminder.days, idx];
                            setNewRecurringReminder({ ...newRecurringReminder, days: newDays });
                          }}
                          className={`px-4 py-2 rounded-lg font-bold transition-all shadow-md ${
                            newRecurringReminder.days.includes(idx)
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEditRecurringReminder}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg transition-all"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingRecurringReminder(null);
                        setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                      }}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
                  </div>
                </div>
              </div>
        )}

        {/* Subjects View */}
        {activeView === 'subjects' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Subjects & Chapters</h2>
              <button
                onClick={() => setShowAddSubject(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {showAddSubject && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && !newSubject.name.trim() ? null : e.key === 'Enter' && addSubject()}
                  className="w-full p-2 border rounded-lg mb-3"
                />
                
                <div className="mb-3 p-3 bg-white rounded-lg border">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Chapters (Optional)</label>
                  <p className="text-xs text-gray-500 mb-2">Add chapters now or add them later</p>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Chapter name"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newChapterName.trim()) {
                          setNewSubject({
                            ...newSubject,
                            chapters: [...(newSubject.chapters || []), newChapterName.trim()]
                          });
                          setNewChapterName('');
                        }
                      }}
                      className="flex-1 p-2 border rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newChapterName.trim()) {
                          setNewSubject({
                            ...newSubject,
                            chapters: [...(newSubject.chapters || []), newChapterName.trim()]
                          });
                          setNewChapterName('');
                        }
                      }}
                      className="px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {newSubject.chapters && newSubject.chapters.length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {newSubject.chapters.map((chapter, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span>{chapter}</span>
                          <button
                            onClick={() => {
                              setNewSubject({
                                ...newSubject,
                                chapters: newSubject.chapters.filter((_, idx) => idx !== i)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={addSubject}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Add Subject
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSubject(false);
                      setNewSubject({ name: '', chapters: [] });
                      setNewChapterName('');
                    }}
                    className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {subjects.map(subject => (
                <div key={subject.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Book className="w-5 h-5 text-indigo-600" />
                      {subject.name}
                    </h3>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {subject.chapters?.map((chapter, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-gray-600 pl-4 py-1 bg-gray-50 rounded">
                        <span>{chapter}</span>
                        <button
                          onClick={() => {
                            const updated = subjects.map(s => 
                              s.id === subject.id 
                                ? { ...s, chapters: s.chapters.filter((_, idx) => idx !== i) }
                                : s
                            );
                            setSubjects(updated);
                            saveData('subjects', updated);
                          }}
                          className="text-red-500 hover:text-red-700 mr-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {editingChapter === subject.id ? (
                      <div className="pl-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Chapter name"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addChapterToSubject(subject.id, newChapterName);
                              setNewChapterName('');
                              setEditingChapter(null);
                            }
                          }}
                          className="flex-1 p-2 border rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            addChapterToSubject(subject.id, newChapterName);
                            setNewChapterName('');
                            setEditingChapter(null);
                          }}
                          className="px-3 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setEditingChapter(null);
                            setNewChapterName('');
                          }}
                          className="px-3 bg-gray-200 text-gray-600 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingChapter(subject.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 pl-4"
                      >
                        + Add Chapter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams View - Redesigned */}
        {activeView === 'exams' && (
          <div className="space-y-6">
            {/* Header with Add Exam Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Book className="w-7 h-7 text-indigo-600" />
                Exam Management
              </h2>
              <button
                onClick={() => setShowAddExam(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New Exam
              </button>
            </div>
            
            {/* Add Exam Modal */}
            {exams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Exams</div>
                  <div className="text-3xl font-bold text-indigo-600">{getUpcomingExams().length}</div>
                  <div className="text-xs text-gray-500 mt-1">Upcoming</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Avg Preparation</div>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(getUpcomingExams().reduce((sum, exam) => sum + getExamProgress(exam).percentage, 0) / (getUpcomingExams().length || 1))}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Next Exam</div>
                  <div className="text-2xl font-bold text-red-600">
                    {getUpcomingExamSubjects().length > 0 ? getDaysUntil(getUpcomingExamSubjects()[0].date) : 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Days away</div>
                </div>
              </div>
            )}

            {/* Calendar View - 3 Column Card Layout */}
            {exams.length > 0 && getUpcomingExamSubjects().length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Exam Calendar
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({getUpcomingExamSubjects().length} upcoming)
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUpcomingExamSubjects().map((examSubject, i) => {
                    const daysLeft = getDaysUntil(examSubject.date);
                    const totalChapters = examSubject.chapters.length;
                    const completedChapters = examSubject.chapters.filter(c => c.status === 'completed').length;
                    const startedChapters = examSubject.chapters.filter(c => c.status === 'started').length;
                    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
                    
                    return (
                      <div 
                        key={i} 
                        className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                          daysLeft <= 3 ? 'border-red-300 bg-red-50' :
                          daysLeft <= 7 ? 'border-yellow-300 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        {/* Header with Date Badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm mb-1">{examSubject.subject}</h4>
                            <p className="text-xs text-gray-600">{examSubject.examName}</p>
                          </div>
                          <div className={`text-center min-w-[50px] rounded-lg p-2 ${
                            daysLeft <= 3 ? 'bg-red-600' :
                            daysLeft <= 7 ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}>
                            <div className="text-xs text-white font-semibold">
                              {new Date(examSubject.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xl font-bold text-white">
                              {new Date(examSubject.date).getDate()}
                            </div>
                            <div className="text-xs text-white font-medium">
                              {new Date(examSubject.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        </div>

                        {/* Days Countdown */}
                        <div className={`text-center py-2 rounded-lg mb-3 font-bold ${
                          daysLeft === 0 ? 'bg-red-100 text-red-700 text-base' :
                          daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {daysLeft === 0 ? '🔥 Today!' : daysLeft === 1 ? `Tomorrow` : `${daysLeft} days left`}
                        </div>

                        {/* Progress Bar */}
                        {totalChapters > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                              <span className="font-semibold">Progress</span>
                              <span className="font-bold">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress === 100 ? 'bg-green-500' :
                                  progress >= 50 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex gap-2">
                                <span className="text-green-600">✓ {completedChapters}</span>
                                <span className="text-yellow-600">⚡ {startedChapters}</span>
                                <span className="text-gray-500">○ {totalChapters - completedChapters - startedChapters}</span>
                              </div>
                              <span className="text-gray-600 font-medium">{totalChapters} ch.</span>
                            </div>
                          </div>
                        )}

                        {/* Date */}
                        <div className="text-xs text-gray-600 text-center pt-2 border-t border-gray-200">
                          {formatDateWithDay(examSubject.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {getUpcomingExamSubjects().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming exams scheduled</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Exams</h2>
                <button
                  onClick={() => setShowAddExam(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Exam
                </button>
              </div>

              {showAddExam && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Exam Name (e.g., First Mid-term Exams)"
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    className="w-full p-2 border rounded-lg font-semibold"
                  />
                  
                  <div className="border rounded-lg p-3 bg-white">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Add Subjects to Exam</label>
                    
                    <div className="space-y-2 mb-3">
                      <select
                        value={newExamSubject.subject}
                        onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="date"
                        value={newExamSubject.date}
                        onChange={(e) => setNewExamSubject({ ...newExamSubject, date: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Exam date"
                      />
                      
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Chapters to study:</label>
                        
                        {/* Quick select from subject's chapters */}
                        {newExamSubject.subject && (() => {
                          const selectedSubject = subjects.find(s => s.name === newExamSubject.subject);
                          const availableChapters = selectedSubject?.chapters?.filter(
                            ch => !newExamSubject.chapters.some(ec => ec.name === ch)
                          ) || [];
                          
                          return availableChapters.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  setNewExamSubject({
                                    ...newExamSubject,
                                    chapters: [...newExamSubject.chapters, { name: e.target.value, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                  });
                                  e.target.value = '';
                                }
                              }}
                              className="w-full p-2 border rounded-lg mb-2 bg-white"
                            >
                              <option value="">Quick add from {newExamSubject.subject}...</option>
                              {availableChapters.map((ch, i) => (
                                <option key={i} value={ch}>{ch}</option>
                              ))}
                            </select>
                          );
                        })()}
                        
                        {/* Manual input */}
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Or enter chapter manually"
                            value={examChapterInput}
                            onChange={(e) => setExamChapterInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && examChapterInput.trim()) {
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                });
                                setExamChapterInput('');
                              }
                            }}
                            className="flex-1 p-2 border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => {
                              if (examChapterInput.trim()) {
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                });
                                setExamChapterInput('');
                              }
                            }}
                            className="px-3 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                          >
                            Add
                          </button>
                        </div>
                        {newExamSubject.chapters.length > 0 && (
                          <div className="space-y-1">
                            {newExamSubject.chapters.map((ch, idx) => (
                              <div key={idx} className="flex items-center justify-between p-1 bg-gray-50 rounded text-sm">
                                <span>{ch.name}</span>
                                <button
                                  onClick={() => {
                                    setNewExamSubject({
                                      ...newExamSubject,
                                      chapters: newExamSubject.chapters.filter((_, i) => i !== idx)
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <textarea
                        placeholder="Notes/Key points (optional)"
                        value={newExamSubject.keyPoints}
                        onChange={(e) => setNewExamSubject({ ...newExamSubject, keyPoints: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        rows="2"
                      />
                      
                      <button
                        onClick={addSubjectToExam}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                        disabled={!newExamSubject.subject || !newExamSubject.date}
                      >
                        + Add Subject to Exam
                      </button>
                    </div>
                    
                    {newExam.subjects.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 block">Subjects added ({newExam.subjects.length}):</label>
                        {newExam.subjects.map((subj, i) => (
                          <div key={i} className="flex items-start justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{subj.subject}</div>
                              <div className="text-xs text-gray-600">{subj.date}</div>
                              {subj.chapters && subj.chapters.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Chapters: {subj.chapters.map(ch => ch.name).join(', ')}
                                </div>
                              )}
                              {subj.keyPoints && <div className="text-xs text-gray-500 mt-1 italic">{subj.keyPoints}</div>}
                            </div>
                            <button
                              onClick={() => removeSubjectFromExam(i)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={addExam}
                      disabled={!newExam.name.trim() || newExam.subjects.length === 0}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Create Exam
                    </button>
                    <button
                      onClick={() => {
                        setShowAddExam(false);
                        setNewExam({ name: '', subjects: [] });
                        setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
                        setExamChapterInput('');
                      }}
                      className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {getUpcomingExams().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming exams</p>
              ) : (
                <div className="space-y-4">
                  {getUpcomingExams().map(exam => {
                    const progress = getExamProgress(exam);
                    
                    return (
                      <div key={exam.id} className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => !editingExam && setMinimizedExams(prev => ({
                        ...prev,
                        [exam.id]: !prev[exam.id]
                      }))}>
                        {/* Exam Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {editingExam === exam.id ? (
                              <input
                                type="text"
                                value={exam.name}
                                onChange={(e) => updateExam(exam.id, { name: e.target.value })}
                                className="w-full p-2 border rounded-lg bg-white font-bold text-lg"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h3 className="text-xl font-bold text-gray-600">{exam.name}</h3>
                            )}
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {editingExam === exam.id ? (
                              <button
                                onClick={() => setEditingExam(null)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Update Exam
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingExam(exam.id);
                                  // Auto-expand exam when editing
                                  setMinimizedExams(prev => ({ ...prev, [exam.id]: false }));
                                }}
                                className="text-indigo-600 hover:text-indigo-700"
                                title="Edit exam"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setMinimizedExams(prev => ({
                                ...prev,
                                [exam.id]: !prev[exam.id]
                              }))}
                              className="text-blue-600 hover:text-blue-700"
                              title={minimizedExams[exam.id] ? 'Expand exam' : 'Minimize exam'}
                            >
                              {minimizedExams[exam.id] ? (
                                <Plus className="w-4 h-4" style={{ transform: 'rotate(90deg)' }} />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => deleteExam(exam.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete exam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Overall Progress */}
                        {!minimizedExams[exam.id] && progress.total > 0 && (
                          <div className="mb-4 p-3 bg-white rounded-lg">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span className="font-semibold">Overall Progress</span>
                              <span className="font-bold">{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <div className="flex gap-3 text-xs">
                              <span className="text-green-600">✓ {progress.completed} Done</span>
                              <span className="text-yellow-600">⚡ {progress.started} Started</span>
                              <span className="text-gray-600">○ {progress.pending} Pending</span>
                            </div>
                          </div>
                        )}

                        {/* Subjects List */}
                        {!minimizedExams[exam.id] && (
                        <div className="space-y-3">
                          {exam.subjects && exam.subjects.map((subject, subjectIdx) => {
                            const daysLeft = getDaysUntil(subject.date);
                            const subjectProgress = {
                              completed: subject.chapters?.filter(c => c.status === 'completed').length || 0,
                              started: subject.chapters?.filter(c => c.status === 'started').length || 0,
                              pending: subject.chapters?.filter(c => c.status === 'pending').length || 0,
                              total: subject.chapters?.length || 0
                            };
                            subjectProgress.percentage = subjectProgress.total > 0 
                              ? Math.round((subjectProgress.completed / subjectProgress.total) * 100) 
                              : 0;

                            return (
                              <div key={subjectIdx} className="bg-white rounded-lg p-3 border border-gray-200">
                                {/* Subject Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-gray-800">{subject.subject}</h4>
                                      <div className={`text-sm font-bold ${daysLeft <= 3 ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                                      </div>
                                    </div>
                                    {editingExam === exam.id ? (
                                      <input
                                        type="date"
                                        value={subject.date}
                                        onChange={(e) => {
                                          const updatedSubjects = [...exam.subjects];
                                          updatedSubjects[subjectIdx] = { ...subject, date: e.target.value };
                                          updateExam(exam.id, { subjects: updatedSubjects });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm p-1 border rounded mt-1"
                                      />
                                    ) : (
                                      <p className="text-xs text-gray-600">{formatDateWithDay(subject.date)}</p>
                                    )}
                                  </div>
                                  {editingExam === exam.id && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete ${subject.subject} from this exam?`)) {
                                          deleteSubjectFromExam(exam.id, subjectIdx);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                      title="Delete subject"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                {/* Subject Progress */}
                                {subjectProgress.total > 0 && (
                                  <div className="mb-2">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                      <div
                                        className="bg-green-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${subjectProgress.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Chapters */}
                                {subject.chapters && subject.chapters.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-xs font-semibold text-gray-600 mb-1">Chapters:</div>
                                    <div className="space-y-1">
                                      {subject.chapters.map((chapter, chapterIdx) => {
                                        const revisionsNeeded = chapter.revisionsNeeded ?? 0;
                                        const revisionsCompleted = chapter.revisionsCompleted ?? 0;
                                        
                                        return (
                                          <div key={chapterIdx} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded">
                                            <div className="flex-1 text-sm">{chapter.name}</div>
                                            
                                            {/* Revision Counter - Always visible if revisions needed */}
                                            {revisionsNeeded > 0 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (!editingExam) {
                                                    if (e.shiftKey && revisionsCompleted > 0) {
                                                      // Shift+Click to decrement
                                                      decrementChapterRevision(exam.id, subjectIdx, chapterIdx);
                                                    } else if (revisionsCompleted < revisionsNeeded) {
                                                      // Regular click to increment
                                                      incrementChapterRevision(exam.id, subjectIdx, chapterIdx);
                                                    }
                                                  }
                                                }}
                                                onContextMenu={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  if (!editingExam && revisionsCompleted > 0) {
                                                    // Right-click to decrement
                                                    decrementChapterRevision(exam.id, subjectIdx, chapterIdx);
                                                  }
                                                }}
                                                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                                  revisionsCompleted >= revisionsNeeded 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-orange-100 text-orange-700 cursor-pointer hover:opacity-80'
                                                }`}
                                                title={editingExam ? 'Set revision count in edit mode' : 'Click to add • Right-click or Shift+Click to remove'}
                                                disabled={editingExam === exam.id}
                                              >
                                                📚 {revisionsCompleted}/{revisionsNeeded}
                                              </button>
                                            )}
                                            
                                            {/* Edit Mode: Show all controls */}
                                            {editingExam === exam.id ? (
                                              <>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  max="10"
                                                  value={revisionsNeeded}
                                                  onChange={(e) => {
                                                    const newNeeded = parseInt(e.target.value) || 0;
                                                    const newCompleted = Math.min(revisionsCompleted, newNeeded);
                                                    updateChapterRevisions(exam.id, subjectIdx, chapterIdx, newNeeded, newCompleted);
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="w-12 text-xs px-1 py-1 border rounded text-center"
                                                  placeholder="Rev"
                                                  title="Number of revisions needed"
                                                />
                                                <select
                                                  value={chapter.status}
                                                  onChange={(e) => updateChapterStatus(exam.id, subjectIdx, chapterIdx, e.target.value)}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                                    chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                  }`}
                                                >
                                                  <option value="pending">Pending</option>
                                                  <option value="started">Started</option>
                                                  <option value="completed">Completed</option>
                                                </select>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChapterFromExamSubject(exam.id, subjectIdx, chapterIdx);
                                                  }}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const statuses = ['pending', 'started', 'completed'];
                                                  const currentIndex = statuses.indexOf(chapter.status);
                                                  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                                  updateChapterStatus(exam.id, subjectIdx, chapterIdx, nextStatus);
                                                }}
                                                className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                                  chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                  chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-gray-100 text-gray-600'
                                                }`}
                                                title="Click to cycle through statuses"
                                              >
                                                {chapter.status}
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Add Chapter */}
                                {editingExam === exam.id && (
                                  <div className="space-y-2 mb-2">
                                    {/* Quick select from subject's chapters */}
                                    {(() => {
                                      const subjectData = subjects.find(s => s.name === subject.subject);
                                      const availableChapters = subjectData?.chapters?.filter(
                                        ch => !subject.chapters?.some(ec => ec.name === ch)
                                      ) || [];
                                      
                                      return availableChapters.length > 0 && (
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">Quick add from {subject.subject}:</label>
                                          <select
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                addChapterToExamSubject(exam.id, subjectIdx, e.target.value);
                                                e.target.value = '';
                                              }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full p-1.5 text-sm border rounded bg-white"
                                          >
                                            <option value="">Select a chapter...</option>
                                            {availableChapters.map((ch, i) => (
                                              <option key={i} value={ch}>{ch}</option>
                                            ))}
                                          </select>
                                        </div>
                                      );
                                    })()}
                                    
                                    {/* Manual chapter input */}
                                    <div>
                                      <label className="text-xs text-gray-500 block mb-1">Or add manually:</label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Chapter name..."
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                              addChapterToExamSubject(exam.id, subjectIdx, e.target.value.trim());
                                              e.target.value = '';
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="flex-1 p-1.5 text-sm border rounded"
                                        />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const input = e.target.previousSibling;
                                            if (input.value.trim()) {
                                              addChapterToExamSubject(exam.id, subjectIdx, input.value.trim());
                                              input.value = '';
                                            }
                                          }}
                                          className="px-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Notes/Key Points */}
                                {(editingExam === exam.id || subject.keyPoints) && (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">Notes:</div>
                                    {editingExam === exam.id ? (
                                      <textarea
                                        value={subject.keyPoints || ''}
                                        onChange={(e) => {
                                          const updatedSubjects = [...exam.subjects];
                                          updatedSubjects[subjectIdx] = { ...subject, keyPoints: e.target.value };
                                          updateExam(exam.id, { subjects: updatedSubjects });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Add key points or notes..."
                                        className="w-full p-2 text-sm border rounded bg-white"
                                        rows="2"
                                      />
                                    ) : (
                                      subject.keyPoints && (
                                        <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                                          {subject.keyPoints}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        )}

                        {/* Add New Subject Section - Only visible when editing */}
                        {editingExam === exam.id && (
                          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-gray-800">Add New Subject to This Exam</span>
                            </div>
                            
                            <div className="space-y-3">
                              <select
                                value={newExamSubject.subject}
                                onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full p-2 border rounded-lg text-sm"
                              >
                                <option value="">Select a subject...</option>
                                {subjects.map(s => (
                                  <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                              
                              <input
                                type="date"
                                value={newExamSubject.date}
                                onChange={(e) => setNewExamSubject({ ...newExamSubject, date: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full p-2 border rounded-lg text-sm"
                                placeholder="Exam date"
                              />
                              
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-2">Chapters:</label>
                                
                                {/* Quick select from subject's chapters */}
                                {newExamSubject.subject && (() => {
                                  const selectedSubject = subjects.find(s => s.name === newExamSubject.subject);
                                  const availableChapters = selectedSubject?.chapters?.filter(
                                    ch => !newExamSubject.chapters.some(ec => ec.name === ch)
                                  ) || [];
                                  
                                  return availableChapters.length > 0 && (
                                    <div className="mb-2">
                                      <label className="text-xs text-gray-500 block mb-1">Quick add from {newExamSubject.subject}:</label>
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            setNewExamSubject({
                                              ...newExamSubject,
                                              chapters: [...newExamSubject.chapters, { name: e.target.value, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                            });
                                            e.target.value = '';
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full p-1.5 border rounded-lg bg-white text-sm"
                                      >
                                        <option value="">Select a chapter...</option>
                                        {availableChapters.map((ch, i) => (
                                          <option key={i} value={ch}>{ch}</option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })()}
                                
                                {/* Manual input */}
                                <div className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Or enter chapter manually..."
                                    value={examChapterInput}
                                    onChange={(e) => setExamChapterInput(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && examChapterInput.trim()) {
                                        setNewExamSubject({
                                          ...newExamSubject,
                                          chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                        });
                                        setExamChapterInput('');
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 p-2 border rounded-lg text-sm"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (examChapterInput.trim()) {
                                        setNewExamSubject({
                                          ...newExamSubject,
                                          chapters: [...newExamSubject.chapters, { name: examChapterInput, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0 }]
                                        });
                                        setExamChapterInput('');
                                      }
                                    }}
                                    className="px-3 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                  >
                                    Add
                                  </button>
                                </div>
                                
                                {/* Display added chapters */}
                                {newExamSubject.chapters.length > 0 && (
                                  <div className="space-y-1 mb-2">
                                    {newExamSubject.chapters.map((ch, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded text-sm border">
                                        <span className="text-gray-700">{ch.name}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewExamSubject({
                                              ...newExamSubject,
                                              chapters: newExamSubject.chapters.filter((_, i) => i !== idx)
                                            });
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <textarea
                                placeholder="Notes/Key points (optional)..."
                                value={newExamSubject.keyPoints}
                                onChange={(e) => setNewExamSubject({ ...newExamSubject, keyPoints: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full p-2 border rounded-lg text-sm"
                                rows="2"
                              />
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (newExamSubject.subject && newExamSubject.date) {
                                    const updatedSubjects = [...exam.subjects, newExamSubject];
                                    updateExam(exam.id, { subjects: updatedSubjects });
                                    setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
                                    setExamChapterInput('');
                                  }
                                }}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                                disabled={!newExamSubject.subject || !newExamSubject.date}
                              >
                                + Add {newExamSubject.subject ? `"${newExamSubject.subject}"` : 'Subject'} to {exam.name}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-4">
            {/* 7-Day Activity Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Last 7 Days Activity
              </h2>
              
              <div className="flex items-end justify-between gap-2 h-48">
                {getLastNDays(7).map((day, i) => {
                  const percentage = Math.min((day.completedTime / 180) * 100, 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t relative flex-1 flex flex-col justify-end">
                        <div
                          className={`w-full rounded-t transition-all ${
                            percentage >= 100 ? 'bg-green-500' :
                            percentage >= 50 ? 'bg-indigo-500' :
                            percentage > 0 ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}
                          style={{ height: `${Math.max(percentage, 5)}%` }}
                        >
                          {day.completedTime > 0 && (
                            <div className="text-xs text-white text-center pt-1 font-semibold">
                              {day.completedTime}m
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-600">{day.dayName}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Goal met (180m)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span>50%+ done</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Some activity</span>
                </div>
              </div>
            </div>

            {/* Subject Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Performance</h2>
              
              {getSubjectAnalytics().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No subjects added yet</p>
              ) : (
                <div className="space-y-4">
                  {getSubjectAnalytics()
                    .sort((a, b) => b.totalTime - a.totalTime)
                    .map((subject, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded ${
                              subject.recentActivity > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {subject.recentActivity > 0 
                                ? `${subject.recentActivity} tasks this week` 
                                : 'No recent activity'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{subject.totalTime}</div>
                            <div className="text-xs text-gray-600">Total mins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{subject.completedTasks}</div>
                            <div className="text-xs text-gray-600">Tasks done</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{subject.completionRate}%</div>
                            <div className="text-xs text-gray-600">Completion</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${subject.completionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Active Subjects */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Most Active (Last 7 Days)
                </h3>
                {getMostActiveSubjects().length === 0 ? (
                  <p className="text-gray-500 text-sm">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {getMostActiveSubjects().map((subject, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium text-gray-800">{subject.name}</span>
                        <span className="text-xs text-green-700 font-semibold">
                          {subject.recentActivity} tasks
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Neglected Subjects */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Needs Attention
                </h3>
                {getNeglectedSubjects().length === 0 ? (
                  <p className="text-gray-500 text-sm">All subjects active!</p>
                ) : (
                  <div className="space-y-2">
                    {getNeglectedSubjects().map((subject, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm font-medium text-gray-800">{subject.name}</span>
                        <span className="text-xs text-red-700 font-semibold">
                          No activity (3+ days)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-3">Study Consistency</h3>
              <div className="flex gap-1">
                {getLastNDays(14).map((day, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded ${
                      day.completedTime >= 180 ? 'bg-green-500' :
                      day.completedTime >= 90 ? 'bg-indigo-400' :
                      day.completedTime > 0 ? 'bg-yellow-300' :
                      'bg-gray-200'
                    }`}
                    title={`${day.dayName}: ${day.completedTime} mins`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-600 text-center mt-2">
                Last 14 days
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                  Calendar
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newMonth = calendarMonth.month === 0 ? 11 : calendarMonth.month - 1;
                      const newYear = calendarMonth.month === 0 ? calendarMonth.year - 1 : calendarMonth.year;
                      setCalendarMonth({ year: newYear, month: newMonth });
                      setSelectedDate(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <div className="text-xl font-bold text-gray-800 min-w-[200px] text-center">
                    {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const newMonth = calendarMonth.month === 11 ? 0 : calendarMonth.month + 1;
                      const newYear = calendarMonth.month === 11 ? calendarMonth.year + 1 : calendarMonth.year;
                      setCalendarMonth({ year: newYear, month: newMonth });
                      setSelectedDate(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });
                      setSelectedDate(getTodayDateIST());
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-600 py-2 bg-gray-50 rounded-lg">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {(() => {
                  const firstDay = new Date(calendarMonth.year, calendarMonth.month, 1);
                  const lastDay = new Date(calendarMonth.year, calendarMonth.month + 1, 0);
                  const startingDayOfWeek = firstDay.getDay();
                  const daysInMonth = lastDay.getDate();
                  
                  const days = [];
                  const today = getTodayDateIST();
                  
                  // Add empty cells for days before month starts
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 rounded-lg"></div>);
                  }
                  
                  // Add cells for each day of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = dateStr === today;
                    const dayOfWeek = new Date(calendarMonth.year, calendarMonth.month, day).getDay();
                    
                    // Get events for this date
                    const dayReminders = reminders.filter(r => r.date === dateStr);
                    const dayRecurringReminders = recurringReminders.filter(r => r.days && r.days.includes(dayOfWeek));
                    const dayExams = [];
                    
                    exams.forEach(exam => {
                      exam.subjects?.forEach(subject => {
                        if (subject.date === dateStr) {
                          dayExams.push({
                            examName: exam.name,
                            subject: subject.subject
                          });
                        }
                      });
                    });
                    
                    days.push(
                      <div 
                        key={day} 
                        onClick={() => setSelectedDate(dateStr)}
                        className={`min-h-[120px] p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedDate === dateStr
                            ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-500 shadow-lg ring-2 ring-purple-300'
                            : isToday 
                            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 shadow-md hover:shadow-lg' 
                            : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`text-sm font-bold mb-1 ${
                          isToday ? 'text-indigo-600' : 'text-gray-700'
                        }`}>
                          {day}
                          {isToday && <span className="ml-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Today</span>}
                        </div>
                        
                        <div className="space-y-1 overflow-y-auto max-h-[90px]">
                          {/* Exams */}
                          {dayExams.map((exam, idx) => (
                            <div 
                              key={`exam-${idx}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-red-100 to-pink-100 border border-red-300 rounded text-red-700 font-semibold truncate"
                              title={`${exam.examName} - ${exam.subject}`}
                            >
                              📝 {exam.subject}
                            </div>
                          ))}
                          
                          {/* One-time Reminders */}
                          {dayReminders.map(reminder => (
                            <div 
                              key={`reminder-${reminder.id}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded text-amber-700 font-semibold truncate"
                              title={reminder.title}
                            >
                              🔔 {reminder.title}
                            </div>
                          ))}
                          
                          {/* Recurring Reminders */}
                          {dayRecurringReminders.map(reminder => (
                            <div 
                              key={`recurring-${reminder.id}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded text-blue-700 font-semibold truncate"
                              title={`${reminder.title} (${convertTo12Hour(reminder.time)}-${convertTo12Hour(reminder.end_time)})`}
                            >
                              🔁 {reminder.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-100 to-pink-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-700 font-medium">Exams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded"></div>
                  <span className="text-sm text-gray-700 font-medium">Reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-700 font-medium">Recurring</span>
                </div>
              </div>
            </div>

            {/* Selected Day Events */}
            {selectedDate && (() => {
              const selectedDateObj = new Date(selectedDate);
              const dayOfWeek = selectedDateObj.getDay();
              const isToday = selectedDate === getTodayDateIST();
              
              // Get events for selected date
              const dayReminders = reminders.filter(r => r.date === selectedDate);
              const dayRecurringReminders = recurringReminders.filter(r => r.days && r.days.includes(dayOfWeek));
              const dayExams = [];
              
              exams.forEach(exam => {
                exam.subjects?.forEach(subject => {
                  if (subject.date === selectedDate) {
                    dayExams.push({
                      examId: exam.id,
                      examName: exam.name,
                      subject: subject.subject,
                      chapters: subject.chapters || [],
                      keyPoints: subject.keyPoints
                    });
                  }
                });
              });
              
              const hasEvents = dayExams.length > 0 || dayReminders.length > 0 || dayRecurringReminders.length > 0;
              
              return (
                <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      {selectedDateObj.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {isToday && <span className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-full">Today</span>}
                    </h3>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      title="Close"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  {!hasEvents ? (
                    <p className="text-gray-500 text-center py-8 italic">No events on this day</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Exams Section */}
                      {dayExams.length > 0 && (
                        <div>
                          <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                            <span className="text-lg">📝</span> Exams ({dayExams.length})
                          </h4>
                          <div className="space-y-3">
                            {dayExams.map((exam, idx) => (
                              <div 
                                key={idx}
                                className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl"
                              >
                                <div className="font-bold text-red-800 text-lg">{exam.examName}</div>
                                <div className="text-red-700 font-semibold mt-1">Subject: {exam.subject}</div>
                                {exam.chapters && exam.chapters.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm text-red-600 font-semibold mb-1">Chapters:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {exam.chapters.map((ch, chIdx) => (
                                        <span 
                                          key={chIdx}
                                          className="text-xs px-2 py-1 bg-white border border-red-300 rounded-full text-red-700"
                                        >
                                          {ch.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {exam.keyPoints && (
                                  <div className="mt-2 text-sm text-red-700 bg-white p-2 rounded border border-red-200">
                                    <span className="font-semibold">Key Points:</span> {exam.keyPoints}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* One-Time Reminders Section */}
                      {dayReminders.length > 0 && (
                        <div>
                          <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                            <span className="text-lg">🔔</span> Reminders ({dayReminders.length})
                          </h4>
                          <div className="space-y-2">
                            {dayReminders.map(reminder => (
                              <div 
                                key={reminder.id}
                                className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl"
                              >
                                <div className="font-bold text-amber-800 text-lg">{reminder.title}</div>
                                {reminder.description && (
                                  <div className="mt-2 text-sm text-amber-700 whitespace-pre-wrap">
                                    {reminder.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Recurring Reminders Section */}
                      {dayRecurringReminders.length > 0 && (
                        <div>
                          <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                            <span className="text-lg">🔁</span> Recurring Reminders ({dayRecurringReminders.length})
                          </h4>
                          <div className="space-y-2">
                            {dayRecurringReminders.map(reminder => (
                              <div 
                                key={reminder.id}
                                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
                              >
                                <div className="font-bold text-blue-800 text-lg">{reminder.title}</div>
                                <div className="text-blue-700 font-semibold mt-1">
                                  🕐 {convertTo12Hour(reminder.time)} - {convertTo12Hour(reminder.end_time)}
                                </div>
                                {reminder.description && (
                                  <div className="mt-2 text-sm text-blue-700 whitespace-pre-wrap">
                                    {reminder.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* School Documents View */}
        {activeView === 'docs' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">School Documents</h2>
              <p className="text-gray-600 mb-6">
                Upload and manage your timetable and other important school documents.
              </p>
              <SchoolDocuments profileId={activeProfile?.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTrackerApp;













