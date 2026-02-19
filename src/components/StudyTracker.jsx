import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, CheckCircle, Circle, Mic, X, Book, Target, TrendingUp, AlertCircle, LogOut, User, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Repeat, FileText, Flame, Zap, Check, Trophy, Star, Sparkles, ThumbsUp, Gift, BookOpen, BarChart3, LineChart, Home, GraduationCap, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SchoolDocuments from './SchoolDocuments';
import Dashboard from './Dashboard';
import { useProfiles, useReminders } from '../hooks';
import { getTodayDateIST, getISTNow, convertTo12Hour, getDaysUntil } from '../utils/helpers';

const StudyTrackerApp = ({ session }) => {
  // Use custom hooks for profile and reminder management
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    showAddProfile,
    setShowAddProfile,
    newProfileName,
    setNewProfileName,
    newProfileClass,
    setNewProfileClass,
    showProfileModal,
    setShowProfileModal,
    accountName,
    editingAccountName,
    setEditingAccountName,
    tempAccountName,
    setTempAccountName,
    profileTab,
    setProfileTab,
    editingProfile,
    setEditingProfile,
    editProfileData,
    setEditProfileData,
    deletingProfileId,
    setDeletingProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    saveAccountName,
    startEditProfile: _startEditProfile,
    cancelEditProfile: _cancelEditProfile
  } = useProfiles(session);

  const [_loading, _setLoading] = useState(true);
  
  // Use custom hooks for reminder management
  const {
    reminders,
    recurringReminders,
    newReminder,
    setNewReminder,
    newRecurringReminder,
    setNewRecurringReminder,
    reminderType,
    setReminderType,
    editingReminder,
    setEditingReminder,
    editReminderData,
    setEditReminderData,
    editingRecurringReminder,
    setEditingRecurringReminder,
    addReminder,
    addRecurringReminder,
    updateReminder,
    deleteReminder,
    updateRecurringReminder,
    deleteRecurringReminder,
    startEditReminder,
    startEditRecurringReminder
  } = useReminders(activeProfile);
  
  // Shared activities across all kids
  const [sharedActivities, setSharedActivities] = useState([]);
  const [showSharedActivities, setShowSharedActivities] = useState(false);
  const [newSharedActivity, setNewSharedActivity] = useState({ title: '', description: '', category: 'indoor' });
  
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [standardActivities, setStandardActivities] = useState([
    'Read chapter',
    'Practice problems',
    'Review notes',
    'Watch video',
    'Take quiz'
  ]);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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
    instructions: '',
    taskType: ''
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
  const [editingExam, setEditingExam] = useState(null);
  const [minimizedExams, setMinimizedExams] = useState({});
  const [showPreviousExams, setShowPreviousExams] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState({});
  const [viewingSubject, setViewingSubject] = useState(null);
  const [profileSwitched, setProfileSwitched] = useState(false);
  const [switchedProfileName, setSwitchedProfileName] = useState('');
  const [notificationsMinimized, setNotificationsMinimized] = useState(false);
  const [showTrackingModeNotification, setShowTrackingModeNotification] = useState(false);
  const [pendingTrackingModeProfile, setPendingTrackingModeProfile] = useState(null);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // Load data from storage on mount
  useEffect(() => {
    const init = async () => {
      _setLoading(true);
      await loadSharedActivities();
      
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
        // Clear state first to prevent showing old data
        setSubjects([]);
        setTasks([]);
        setExams([]);
        setViewingSubject(null);
        setMinimizedExams({});
        await loadProfileData(activeProfile.id);
        _setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile]);

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
      // Load ALL data from Supabase for leaderboard to work correctly
      // Dashboard will filter by profile as needed
      const [subjectsResult, tasksResult, examsResult, standardResult] = await Promise.all([
        supabase.from('subjects').select('*'), // Load all subjects
        supabase.from('tasks').select('*'),     // Load all tasks
        supabase.from('exams').select('*'),     // Load all exams
        supabase.from('standard_activities').select('*').eq('profile_id', profileId) // Profile-specific activities
      ]);

      setSubjects(subjectsResult.data || []);
      
      // Process task rollover for incomplete tasks from previous days
      // Only process for the active profile
      const tasksData = tasksResult.data || [];
      const profileTasks = tasksData.filter(t => t.profile_id === profileId);
      const updatedProfileTasks = await processTaskRollover(profileTasks, profileId);
      // Merge updated profile tasks with other profiles' tasks
      const otherTasks = tasksData.filter(t => t.profile_id !== profileId);
      setTasks([...updatedProfileTasks, ...otherTasks]);
      
      const examsData = examsResult.data || [];
      console.log('📚 Loading exams from database:', examsData);
      setExams(examsData);
      // Initialize all exams as minimized
      const minimizedState = {};
      examsData.forEach(exam => {
        minimizedState[exam.id] = true;
      });
      setMinimizedExams(minimizedState);
      
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

  const switchProfile = (profile) => {
    if (activeProfile?.id === profile.id) return; // Don't switch to same profile
    
    _setLoading(true);
    // Clear all data immediately to prevent showing old profile's data
    setSubjects([]);
    setTasks([]);
    setExams([]);
    setViewingSubject(null);
    setMinimizedExams({});
    setActiveProfile(profile);
    setActiveView('dashboard');
    
    // Show profile switch indicator
    setSwitchedProfileName(profile.name);
    setProfileSwitched(true);
    setTimeout(() => setProfileSwitched(false), 2500);
    
    // Check if tracking mode is set, if not show notification
    if (!profile.chapter_tracking_mode) {
      setPendingTrackingModeProfile(profile);
      setShowTrackingModeNotification(true);
    }
  };

  // Toggle chapter completion (Smart mode)
  const toggleChapterCompletion = async (subjectId, chapterIndex) => {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const normalizedSubject = normalizeSubjectChapters(subject);
      const chapters = [...normalizedSubject.chapters];
      const chapter = chapters[chapterIndex];
      
      chapters[chapterIndex] = {
        ...chapter,
        completed: !chapter.completed,
        completedDate: !chapter.completed ? getTodayDateIST() : null
      };
      
      const { error } = await supabase
        .from('subjects')
        .update({ chapters })
        .eq('id', subjectId);
      
      if (error) throw error;
      
      const updated = subjects.map(s => 
        s.id === subjectId ? { ...s, chapters } : s
      );
      setSubjects(updated);
      if (viewingSubject?.id === subjectId) {
        setViewingSubject({ ...viewingSubject, chapters });
      }
    } catch (error) {
      console.error('Error toggling chapter completion:', error);
    }
  };

  // Update subject chapter status (Comprehensive mode)
  const updateSubjectChapterStatus = async (subjectId, chapterIndex, newStatus) => {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const normalizedSubject = normalizeSubjectChapters(subject);
      const chapters = [...normalizedSubject.chapters];
      
      chapters[chapterIndex] = {
        ...chapters[chapterIndex],
        status: newStatus,
        lastStudied: newStatus !== 'pending' ? getTodayDateIST() : chapters[chapterIndex].lastStudied
      };
      
      const { error } = await supabase
        .from('subjects')
        .update({ chapters })
        .eq('id', subjectId);
      
      if (error) throw error;
      
      const updated = subjects.map(s => 
        s.id === subjectId ? { ...s, chapters } : s
      );
      setSubjects(updated);
      if (viewingSubject?.id === subjectId) {
        setViewingSubject({ ...viewingSubject, chapters });
      }
    } catch (error) {
      console.error('Error updating subject chapter status:', error);
    }
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

  // Handle chapter tracking mode selection
  const selectTrackingMode = async (mode) => {
    if (!pendingTrackingModeProfile) return;
    
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ chapter_tracking_mode: mode })
        .eq('id', pendingTrackingModeProfile.id);
      
      if (error) throw error;
      
      // Update local profile state
      const updatedProfile = { ...pendingTrackingModeProfile, chapter_tracking_mode: mode };
      if (activeProfile?.id === pendingTrackingModeProfile.id) {
        setActiveProfile(updatedProfile);
      }
      
      // Close notification
      setShowTrackingModeNotification(false);
      setPendingTrackingModeProfile(null);
    } catch (error) {
      console.error('Error updating chapter tracking mode:', error);
    }
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

  // Normalize chapter data - convert strings to objects based on tracking mode
  const normalizeChapter = (chapterData, trackingMode = 'smart') => {
    // If already an object with required fields, return as is
    if (typeof chapterData === 'object' && chapterData.name) {
      return chapterData;
    }
    
    // Convert string to object based on tracking mode
    const chapterName = typeof chapterData === 'string' ? chapterData : chapterData.toString();
    
    if (trackingMode === 'comprehensive') {
      return {
        name: chapterName,
        status: 'pending',
        studyTime: 0,
        taskCount: 0,
        lastStudied: null,
        revisionsNeeded: 0,
        revisionsCompleted: 0
      };
    } else {
      // Smart mode
      return {
        name: chapterName,
        completed: false,
        completedDate: null,
        studyTime: 0,
        taskCount: 0,
        lastStudied: null
      };
    }
  };

  // Normalize all chapters for a subject
  const normalizeSubjectChapters = (subject) => {
    if (!subject.chapters || subject.chapters.length === 0) return subject;
    
    const trackingMode = activeProfile?.chapter_tracking_mode || 'smart';
    const normalizedChapters = subject.chapters.map(ch => normalizeChapter(ch, trackingMode));
    
    return { ...subject, chapters: normalizedChapters };
  };

  const addChapterToSubject = async (subjectId, chapterName) => {
    if (!chapterName || !chapterName.trim()) return;
    
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;
      
      const trackingMode = activeProfile?.chapter_tracking_mode || 'smart';
      const newChapter = normalizeChapter(chapterName.trim(), trackingMode);
      const updatedChapters = [...(subject.chapters || []), newChapter];
      
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

  const profileSubjects = activeProfile
    ? subjects.filter(s => s.profile_id === activeProfile.id)
    : [];

  // Filter tasks for active profile only
  // DEBUG: Log types to identify filtering issue
  if (activeProfile && tasks.length > 0) {
    console.log('🔍 Profile filtering debug:', {
      activeProfileId: activeProfile.id,
      activeProfileIdType: typeof activeProfile.id,
      sampleTaskProfileId: tasks[0]?.profile_id,
      sampleTaskProfileIdType: typeof tasks[0]?.profile_id,
      totalTasks: tasks.length,
      matchingTasks: tasks.filter(t => t.profile_id === activeProfile.id).length,
      // eslint-disable-next-line eqeqeq
      looseMatchingTasks: tasks.filter(t => t.profile_id == activeProfile.id).length
    });
  }
  const profileTasks = activeProfile
    ? tasks.filter(t => t.profile_id === activeProfile.id)
    : [];

  // Filter exams for active profile only
  const profileExams = activeProfile
    ? exams.filter(e => e.profile_id === activeProfile.id)
    : [];

  const getProfileSubjectByName = (subjectName) => {
    if (!subjectName) return null;
    return profileSubjects.find(s => s.name === subjectName) || null;
  };

  const getChapterNamesForSubject = (subjectName) => {
    const subject = getProfileSubjectByName(subjectName);
    if (!subject?.chapters || !Array.isArray(subject.chapters)) return [];

    return subject.chapters
      .map((chapter) => {
        if (typeof chapter === 'string') return chapter;
        if (chapter && typeof chapter === 'object') return chapter.name || '';
        return '';
      })
      .filter((chapterName) => typeof chapterName === 'string' && chapterName.trim().length > 0);
  };

  // Task management
  const addTask = async () => {
    if (activeProfile && (newTask.subject || newTask.taskType)) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            profile_id: activeProfile.id,
            subject: newTask.subject || null,
            chapter: newTask.chapter || null,
            activity: newTask.activity.trim() || (newTask.taskType ? `${newTask.taskType} task` : 'General task'),
            duration: newTask.duration,
            date: newTask.date,
            completed: newTask.completed,
            instructions: newTask.instructions || null,
            task_type: newTask.taskType || null,
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

  const addSubjectToExistingExam = async (examId) => {
    const subjectName = (newExamSubject.subject || '').trim();
    if (!subjectName) return;

    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const fallbackDate = exam.date || exam.subjects?.[0]?.date || getTodayDateIST();
    const subjectDate = newExamSubject.date || fallbackDate;

    const normalizedSubject = {
      ...newExamSubject,
      subject: subjectName,
      date: subjectDate,
      chapters: (newExamSubject.chapters || [])
        .map((chapter) => {
          if (typeof chapter === 'string') {
            const chapterName = chapter.trim();
            if (!chapterName) return null;
            return {
              name: chapterName,
              status: 'pending',
              revisionsNeeded: 0,
              revisionsCompleted: 0
            };
          }

          if (chapter && typeof chapter === 'object') {
            const chapterName = (chapter.name || '').toString().trim();
            if (!chapterName) return null;
            return {
              ...chapter,
              name: chapterName,
              status: chapter.status || 'pending',
              revisionsNeeded: chapter.revisionsNeeded ?? 0,
              revisionsCompleted: chapter.revisionsCompleted ?? 0
            };
          }

          return null;
        })
        .filter(Boolean)
    };

    const updatedSubjects = [...(Array.isArray(exam.subjects) ? exam.subjects : []), normalizedSubject];
    await updateExam(examId, { subjects: updatedSubjects });

    setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '' });
    setExamChapterInput('');
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

  // Get current day of week in IST (0=Sun, 1=Mon, ..., 6=Sat)
  const getTodayDayOfWeekIST = () => {
    return getISTNow().getDay();
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
    return profileTasks.filter(t => t.date === today);
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
    
    return profileExams.filter(exam => {
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

  // Get past exams (all subjects have passed dates)
  const getPastExams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return profileExams.filter(exam => {
      if (!exam.subjects || exam.subjects.length === 0) return false;
      // Check if ALL subjects have past dates
      return exam.subjects.every(s => {
        const examDate = new Date(s.date);
        examDate.setHours(0, 0, 0, 0);
        return examDate < today;
      });
    }).sort((a, b) => {
      // Sort by most recent first
      const latestA = Math.max(...a.subjects.map(s => new Date(s.date)));
      const latestB = Math.max(...b.subjects.map(s => new Date(s.date)));
      return latestB - latestA;
    });
  };

  // Get all upcoming exam subjects (flattened for calendar view)
  const getUpcomingExamSubjects = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingSubjects = [];
    profileExams.forEach(exam => {
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
    return profileSubjects.map(subject => {
      const subjectTasks = profileTasks.filter(t => t.subject === subject.name);
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
    return profileTasks.filter(t => t.date === dateString);
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

    profileSubjects.forEach(subject => {
      const subjectTasks = profileTasks.filter(t => t.subject === subject.name);
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
    
    return profileSubjects.filter(subject => {
      const recentTasks = profileTasks.filter(t => 
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
    const urgentExams = profileExams.filter(exam => {
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
      const upcomingExam = profileExams.find(e => {
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
    profileExams.forEach(exam => {
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

  // Get exam analytics data
  const getExamAnalytics = () => {
    // Get all exams with marks data
    const examsWithMarks = exams
      .filter(exam => exam.subjects && Array.isArray(exam.subjects))
      .map(exam => ({
        ...exam,
        subjects: exam.subjects.filter(s => s.marks != null && s.marks >= 0)
      }))
      .filter(exam => exam.subjects.length > 0)
      .sort((a, b) => {
        // Sort by earliest subject date
        const dateA = Math.min(...a.subjects.map(s => new Date(s.date)));
        const dateB = Math.min(...b.subjects.map(s => new Date(s.date)));
        return dateA - dateB;
      });

    // Calculate average marks per exam
    const examAverages = examsWithMarks.map(exam => {
      const totalMarks = exam.subjects.reduce((sum, s) => sum + s.marks, 0);
      const average = exam.subjects.length > 0 ? Math.round(totalMarks / exam.subjects.length * 10) / 10 : 0;
      return {
        name: exam.name,
        average,
        subjectCount: exam.subjects.length,
        subjects: exam.subjects
      };
    });

    // Get subject-wise performance across exams
    const subjectPerformance = {};
    profileSubjects.forEach(subject => {
      const subjectMarks = [];
      examsWithMarks.forEach(exam => {
        const subjectData = exam.subjects.find(s => s.subject === subject.name);
        if (subjectData) {
          subjectMarks.push({
            examName: exam.name,
            marks: subjectData.marks,
            date: subjectData.date
          });
        }
      });
      
      if (subjectMarks.length > 0) {
        const totalMarks = subjectMarks.reduce((sum, m) => sum + m.marks, 0);
        const average = Math.round(totalMarks / subjectMarks.length * 10) / 10;
        subjectPerformance[subject.name] = {
          name: subject.name,
          exams: subjectMarks,
          average,
          trend: subjectMarks.length >= 2 ? subjectMarks[subjectMarks.length - 1].marks - subjectMarks[0].marks : 0
        };
      }
    });

    // Calculate overall average across all exams
    const allMarks = examsWithMarks.flatMap(exam => exam.subjects.map(s => s.marks));
    const overallAverage = allMarks.length > 0 ? Math.round(allMarks.reduce((sum, m) => sum + m, 0) / allMarks.length * 10) / 10 : 0;

    return {
      examsWithMarks,
      examAverages,
      subjectPerformance: Object.values(subjectPerformance),
      overallAverage,
      totalExamsWithMarks: examsWithMarks.length
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Top Navigation Bar - EduMaster style */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-amber-100/90 via-orange-100/90 to-rose-100/90 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Profile Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-rose-400 to-purple-500 p-1.5 sm:p-2 rounded-xl shadow-lg">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                Kannama
              </span>
              {/* Child Selector Dropdown */}
              {activeProfile && (
                <div className="relative">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm max-w-[60px] sm:max-w-none truncate">{activeProfile.name}</span>
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${showSidebar ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Rich Dropdown Menu */}
                  {showSidebar && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSidebar(false)} />
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-200 z-50 overflow-hidden">
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-amber-100">
                          <h3 className="font-semibold text-gray-800 text-sm">Switch Child</h3>
                        </div>
                        <div className="p-2 max-h-80 overflow-y-auto">
                          {profiles.map(profile => (
                            <button
                              key={profile.id}
                              onClick={() => {
                                switchProfile(profile);
                                setShowSidebar(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${
                                activeProfile?.id === profile.id
                                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                                  : 'hover:bg-amber-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                activeProfile?.id === profile.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gradient-to-br from-rose-400 to-purple-500 text-white'
                              }`}>
                                {profile.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-semibold">{profile.name}</div>
                                <div className={`text-xs ${activeProfile?.id === profile.id ? 'text-white/80' : 'text-gray-500'}`}>{profile.class}</div>
                              </div>
                              {activeProfile?.id === profile.id && (
                                <Check className="w-5 h-5" />
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {/* Add Child Button */}
                        {profiles.length < 5 && (
                          <div className="p-2 border-t border-amber-100">
                            <button
                              onClick={() => {
                                setShowSidebar(false);
                                setShowAddProfile(true);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-amber-300 text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-all"
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                              </div>
                              <span className="font-medium">Add Child</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Tabs - Scrollable on mobile */}
            <div className="flex-1 overflow-x-auto scrollbar-hide mx-2 md:mx-4">
              <div className="flex items-center gap-1 bg-white/60 rounded-full px-2 py-1.5 shadow-inner w-max min-w-full md:w-auto md:min-w-0 md:justify-center">
                {[
                  { key: 'dashboard', label: 'Home', icon: Home },
                  { key: 'daily', label: 'Tasks', icon: CheckCircle },
                  { key: 'calendar', label: 'Schedule', icon: Calendar },
                  { key: 'exams', label: 'Exams', icon: FileText },
                  { key: 'subjects', label: 'Subjects', icon: Book },
                  { key: 'analytics', label: 'Stats', icon: BarChart3 },
                  { key: 'docs', label: 'Docs', icon: FolderOpen },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeView === key
                        ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-white hover:text-rose-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="relative p-1.5 sm:p-2 bg-white/70 rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  {(getDailySuggestions().filter((s, i) => !isNotificationDismissed(i, 'suggestion')).length + 
                    getTodaysReminders().filter(r => !isNotificationDismissed(r.id, 'reminder')).length + 
                    getTodaysRecurringReminders().filter(r => !isNotificationDismissed(r.id, 'recurring')).length) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                      {getDailySuggestions().filter((s, i) => !isNotificationDismissed(i, 'suggestion')).length + 
                       getTodaysReminders().filter(r => !isNotificationDismissed(r.id, 'reminder')).length + 
                       getTodaysRecurringReminders().filter(r => !isNotificationDismissed(r.id, 'recurring')).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotificationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)} />
                    <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <button
                          onClick={() => setShowNotificationsDropdown(false)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-3 space-y-2">
                        {/* Today's Reminders */}
                        {getTodaysReminders()
                          .filter(reminder => !isNotificationDismissed(reminder.id, 'reminder'))
                          .map((reminder) => (
                          <div key={reminder.id} className="flex items-start gap-2 p-3 bg-amber-50 border-l-3 border-amber-400 rounded-lg group">
                            <Clock className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-amber-200 text-amber-700 text-[10px] font-semibold rounded uppercase">Reminder</span>
                                <span className="font-medium text-sm text-gray-900 truncate">{reminder.title}</span>
                              </div>
                              {reminder.description && (
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{reminder.description}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {e.stopPropagation(); dismissNotification(reminder.id, 'reminder');}}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Recurring Reminders */}
                        {getTodaysRecurringReminders()
                          .filter(reminder => !isNotificationDismissed(reminder.id, 'recurring'))
                          .map((reminder) => (
                          <div key={reminder.id} className="flex items-start gap-2 p-3 bg-purple-50 border-l-3 border-purple-400 rounded-lg group">
                            <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 truncate">{reminder.title}</span>
                                <span className="text-xs text-gray-500">• {reminder.time}</span>
                              </div>
                              {reminder.description && (
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{reminder.description}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {e.stopPropagation(); dismissNotification(reminder.id, 'recurring');}}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Study Suggestions */}
                        {getDailySuggestions()
                          .filter((suggestion, i) => !isNotificationDismissed(i, 'suggestion'))
                          .map((suggestion, i) => (
                          <div 
                            key={i} 
                            className={`flex items-start gap-2 p-3 rounded-lg border-l-3 group ${
                              suggestion.priority === 'high' 
                                ? 'bg-rose-50 border-rose-400' 
                                : 'bg-blue-50 border-blue-400'
                            }`}
                          >
                            {suggestion.priority === 'high' ? (
                              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Book className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {suggestion.priority === 'high' && (
                                  <span className="px-1.5 py-0.5 bg-rose-200 text-rose-700 text-[10px] font-semibold rounded uppercase">Urgent</span>
                                )}
                                <span className="font-medium text-sm text-gray-900">{suggestion.message}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{suggestion.details}</p>
                            </div>
                            <button
                              onClick={() => dismissNotification(i, 'suggestion')}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Empty State */}
                        {(getDailySuggestions().filter((s, i) => !isNotificationDismissed(i, 'suggestion')).length + 
                          getTodaysReminders().filter(r => !isNotificationDismissed(r.id, 'reminder')).length + 
                          getTodaysRecurringReminders().filter(r => !isNotificationDismissed(r.id, 'recurring')).length) === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-1 sm:gap-2 bg-white/70 rounded-full pl-1 pr-1.5 sm:pr-3 py-1 hover:bg-white transition-colors shadow-sm"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {accountName || session?.user?.email?.split('@')[0] || 'Account'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="p-4">
        {_loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-rose-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <div className="text-rose-500 font-semibold text-lg">Loading...</div>
            </div>
          </div>
        )}
        <div className={`max-w-6xl mx-auto${_loading ? ' opacity-30 pointer-events-none select-none' : ''}`}>
        {/* Profile Selector */}
        {!_loading && profiles.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-4 text-center border border-amber-200">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Kannama Study Tracker!</h2>
            <p className="text-gray-600 mb-6">Create a profile for your first child to get started</p>
            
            <div className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                placeholder="Child's name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-rose-400 focus:outline-none bg-white/70"
              />
              <input
                type="text"
                placeholder="Class/Grade (e.g., Grade 5)"
                value={newProfileClass}
                onChange={(e) => setNewProfileClass(e.target.value)}
                className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-rose-400 focus:outline-none bg-white/70"
              />
              <button
                onClick={addProfile}
                className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-purple-600 font-medium shadow-lg"
              >
                Create Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Switch Indicator */}
            {profileSwitched && (
              <div className="fixed top-20 right-6 z-50 animate-bounce">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-white">
                  <div className="bg-white/30 p-2 rounded-lg animate-pulse">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-90">Switched to</div>
                    <div className="text-lg font-semibold">{switchedProfileName}</div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            {/* Chapter Tracking Mode Selection Notification */}
            {showTrackingModeNotification && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-3 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold">Choose Chapter Tracking Mode</h2>
                        <p className="text-sm text-white/80 mt-1">Select how you want to track chapter progress for {pendingTrackingModeProfile?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                      Choose between two tracking modes based on your preference:
                    </p>

                    {/* Option 1: Smart Tracking (Default) */}
                    <button
                      onClick={() => selectTrackingMode('smart')}
                      className="w-full text-left border-2 border-indigo-300 bg-indigo-50 rounded-lg p-5 hover:border-indigo-400 hover:bg-indigo-100 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Smart Tracking</h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">RECOMMENDED</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            ✨ Simple checkbox for completion with automatic metadata tracking
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• Quick and easy to use - just check when done</li>
                            <li>• Automatically tracks: study time, tasks, last studied date</li>
                            <li>• Visual indicators for activity status</li>
                            <li>• Perfect for busy schedules</li>
                          </ul>
                        </div>
                        <div className="ml-4 opacity-50 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </button>

                    {/* Option 2: Comprehensive Tracking */}
                    <button
                      onClick={() => selectTrackingMode('comprehensive')}
                      className="w-full text-left border-2 border-gray-300 bg-white rounded-lg p-5 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Comprehensive Tracking</h3>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            📊 Detailed tracking with full control over all metrics
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 ml-4">
                            <li>• Manual completion with status tracking</li>
                            <li>• Track study time, tasks completed, revisions needed</li>
                            <li>• View last studied date for each chapter</li>
                            <li>• Color-coded activity indicators</li>
                            <li>• Best for detailed planning and review</li>
                          </ul>
                        </div>
                        <div className="ml-4 opacity-50 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">💡 You can change this later</p>
                          <p className="text-xs text-blue-700">
                            This setting can be changed anytime in Profile Settings. We recommend starting with <strong>Smart Tracking</strong> for simplicity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Profile Modal */}
            {showAddProfile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/30" onClick={() => {
                  setShowAddProfile(false);
                  setNewProfileName('');
                  setNewProfileClass('');
                }} />
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Add Child</h3>
                    <button
                      onClick={() => {
                        setShowAddProfile(false);
                        setNewProfileName('');
                        setNewProfileClass('');
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Child's name"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full p-3 mb-3 border-2 border-amber-200 rounded-xl focus:border-rose-400 focus:outline-none"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Class/Grade (e.g., Grade 5)"
                    value={newProfileClass}
                    onChange={(e) => setNewProfileClass(e.target.value)}
                    className="w-full p-3 mb-4 border-2 border-amber-200 rounded-xl focus:border-rose-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addProfile();
                        setShowAddProfile(false);
                      }}
                      disabled={!newProfileName.trim()}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                    >
                      Add Child
                    </button>
                    <button
                      onClick={() => {
                        setShowAddProfile(false);
                        setNewProfileName('');
                        setNewProfileClass('');
                      }}
                      className="px-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-4 border border-amber-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side - Title and date */}
                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                    {activeProfile?.name}'s Study Tracker
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 rounded-full">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-medium text-rose-700">{getTodayStudyTime()}m studied</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </div>
                  </div>
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
                      <h2 className="text-xl font-semibold text-gray-900">Manage Default Activities</h2>
                  <button
                    onClick={() => {
                      setShowActivitiesManager(false);
                      setEditingActivity(null);
                      setNewActivityName('');
                    }}
                    className="text-gray-500 hover:text-gray-500"
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
                      className="px-4 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500"
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
                            className="text-gray-500 hover:text-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-gray-500">{activity}</span>
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
                    className="w-full bg-indigo-400 text-white py-2 rounded-lg hover:bg-indigo-500 font-medium"
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
                    <h2 className="text-2xl font-semibold text-purple-400">Kids Activities Hub</h2>
                    <p className="text-sm text-gray-600">Fun activities for when they need a break</p>
                  </div>
                  <button
                    onClick={() => setShowSharedActivities(false)}
                    className="text-gray-500 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(85vh-180px)] overflow-y-auto p-6">
                {/* Add New Activity */}
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h3 className="font-semibold text-gray-500 mb-3">Add New Activity</h3>
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
                        className="px-6 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 flex items-center gap-2"
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
                          <h3 className="font-semibold text-gray-500 mb-3 flex items-center gap-2">
                            <span>{categoryIcons[category]}</span>
                            <span className="capitalize">{category}</span>
                            <span className="text-xs text-gray-500">({categoryActivities.length})</span>
                          </h3>
                          <div className="space-y-2">
                            {categoryActivities.map(activity => (
                              <div key={activity.id} className="bg-white p-3 rounded-lg border">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-500">{activity.title}</div>
                                    {activity.description && (
                                      <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => deleteSharedActivity(activity.id)}
                                    className="text-rose-400 hover:text-rose-500 flex-shrink-0"
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
                  className="w-full bg-purple-400 text-white py-2 rounded-lg hover:bg-purple-500 font-medium"
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
              <div className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white p-6 rounded-t-lg flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-lg rounded-full p-3">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Profile Settings</h2>
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
                      <h3 className="text-lg font-semibold text-gray-900">Manage Kids</h3>
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
                              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
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
                              <label className="block text-xs font-medium text-gray-500 mb-1">Grade/Class</label>
                              <input
                                type="text"
                                value={editProfileData.class}
                                onChange={(e) => setEditProfileData({ ...editProfileData, class: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., Grade 5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Chapter Tracking Mode</label>
                              <select
                                value={editProfileData.chapter_tracking_mode || 'smart'}
                                onChange={(e) => setEditProfileData({ ...editProfileData, chapter_tracking_mode: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                              >
                                <option value="smart">✨ Smart Tracking (Recommended)</option>
                                <option value="comprehensive">📊 Comprehensive Tracking</option>
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                {editProfileData.chapter_tracking_mode === 'comprehensive' 
                                  ? 'Full tracking with manual completion, study time, tasks, and revisions'
                                  : 'Simple checkbox with automatic metadata tracking'}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => updateProfile(profile.id)}
                                className="flex-1 px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 font-medium"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProfile(null);
                                  setEditProfileData({ name: '', class: '', chapter_tracking_mode: 'smart' });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : deletingProfileId === profile.id ? (
                          // Delete confirmation mode
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-rose-600">Delete {profile.name}'s Profile?</p>
                                <p className="text-xs text-rose-500 mt-1">
                                  This will permanently delete all data including subjects, tasks, exams, and reminders. This action cannot be undone.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteProfile(profile.id)}
                                className="flex-1 px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500 font-medium"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeletingProfileId(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 font-medium"
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
                                <h4 className="font-semibold text-gray-500">{profile.name}</h4>
                                {activeProfile?.id === profile.id && (
                                  <span className="px-2 py-0.5 bg-indigo-400 text-white text-xs rounded-full">Active</span>
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
                                  className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 font-medium"
                                >
                                  Switch
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingProfile(profile.id);
                                  setEditProfileData({ 
                                    name: profile.name, 
                                    class: profile.class || '',
                                    chapter_tracking_mode: profile.chapter_tracking_mode || 'smart'
                                  });
                                }}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                                title="Edit profile"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {profiles.length > 1 && (
                                <button
                                  onClick={() => setDeletingProfileId(profile.id)}
                                  className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"
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
                      <p className="text-sm text-gray-500 text-center">
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
                      <label className="block text-sm font-semibold text-gray-500">Account Name</label>
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
                            className="px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingAccountName(false);
                              setTempAccountName('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-500 font-medium">
                            {accountName || 'Not set'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingAccountName(true);
                              setTempAccountName(accountName);
                            }}
                            className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium"
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
                      <label className="block text-sm font-semibold text-gray-500">Email Address</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500">{session?.user?.email}</span>
                      </div>
                      <p className="text-xs text-gray-500">Your login email address</p>
                    </div>

                    {/* Personalization Section (Placeholder) */}
                    <div className="space-y-2 pt-4 border-t">
                      <label className="block text-sm font-semibold text-gray-500">Personalization</label>
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-400 text-white rounded-lg hover:bg-rose-500 font-medium shadow-sm"
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
                  className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            exams={exams}
            subjects={subjects}
            profiles={profiles}
            activeProfile={activeProfile}
          />
        )}

        {/* Daily View */}
        {activeView === 'daily' && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 -m-6 mt-0">
            <div className="max-w-7xl mx-auto space-y-6">
            {/* Today's Overview Header - Clean Dashboard Style */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Clock className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Today's Overview</h1>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats with Circular Progress */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Circular Progress - Tasks Completed */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="url(#completedGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - (getTodayTasks().filter(t => t.completed).length / Math.max(getTodayTasks().length, 1)))}`}
                        className="transition-all duration-500 ease-out"
                      />
                      <defs>
                        <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {getTodayTasks().filter(t => t.completed).length}
                      </span>
                      <span className="text-xs text-gray-500">of {getTodayTasks().length}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 mt-2">Tasks Done</span>
                </div>

                {/* Progress Bars */}
                <div className="flex-1 space-y-4 justify-center flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600 w-24">Study Time</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min((getTodayStudyTime() / 240) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 w-16 text-right">
                      {getTodayStudyTime()}m
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600 w-24">Reminders</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${(getTodaysReminders().length + getTodaysRecurringReminders().length) > 0 ? 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 w-16 text-right">
                      {getTodaysReminders().length + getTodaysRecurringReminders().length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Tasks */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
                  </div>
                  <button
                    onClick={() => startVoiceInput((text) => {
                      setNewTask({ ...newTask, activity: text });
                      setShowAddTask(true);
                    })}
                    className={`p-2 rounded-xl shadow-soft ${isListening ? 'bg-pastel-coral animate-pulse' : 'bg-pastel-purple hover:bg-pastel-purple-300'} text-purple-700 transition-all`}
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                
                {showAddTask ? (
                  <div className="space-y-3 mb-4 p-4 bg-pastel-purple-light rounded-2xl border border-gray-200 shadow-soft">
                    {/* Task Type Toggle */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewTask({ ...newTask, taskType: '', subject: newTask.subject || '' })}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          !newTask.taskType
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-purple-50'
                        }`}
                      >
                        📚 Subject Task
                      </button>
                      <button
                        onClick={() => setNewTask({ ...newTask, taskType: 'General', subject: '' })}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          newTask.taskType
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        ⭐ General Task
                      </button>
                    </div>

                    {/* General Task Type Selection */}
                    {newTask.taskType && (
                      <select
                        value={newTask.taskType}
                        onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-soft bg-green-50"
                      >
                        <option value="General">🌟 General</option>
                        <option value="Event">🎉 Event Practice</option>
                        <option value="Project">📁 Project</option>
                        <option value="Reading">📖 Reading</option>
                        <option value="Chore">🏠 Household Chore</option>
                        <option value="Music">🎵 Music/Arts</option>
                        <option value="Sports">⚽ Sports/Fitness</option>
                        <option value="Personal">💡 Personal Development</option>
                      </select>
                    )}

                    {/* Subject Selection (only for subject-based tasks) */}
                    {!newTask.taskType && (
                      <select
                        value={newTask.subject}
                        onChange={(e) => setNewTask({ ...newTask, subject: e.target.value, chapter: '' })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                      >
                        <option value="">Select Subject</option>
                        {profileSubjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    )}
                    
                    {/* Chapter Selection (only for subject-based tasks) */}
                    {newTask.subject && !newTask.taskType && (
                      <select
                        value={newTask.chapter}
                        onChange={(e) => setNewTask({ ...newTask, chapter: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                      >
                        <option value="">Select Chapter (Optional)</option>
                        {getChapterNamesForSubject(newTask.subject).map((chapterName, i) => (
                          <option key={i} value={chapterName}>{chapterName}</option>
                        ))}
                      </select>
                    )}
                    
                    {/* Activity Section - Different for Subject vs General Tasks */}
                    {!newTask.taskType ? (
                      // Subject Tasks: Show dropdown with standard activities
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-500">Activity</label>
                            <button
                              onClick={() => setShowActivitiesManager(true)}
                              className="text-xs px-2 py-1 text-purple-600 hover:bg-pastel-purple-light rounded-lg font-semibold transition-all"
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
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
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
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                          />
                        )}
                      </>
                    ) : (
                      // General Tasks: Only custom activity input
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500">Activity</label>
                        <input
                          type="text"
                          placeholder="Enter activity description"
                          value={newTask.activity}
                          onChange={(e) => setNewTask({ ...newTask, activity: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent shadow-soft bg-green-50"
                        />
                      </div>
                    )}
                    
                    <input
                      type="number"
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                      placeholder="Duration (minutes)"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                    />
                    
                    <textarea
                      value={newTask.instructions}
                      onChange={(e) => setNewTask({ ...newTask, instructions: e.target.value })}
                      placeholder="Instructions or notes (optional)"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                      rows="2"
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={addTask}
                        className="flex-1 bg-accent-purple text-white py-3 rounded-xl hover:bg-purple-700 font-semibold shadow-card hover:shadow-card-hover transition-all"
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
                        className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="w-full border-2 border-dashed border-pastel-purple-300 rounded-2xl py-4 text-purple-600 hover:border-purple-400 hover:bg-pastel-purple-light transition-all mb-4 group shadow-soft hover:shadow-card"
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
                        className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:shadow-card ${
                          task.completed 
                            ? 'bg-pastel-green-light border-pastel-green shadow-soft' 
                            : 'bg-white border-gray-200 hover:border-purple-300'
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
                          <div className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-500'}`}>
                            {task.task_type ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold mr-2">
                                  {task.task_type === 'Event' && '🎉'}
                                  {task.task_type === 'Project' && '📁'}
                                  {task.task_type === 'Reading' && '📖'}
                                  {task.task_type === 'Chore' && '🏠'}
                                  {task.task_type === 'Music' && '🎵'}
                                  {task.task_type === 'Sports' && '⚽'}
                                  {task.task_type === 'Personal' && '💡'}
                                  {task.task_type === 'General' && '⭐'}
                                  {task.task_type}
                                </span>
                                {task.activity}
                              </>
                            ) : (
                              <>{task.subject} {task.activity && `- ${task.activity}`}</>
                            )}
                          </div>
                          {task.chapter && (
                            <div className="text-sm text-purple-600 font-medium">{task.chapter}</div>
                          )}
                          {task.carryover_days > 0 && (
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-pastel-orange-light border border-pastel-orange rounded-full shadow-soft">
                              <span className="text-xs font-semibold text-orange-600">
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
                          className="flex-shrink-0 text-rose-400 hover:text-rose-500 p-2 hover:bg-pastel-coral-light rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* School Reminders Management */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="flex items-center justify-between p-6 bg-pastel-yellow-light border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-gray-500" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
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
                        className="p-2 bg-accent-purple text-white rounded-xl hover:bg-purple-700 transition-all shadow-soft"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsMinimized(!notificationsMinimized)}
                      className="p-2 bg-white hover:bg-pastel-yellow-light rounded-xl transition-all border border-gray-200 shadow-soft hover:shadow-card"
                      title={notificationsMinimized ? 'Expand notifications' : 'Minimize notifications'}
                    >
                      {notificationsMinimized ? <ChevronDown className="w-5 h-5 text-orange-600" /> : <ChevronUp className="w-5 h-5 text-orange-600" />}
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
                  <div className="mb-4 p-5 bg-pastel-purple-light rounded-2xl border border-gray-200 space-y-4 shadow-card">
                    <h3 className="font-semibold text-gray-500 text-lg">Add Reminder</h3>
                    
                    {/* Reminder Type Selector */}
                    <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-soft">
                      <button
                        onClick={() => setReminderType('one-time')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          reminderType === 'one-time'
                            ? 'bg-accent-purple text-white shadow-soft'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        📅 One-Time
                      </button>
                      <button
                        onClick={() => setReminderType('recurring')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                          reminderType === 'recurring'
                            ? 'bg-accent-blue text-white shadow-soft'
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent font-medium shadow-soft"
                    />

                    {reminderType === 'one-time' ? (
                      <input
                        type="date"
                        value={newReminder.date}
                        onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                      />
                    ) : (
                      <>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 Start Time</label>
                            <input
                              type="time"
                              value={newRecurringReminder.time}
                              onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, time: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 End Time</label>
                            <input
                              type="time"
                              value={newRecurringReminder.end_time}
                              onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, end_time: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-500">📅 Select Days:</label>
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
                                className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-soft ${
                                  newRecurringReminder.days.includes(idx)
                                    ? 'bg-accent-blue text-white scale-105 shadow-card'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-purple focus:border-transparent shadow-soft"
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
                        className={`flex-1 text-white py-3 rounded-xl font-semibold shadow-card transition-all ${
                          reminderType === 'one-time'
                            ? 'bg-accent-purple hover:bg-purple-700'
                            : 'bg-accent-blue hover:bg-blue-700'
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
                        className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {editingReminder && (
                  <div className="mb-4 p-4 bg-pastel-blue-light rounded-2xl border border-gray-200 space-y-3 shadow-card">
                    <h3 className="font-semibold text-gray-500">Edit Reminder</h3>
                    <input
                      type="text"
                      placeholder="Reminder title"
                      value={editReminderData.title}
                      onChange={(e) => setEditReminderData({ ...editReminderData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-transparent shadow-soft"
                    />
                    <input
                      type="date"
                      value={editReminderData.date}
                      onChange={(e) => setEditReminderData({ ...editReminderData, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-transparent shadow-soft"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={editReminderData.description}
                      onChange={(e) => setEditReminderData({ ...editReminderData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-blue focus:border-transparent shadow-soft"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={updateReminder}
                        className="flex-1 bg-accent-blue text-white py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-card transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingReminder(null);
                          setEditReminderData({ title: '', date: '', description: '' });
                        }}
                        className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              
              <h3 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-500" />
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
                            className={`group p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                              reminder.isToday 
                                ? 'bg-green-50 border-green-500 hover:shadow-md' 
                                : reminder.priority === 'urgent'
                                ? 'bg-white border-orange-400 hover:shadow-md'
                                : 'bg-white border-blue-400 hover:shadow-md'
                            } border border-gray-200`}
                            onClick={() => setExpandedReminders({...expandedReminders, [`${reminder.type}-${reminder.id}`]: !expandedReminders[`${reminder.type}-${reminder.id}`]})}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {reminder.type === 'recurring' ? (
                                  <Repeat className={`w-5 h-5 ${
                                    reminder.isToday ? 'text-green-600' : 'text-gray-600'
                                  }`} />
                                ) : (
                                  <Clock className={`w-5 h-5 ${
                                    reminder.isToday ? 'text-green-600' : 'text-gray-600'
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <div className="font-semibold text-gray-500">{reminder.title}</div>
                                  {reminder.isToday && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                      Today
                                    </span>
                                  )}
                                  {!reminder.isToday && reminder.priority === 'urgent' && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                                      {reminder.daysUntil === 1 ? 'Tomorrow' : `${reminder.daysUntil} days`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {reminder.displayDate}
                                </div>
                                {reminder.description && (
                                  <div className={`text-sm text-gray-600 mt-2 whitespace-pre-wrap break-words transition-all ${
                                    expandedReminders[`${reminder.type}-${reminder.id}`] ? '' : 'line-clamp-2'
                                  }`}>
                                    {reminder.description}
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
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                          className="w-full p-3 bg-white hover:bg-gray-50 rounded-xl font-semibold text-gray-500 transition-all flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300"
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
                                className="group p-4 bg-white border border-gray-200 border-l-4 border-l-gray-300 rounded-xl cursor-pointer hover:shadow-md transition-all"
                                onClick={() => setExpandedReminders({...expandedReminders, [`${reminder.type}-${reminder.id}`]: !expandedReminders[`${reminder.type}-${reminder.id}`]})}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    {reminder.type === 'recurring' ? (
                                      <Repeat className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <div className="font-semibold text-gray-500">{reminder.title}</div>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {reminder.daysUntil} days away
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {reminder.displayDate}
                                    </div>
                                    {reminder.description && (
                                      <div className={`text-sm text-gray-600 mt-2 whitespace-pre-wrap break-words transition-all ${
                                        expandedReminders[`${reminder.type}-${reminder.id}`] ? '' : 'line-clamp-2'
                                      }`}>
                                        {reminder.description}
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
                                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                  <h3 className="font-semibold text-gray-500 text-lg">✏️ Edit Recurring Reminder</h3>
                  <input
                    type="text"
                    placeholder="Reminder title (e.g., Tuition, Sports class)"
                    value={newRecurringReminder.title}
                    onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, title: e.target.value })}
                    className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 Start Time</label>
                      <input
                        type="time"
                        value={newRecurringReminder.time}
                        onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, time: e.target.value })}
                        className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 End Time</label>
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
                    <label className="text-sm font-semibold text-gray-500">📅 Select Days:</label>
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
                          className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
                            newRecurringReminder.days.includes(idx)
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={updateRecurringReminder}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingRecurringReminder(null);
                        setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                      }}
                      className="px-6 bg-gray-200 text-gray-500 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
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
          </div>
        )}

        {/* Subjects View */}
        {activeView === 'subjects' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Subjects & Chapters</h2>
              <button
                onClick={() => setShowAddSubject(true)}
                className="bg-indigo-400 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-md transition-all text-sm sm:text-base"
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
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">Chapters (Optional)</label>
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

            {/* Pill Badge Display */}
            <div className="flex flex-wrap gap-3">
              {profileSubjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setViewingSubject(viewingSubject?.id === subject.id ? null : subject)}
                  className={`group relative ${viewingSubject?.id === subject.id ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white' : 'bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-gray-500'} px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2`}
                >
                  <Book className={`w-4 h-4 ${viewingSubject?.id === subject.id ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="font-semibold text-sm">{subject.name}</span>
                  <span className={`${viewingSubject?.id === subject.id ? 'bg-white/30 text-white' : 'bg-white/60 text-indigo-700'} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                    {subject.chapters?.length || 0}
                  </span>
                </button>
              ))}
              {profileSubjects.length === 0 && (
                <p className="text-gray-500 text-sm italic py-4">No subjects yet. Click "Add Subject" to get started!</p>
              )}
            </div>

            {/* Subject Detail Section (Inline) */}
            {viewingSubject && (
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden border-2 border-indigo-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-400 to-purple-400 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Book className="w-6 h-6" />
                      <h3 className="text-xl font-semibold">{viewingSubject.name}</h3>
                      <span className="text-indigo-100 text-sm">
                        {viewingSubject.chapters?.length || 0} chapter{viewingSubject.chapters?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete subject "${viewingSubject.name}"?`)) {
                            deleteSubject(viewingSubject.id);
                            setViewingSubject(null);
                          }
                        }}
                        className="bg-rose-400/80 hover:bg-rose-500 text-white p-2 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingSubject(null)}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    {(() => {
                      const trackingMode = activeProfile?.chapter_tracking_mode || 'smart';
                      const normalizedSubject = normalizeSubjectChapters(viewingSubject);
                      const chapters = normalizedSubject.chapters || [];
                      
                      return chapters.map((chapter, i) => {
                        const chapterName = typeof chapter === 'string' ? chapter : chapter.name;
                        
                        if (trackingMode === 'smart') {
                          // Smart Tracking Mode - Simple checkbox with auto metadata
                          const normalizedChapter = normalizeChapter(chapter, 'smart');
                          return (
                            <div key={i} className="p-3 bg-white rounded-lg group hover:shadow-md transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => toggleChapterCompletion(viewingSubject.id, i)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                      normalizedChapter.completed
                                        ? 'bg-green-400 border-green-400'
                                        : 'border-gray-300 hover:border-indigo-400'
                                    }`}
                                  >
                                    {normalizedChapter.completed && <Check className="w-4 h-4 text-white" />}
                                  </button>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-medium ${
                                        normalizedChapter.completed
                                          ? 'text-gray-400 line-through'
                                          : 'text-gray-700'
                                      }`}>
                                        {chapterName}
                                      </span>
                                      {normalizedChapter.completed && (
                                        <span className="text-xs text-green-600 font-semibold">✓ Done</span>
                                      )}
                                    </div>
                                    {(normalizedChapter.lastStudied || normalizedChapter.taskCount > 0 || normalizedChapter.studyTime > 0) && (
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                        {normalizedChapter.lastStudied && (
                                          <span>📅 Last: {new Date(normalizedChapter.lastStudied).toLocaleDateString()}</span>
                                        )}
                                        {normalizedChapter.taskCount > 0 && (
                                          <span>📝 {normalizedChapter.taskCount} tasks</span>
                                        )}
                                        {normalizedChapter.studyTime > 0 && (
                                          <span>⏱️ {normalizedChapter.studyTime} min</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const updated = subjects.map(s => 
                                      s.id === viewingSubject.id 
                                        ? { ...s, chapters: s.chapters.filter((_, idx) => idx !== i) }
                                        : s
                                    );
                                    setSubjects(updated);
                                    saveData('subjects', updated);
                                    setViewingSubject({ ...viewingSubject, chapters: viewingSubject.chapters.filter((_, idx) => idx !== i) });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        } else {
                          // Comprehensive Tracking Mode - Full manual tracking
                          const normalizedChapter = normalizeChapter(chapter, 'comprehensive');
                          const statusColor = {
                            pending: 'bg-gray-100 text-gray-600 border-gray-300',
                            started: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                            completed: 'bg-green-100 text-green-700 border-green-300'
                          }[normalizedChapter.status];
                          
                          return (
                            <div key={i} className={`p-3 bg-white rounded-lg border-2 group hover:shadow-md transition-all ${statusColor}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-semibold text-gray-800">{i + 1}. {chapterName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={normalizedChapter.status}
                                    onChange={(e) => updateSubjectChapterStatus(viewingSubject.id, i, e.target.value)}
                                    className="text-xs px-2 py-1 rounded-lg border-2 font-semibold focus:ring-2 focus:ring-indigo-400 bg-white"
                                  >
                                    <option value="pending">📋 Pending</option>
                                    <option value="started">📖 Started</option>
                                    <option value="completed">✅ Completed</option>
                                  </select>
                                  <button
                                    onClick={() => {
                                      const updated = subjects.map(s => 
                                        s.id === viewingSubject.id 
                                          ? { ...s, chapters: s.chapters.filter((_, idx) => idx !== i) }
                                          : s
                                      );
                                      setSubjects(updated);
                                      saveData('subjects', updated);
                                      setViewingSubject({ ...viewingSubject, chapters: viewingSubject.chapters.filter((_, idx) => idx !== i) });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/50 px-2 py-1 rounded">
                                  📝 <strong>{normalizedChapter.taskCount}</strong> tasks
                                </div>
                                <div className="bg-white/50 px-2 py-1 rounded">
                                  ⏱️ <strong>{normalizedChapter.studyTime}</strong> min
                                </div>
                                {normalizedChapter.lastStudied && (
                                  <div className="bg-white/50 px-2 py-1 rounded col-span-2">
                                    📅 Last: <strong>{new Date(normalizedChapter.lastStudied).toLocaleDateString()}</strong>
                                  </div>
                                )}
                                <div className="bg-white/50 px-2 py-1 rounded">
                                  🔄 Revisions: <strong>{normalizedChapter.revisionsCompleted}/{normalizedChapter.revisionsNeeded}</strong>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      });
                    })()}
                    
                    {(!viewingSubject.chapters || viewingSubject.chapters.length === 0) && (
                      <p className="text-gray-500 text-center py-6 italic">No chapters added yet</p>
                    )}
                  </div>

                  {/* Add Chapter Section */}
                  {editingChapter === viewingSubject.id ? (
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Chapter name"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newChapterName.trim()) {
                              addChapterToSubject(viewingSubject.id, newChapterName);
                              setViewingSubject({ ...viewingSubject, chapters: [...(viewingSubject.chapters || []), newChapterName.trim()] });
                              setNewChapterName('');
                              setEditingChapter(null);
                            }
                          }}
                          className="flex-1 p-2.5 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (newChapterName.trim()) {
                              addChapterToSubject(viewingSubject.id, newChapterName);
                              setViewingSubject({ ...viewingSubject, chapters: [...(viewingSubject.chapters || []), newChapterName.trim()] });
                              setNewChapterName('');
                              setEditingChapter(null);
                            }
                          }}
                          className="px-4 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 transition-all"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setEditingChapter(null);
                            setNewChapterName('');
                          }}
                          className="px-4 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingChapter(viewingSubject.id)}
                      className="w-full py-2.5 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Chapter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exams View - Redesigned */}
        {activeView === 'exams' && (
          <div className="space-y-6">
            {/* Header with Add Exam Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Book className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                Exam Management
              </h2>
              <button
                onClick={() => setShowAddExam(true)}
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg transition-all text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add New Exam
              </button>
            </div>
            
            {/* Add Exam Modal */}
            {profileExams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Exams</div>
                  <div className="text-3xl font-semibold text-indigo-600">{getUpcomingExams().length}</div>
                  <div className="text-xs text-gray-500 mt-1">Upcoming</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Avg Preparation</div>
                  <div className="text-3xl font-semibold text-green-600">
                    {Math.round(getUpcomingExams().reduce((sum, exam) => sum + getExamProgress(exam).percentage, 0) / (getUpcomingExams().length || 1))}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Next Exam</div>
                  <div className="text-2xl font-semibold text-rose-400">
                    {getUpcomingExamSubjects().length > 0 ? getDaysUntil(getUpcomingExamSubjects()[0].date) : 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Days away</div>
                </div>
              </div>
            )}

            {/* Calendar View - 3 Column Card Layout */}
            {profileExams.length > 0 && getUpcomingExamSubjects().length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
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
                          daysLeft <= 3 ? 'border-rose-300 bg-rose-50' :
                          daysLeft <= 7 ? 'border-yellow-300 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        {/* Header with Date Badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-500 text-sm mb-1">{examSubject.subject}</h4>
                            <p className="text-xs text-gray-600">{examSubject.examName}</p>
                          </div>
                          <div className={`text-center min-w-[50px] rounded-lg p-2 ${
                            daysLeft <= 3 ? 'bg-rose-400' :
                            daysLeft <= 7 ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}>
                            <div className="text-xs text-white font-semibold">
                              {new Date(examSubject.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xl font-semibold text-white">
                              {new Date(examSubject.date).getDate()}
                            </div>
                            <div className="text-xs text-white font-medium">
                              {new Date(examSubject.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        </div>

                        {/* Days Countdown */}
                        <div className={`text-center py-2 rounded-lg mb-3 font-semibold ${
                          daysLeft === 0 ? 'bg-rose-100 text-rose-600 text-base' :
                          daysLeft <= 3 ? 'bg-rose-100 text-rose-600' :
                          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {daysLeft === 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <Flame className="w-4 h-4" /> Today!
                            </span>
                          ) : daysLeft === 1 ? `Tomorrow` : `${daysLeft} days left`}
                        </div>

                        {/* Progress Bar */}
                        {totalChapters > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span className="font-semibold">Progress</span>
                              <span className="font-semibold">{progress}%</span>
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
                                <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> {completedChapters}</span>
                                <span className="text-yellow-600 flex items-center gap-1"><Zap className="w-3 h-3" /> {startedChapters}</span>
                                <span className="text-gray-500 flex items-center gap-1"><Circle className="w-3 h-3" /> {totalChapters - completedChapters - startedChapters}</span>
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
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Exams</h2>
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
                    <label className="text-sm font-semibold text-gray-500 mb-2 block">Add Subjects to Exam</label>
                    
                    <div className="space-y-2 mb-3">
                      <select
                        value={newExamSubject.subject}
                        onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value, chapters: [] })}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Select Subject</option>
                        {profileSubjects.map(s => (
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
                          const selectedChapters = new Set((newExamSubject.chapters || []).map(ec => ec.name));
                          const availableChapters = getChapterNamesForSubject(newExamSubject.subject).filter(
                            chapterName => !selectedChapters.has(chapterName)
                          );
                          
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
                              {availableChapters.map((chapterName, i) => (
                                <option key={i} value={chapterName}>{chapterName}</option>
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
                                className="w-full p-2 border rounded-lg bg-white font-semibold text-lg"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h3 className="text-xl font-semibold text-gray-600">{exam.name}</h3>
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
                              <span className="font-semibold">{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <div className="flex gap-3 text-xs">
                              <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> {progress.completed} Done</span>
                              <span className="text-yellow-600 flex items-center gap-1"><Zap className="w-3 h-3" /> {progress.started} Started</span>
                              <span className="text-gray-600 flex items-center gap-1"><Circle className="w-3 h-3" /> {progress.pending} Pending</span>
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
                                      <h4 className="font-semibold text-gray-500">{subject.subject}</h4>
                                      <div className={`text-sm font-semibold ${daysLeft <= 3 ? 'text-rose-500' : 'text-indigo-500'}`}>
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

                                {/* Exam Marks (visible after exam date has passed or in edit mode) */}
                                {(daysLeft < 0 || editingExam === exam.id) && (
                                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <label className="text-xs font-semibold text-gray-500">Marks:</label>
                                      <input
                                        type="text"
                                        value={subject.marksInput ?? ''}
                                        onChange={(e) => {
                                          const input = e.target.value.trim();
                                          let percentage = null;
                                          
                                          if (input) {
                                            // Check if input is in x/y or x\y format
                                            if (input.includes('/') || input.includes('\\')) {
                                              // Replace backslash with forward slash for consistent parsing
                                              const normalizedInput = input.replace(/\\/g, '/');
                                              const parts = normalizedInput.split('/');
                                              if (parts.length === 2) {
                                                const numerator = parseFloat(parts[0]);
                                                const denominator = parseFloat(parts[1]);
                                                if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
                                                  percentage = Math.round((numerator / denominator) * 100 * 10) / 10;
                                                }
                                              }
                                            } else {
                                              // Direct percentage input
                                              const num = parseFloat(input);
                                              if (!isNaN(num) && num >= 0 && num <= 100) {
                                                percentage = num;
                                              }
                                            }
                                          }
                                          
                                          const updatedSubjects = [...exam.subjects];
                                          updatedSubjects[subjectIdx] = { 
                                            ...subject, 
                                            marksInput: input,
                                            marks: percentage 
                                          };
                                          updateExam(exam.id, { subjects: updatedSubjects });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="e.g., 45/50, 45\\50 or 90"
                                        className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                      />
                                      {subject.marks != null && subject.marks >= 0 && (
                                        <>
                                          <span className="text-xs font-semibold text-indigo-600">
                                            = {subject.marks}%
                                          </span>
                                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            subject.marks === 100 ? 'bg-green-100 text-green-700' :
                                            subject.marks >= 95 ? 'bg-blue-100 text-blue-700' :
                                            subject.marks >= 90 ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-600'
                                          }`}>
                                            {subject.marks === 100 ? (
                                              <><Trophy className="w-3 h-3 inline" /> Perfect!</>
                                            ) : subject.marks >= 95 ? (
                                              <><Star className="w-3 h-3 inline" /> Excellence!</>
                                            ) : subject.marks >= 90 ? (
                                              <><Sparkles className="w-3 h-3 inline" /> Outstanding!</>
                                            ) : subject.marks >= 75 ? (
                                              <><ThumbsUp className="w-3 h-3 inline" /> Good</>
                                            ) : subject.marks >= 60 ? (
                                              <><Check className="w-3 h-3 inline" /> Pass</>
                                            ) : (
                                              <><BookOpen className="w-3 h-3 inline" /> Keep Learning</>
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {subject.marks != null && subject.marks >= 90 && (
                                      <div className="text-xs text-green-600 mt-1 font-semibold flex items-center gap-1">
                                        <Gift className="w-3 h-3" /> Bonus: +{subject.marks === 100 ? '300' : subject.marks >= 95 ? '200' : '100'} pts!
                                      </div>
                                    )}
                                  </div>
                                )}

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
                                                className={`text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                                                  revisionsCompleted >= revisionsNeeded 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-orange-100 text-orange-700 cursor-pointer hover:opacity-80'
                                                }`}
                                                title={editingExam ? 'Set revision count in edit mode' : 'Click to add • Right-click or Shift+Click to remove'}
                                                disabled={editingExam === exam.id}
                                              >
                                                <BookOpen className="w-3 h-3" /> {revisionsCompleted}/{revisionsNeeded}
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
                                      const selectedChapters = new Set((subject.chapters || []).map(ch => ch?.name));
                                      const availableChapters = getChapterNamesForSubject(subject.subject).filter(
                                        (chapterName) => !selectedChapters.has(chapterName)
                                      );
                                      
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
                                            {availableChapters.map((chapterName, i) => (
                                              <option key={i} value={chapterName}>{chapterName}</option>
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
                              <span className="text-sm font-semibold text-gray-500">Add New Subject to This Exam</span>
                            </div>
                            
                            <div className="space-y-3">
                              <select
                                value={newExamSubject.subject}
                                onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value, chapters: [] })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full p-2 border rounded-lg text-sm"
                              >
                                <option value="">Select a subject...</option>
                                {profileSubjects.map(s => (
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
                                  const selectedChapters = new Set((newExamSubject.chapters || []).map(ec => ec.name));
                                  const availableChapters = getChapterNamesForSubject(newExamSubject.subject).filter(
                                    chapterName => !selectedChapters.has(chapterName)
                                  );
                                  
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
                                        {availableChapters.map((chapterName, i) => (
                                          <option key={i} value={chapterName}>{chapterName}</option>
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
                                        <span className="text-gray-500">{ch.name}</span>
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
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await addSubjectToExistingExam(exam.id);
                                }}
                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                                disabled={!newExamSubject.subject}
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

            {/* Previous Exams Section */}
            {getPastExams().length > 0 && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => setShowPreviousExams(!showPreviousExams)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-700">Previous Exams</h2>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {getPastExams().length}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPreviousExams ? 'rotate-180' : ''}`} />
                </button>
                
                {showPreviousExams && (
                  <div className="p-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getPastExams().map(exam => {
                        const subjectsWithMarks = exam.subjects?.filter(s => s.marks != null && s.marks >= 0) || [];
                        const avgMarks = subjectsWithMarks.length > 0 
                          ? Math.round(subjectsWithMarks.reduce((sum, s) => sum + s.marks, 0) / subjectsWithMarks.length * 10) / 10
                          : null;
                        
                        return (
                          <div key={exam.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {/* Exam Header */}
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-semibold text-gray-700 truncate flex-1">{exam.name}</h3>
                              <div className="flex items-center gap-2">
                                {avgMarks !== null && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    avgMarks >= 90 ? 'bg-green-100 text-green-700' :
                                    avgMarks >= 75 ? 'bg-blue-100 text-blue-700' :
                                    avgMarks >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    Avg: {avgMarks}%
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteExam(exam.id)}
                                  className="text-red-400 hover:text-red-600"
                                  title="Delete exam"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Subjects Table */}
                            <div className="space-y-1">
                              {exam.subjects && exam.subjects.map((subject, subjectIdx) => (
                                <div key={subjectIdx} className="flex items-center gap-2 bg-white rounded px-2 py-1.5 border border-gray-100">
                                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">{subject.subject}</span>
                                  <input
                                    type="text"
                                    value={subject.marksInput ?? ''}
                                    onChange={(e) => {
                                      const input = e.target.value.trim();
                                      let percentage = null;
                                      if (input) {
                                        if (input.includes('/') || input.includes('\\')) {
                                          const parts = input.replace(/\\/g, '/').split('/');
                                          if (parts.length === 2) {
                                            const num = parseFloat(parts[0]), den = parseFloat(parts[1]);
                                            if (!isNaN(num) && !isNaN(den) && den > 0) percentage = Math.round((num / den) * 1000) / 10;
                                          }
                                        } else {
                                          const num = parseFloat(input);
                                          if (!isNaN(num) && num >= 0 && num <= 100) percentage = num;
                                        }
                                      }
                                      const updatedSubjects = [...exam.subjects];
                                      updatedSubjects[subjectIdx] = { ...subject, marksInput: input, marks: percentage };
                                      updateExam(exam.id, { subjects: updatedSubjects });
                                    }}
                                    placeholder="marks"
                                    className="w-16 px-1.5 py-0.5 text-xs border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-400"
                                  />
                                  {subject.marks != null && (
                                    <span className={`text-xs font-semibold min-w-[40px] text-center ${
                                      subject.marks >= 90 ? 'text-green-600' :
                                      subject.marks >= 75 ? 'text-blue-600' :
                                      subject.marks >= 60 ? 'text-yellow-600' :
                                      'text-gray-500'
                                    }`}>
                                      {subject.marks}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-4">
            {/* 7-Day Activity Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-500 mb-4 flex items-center gap-2">
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
              <h2 className="text-xl font-semibold text-gray-500 mb-4">Subject Performance</h2>
              
              {getSubjectAnalytics().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No subjects added yet</p>
              ) : (
                <div className="space-y-4">
                  {getSubjectAnalytics()
                    .sort((a, b) => b.totalTime - a.totalTime)
                    .map((subject, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-500">{subject.name}</h3>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded ${
                              subject.recentActivity > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-rose-100 text-rose-600'
                            }`}>
                              {subject.recentActivity > 0 
                                ? `${subject.recentActivity} tasks this week` 
                                : 'No recent activity'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-indigo-600">{subject.totalTime}</div>
                            <div className="text-xs text-gray-600">Total mins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-indigo-600">{subject.completedTasks}</div>
                            <div className="text-xs text-gray-600">Tasks done</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold text-indigo-600">{subject.completionRate}%</div>
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
                <h3 className="font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Most Active (Last 7 Days)
                </h3>
                {getMostActiveSubjects().length === 0 ? (
                  <p className="text-gray-500 text-sm">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {getMostActiveSubjects().map((subject, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium text-gray-500">{subject.name}</span>
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
                <h3 className="font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  Needs Attention
                </h3>
                {getNeglectedSubjects().length === 0 ? (
                  <p className="text-gray-500 text-sm">All subjects active!</p>
                ) : (
                  <div className="space-y-2">
                    {getNeglectedSubjects().map((subject, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm font-medium text-gray-500">{subject.name}</span>
                        <span className="text-xs text-rose-500 font-semibold">
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
              <h3 className="font-semibold text-gray-500 mb-3">Study Consistency</h3>
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

            {/* Exam Analytics Section */}
            {(() => {
              const examAnalytics = getExamAnalytics();
              
              if (examAnalytics.totalExamsWithMarks === 0) {
                return (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-500 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      Exam Performance Analytics
                    </h2>
                    <p className="text-gray-500 text-center py-8">
                      No exam results available yet. Add marks to your completed exams to see analytics!
                    </p>
                  </div>
                );
              }

              return (
                <>
                  {/* Compact Overall Performance Summary */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-4 border-2 border-purple-200">
                    <h2 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Exam Performance Analytics
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{examAnalytics.totalExamsWithMarks}</div>
                        <div className="text-[10px] text-gray-600 mt-1">Exams</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{examAnalytics.overallAverage}%</div>
                        <div className="text-[10px] text-gray-600 mt-1">Overall Avg</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className={`text-2xl font-bold ${
                          examAnalytics.overallAverage >= 90 ? 'text-green-600' :
                          examAnalytics.overallAverage >= 75 ? 'text-blue-600' :
                          examAnalytics.overallAverage >= 60 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {examAnalytics.overallAverage >= 90 ? 'A+' :
                           examAnalytics.overallAverage >= 80 ? 'A' :
                           examAnalytics.overallAverage >= 70 ? 'B' :
                           examAnalytics.overallAverage >= 60 ? 'C' : 'D'}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">Grade</div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Subject Performance Line Charts */}
                  {examAnalytics.subjectPerformance.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4">
                      <h3 className="text-base font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-indigo-600" />
                        Subject Trends Across Exams
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {examAnalytics.subjectPerformance
                          .sort((a, b) => b.average - a.average)
                          .map((subject, idx) => {
                            const maxMark = Math.max(...subject.exams.map(e => e.marks));
                            const minMark = Math.min(...subject.exams.map(e => e.marks));
                            
                            return (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-gray-700">{subject.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs font-bold ${
                                        subject.average >= 90 ? 'text-green-600' :
                                        subject.average >= 75 ? 'text-blue-600' :
                                        'text-gray-600'
                                      }`}>
                                        {subject.average}% avg
                                      </span>
                                      {subject.trend !== 0 && (
                                        <span className={`text-xs font-semibold ${
                                          subject.trend > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {subject.trend > 0 ? '↗' : '↘'} {Math.abs(subject.trend).toFixed(1)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {minMark}% - {maxMark}%
                                  </div>
                                </div>
                                
                                {/* Simple Line Chart */}
                                <div className="relative h-20 mt-2">
                                  <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    <line x1="0" y1="20" x2="200" y2="20" stroke="#e5e7eb" strokeWidth="0.5" />
                                    <line x1="0" y1="40" x2="200" y2="40" stroke="#e5e7eb" strokeWidth="0.5" />
                                    <line x1="0" y1="60" x2="200" y2="60" stroke="#e5e7eb" strokeWidth="0.5" />
                                    
                                    {/* Line chart */}
                                    <polyline
                                      points={subject.exams.map((exam, i) => {
                                        const x = (i / Math.max(subject.exams.length - 1, 1)) * 200;
                                        const y = 80 - (exam.marks / 100) * 80;
                                        return `${x},${y}`;
                                      }).join(' ')}
                                      fill="none"
                                      stroke={
                                        subject.average >= 90 ? '#10b981' :
                                        subject.average >= 75 ? '#3b82f6' :
                                        subject.average >= 60 ? '#eab308' :
                                        '#f97316'
                                      }
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    
                                    {/* Data points */}
                                    {subject.exams.map((exam, i) => {
                                      const x = (i / Math.max(subject.exams.length - 1, 1)) * 200;
                                      const y = 80 - (exam.marks / 100) * 80;
                                      return (
                                        <circle
                                          key={i}
                                          cx={x}
                                          cy={y}
                                          r="3"
                                          fill={
                                            exam.marks >= 90 ? '#10b981' :
                                            exam.marks >= 75 ? '#3b82f6' :
                                            exam.marks >= 60 ? '#eab308' :
                                            '#f97316'
                                          }
                                          stroke="white"
                                          strokeWidth="1"
                                        />
                                      );
                                    })}
                                  </svg>
                                  
                                  {/* Y-axis labels */}
                                  <div className="absolute left-0 top-0 text-[9px] text-gray-400">100%</div>
                                  <div className="absolute left-0 bottom-0 text-[9px] text-gray-400">0%</div>
                                </div>
                                
                                {/* Exam labels */}
                                <div className="flex justify-between mt-1 text-[9px] text-gray-500">
                                  {subject.exams.map((exam, i) => (
                                    <span key={i} className="truncate" style={{ maxWidth: `${100 / subject.exams.length}%` }}>
                                      {exam.marks}%
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Compact Exam Averages */}
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-base font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Exam Averages
                    </h3>
                    <div className="space-y-2">
                      {examAnalytics.examAverages.map((exam, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-700 truncate">{exam.name}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  exam.average >= 90 ? 'bg-green-500' :
                                  exam.average >= 75 ? 'bg-blue-500' :
                                  exam.average >= 60 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${exam.average}%` }}
                              />
                            </div>
                          </div>
                          <div className={`text-sm font-bold px-2 py-1 rounded whitespace-nowrap ${
                            exam.average >= 90 ? 'bg-green-100 text-green-700' :
                            exam.average >= 75 ? 'bg-blue-100 text-blue-700' :
                            exam.average >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {exam.average}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Legend - Compact */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>90%+ Excellent</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>75-89% Good</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>60-74% Average</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span>&lt;60% Needs Work</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-3xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  Calendar
                </h2>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      const newMonth = calendarMonth.month === 0 ? 11 : calendarMonth.month - 1;
                      const newYear = calendarMonth.month === 0 ? calendarMonth.year - 1 : calendarMonth.year;
                      setCalendarMonth({ year: newYear, month: newMonth });
                      setSelectedDate(null);
                    }}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  </button>
                  <div className="text-sm sm:text-xl font-semibold text-gray-500 min-w-[120px] sm:min-w-[200px] text-center">
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
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      setCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });
                      setSelectedDate(getTodayDateIST());
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold text-sm sm:text-base"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-1 sm:py-2 bg-gray-50 rounded-lg text-xs sm:text-base">
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
                    days.push(<div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[120px] bg-gray-50 rounded-lg"></div>);
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
                    
                    profileExams.forEach(exam => {
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
                        className={`min-h-[60px] sm:min-h-[120px] p-1 sm:p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedDate === dateStr
                            ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-500 shadow-lg ring-2 ring-purple-300'
                            : isToday 
                            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 shadow-md hover:shadow-lg' 
                            : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`text-xs sm:text-sm font-semibold mb-1 ${
                          isToday ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {day}
                          {isToday && <span className="ml-1 text-[10px] sm:text-xs bg-indigo-600 text-white px-1 sm:px-2 py-0.5 rounded-full hidden sm:inline">Today</span>}
                        </div>
                        
                        <div className="space-y-1 overflow-y-auto max-h-[90px]">
                          {/* Exams */}
                          {dayExams.map((exam, idx) => (
                            <div 
                              key={`exam-${idx}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-300 rounded text-rose-600 font-semibold truncate flex items-center gap-1"
                              title={`${exam.examName} - ${exam.subject}`}
                            >
                              <FileText className="w-3 h-3 flex-shrink-0" /> {exam.subject}
                            </div>
                          ))}
                          
                          {/* One-time Reminders */}
                          {dayReminders.map(reminder => (
                            <div 
                              key={`reminder-${reminder.id}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded text-amber-700 font-semibold truncate flex items-center gap-1"
                              title={reminder.title}
                            >
                              <Bell className="w-3 h-3 flex-shrink-0" /> {reminder.title}
                            </div>
                          ))}
                          
                          {/* Recurring Reminders */}
                          {dayRecurringReminders.map(reminder => (
                            <div 
                              key={`recurring-${reminder.id}`}
                              className="text-xs p-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded text-blue-700 font-semibold truncate flex items-center gap-1"
                              title={`${reminder.title} (${convertTo12Hour(reminder.time)}-${convertTo12Hour(reminder.end_time)})`}
                            >
                              <Repeat className="w-3 h-3 flex-shrink-0" /> {reminder.title}
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
                  <div className="w-4 h-4 bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-300 rounded"></div>
                  <span className="text-sm text-gray-500 font-medium">Exams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded"></div>
                  <span className="text-sm text-gray-500 font-medium">Reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded"></div>
                  <span className="text-sm text-gray-500 font-medium">Recurring</span>
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
              
              profileExams.forEach(exam => {
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
                    <h3 className="text-2xl font-semibold text-gray-500 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-400" />
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
                          <h4 className="font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Exams ({dayExams.length})
                          </h4>
                          <div className="space-y-3">
                            {dayExams.map((exam, idx) => (
                              <div 
                                key={idx}
                                className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl"
                              >
                                <div className="font-semibold text-gray-500 text-lg">{exam.examName}</div>
                                <div className="text-gray-500 font-semibold mt-1">Subject: {exam.subject}</div>
                                {exam.chapters && exam.chapters.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-sm text-gray-500 font-semibold mb-1">Chapters:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {exam.chapters.map((ch, chIdx) => (
                                        <span 
                                          key={chIdx}
                                          className="text-xs px-2 py-1 bg-white border border-rose-300 rounded-full text-gray-500"
                                        >
                                          {ch.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {exam.keyPoints && (
                                  <div className="mt-2 text-sm text-gray-500 bg-white p-2 rounded border border-rose-200">
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
                          <h4 className="font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <Bell className="w-5 h-5" /> Reminders ({dayReminders.length})
                          </h4>
                          <div className="space-y-2">
                            {dayReminders.map(reminder => (
                              <div 
                                key={reminder.id}
                                className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl"
                              >
                                <div className="font-semibold text-gray-500 text-lg">{reminder.title}</div>
                                {reminder.description && (
                                  <div className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">
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
                          <h4 className="font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <Repeat className="w-5 h-5" /> Recurring Reminders ({dayRecurringReminders.length})
                          </h4>
                          <div className="space-y-2">
                            {dayRecurringReminders.map(reminder => (
                              <div 
                                key={reminder.id}
                                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
                              >
                                <div className="font-semibold text-gray-500 text-lg">{reminder.title}</div>
                                <div className="text-gray-500 font-semibold mt-1">
                                  <Clock className="w-4 h-4 inline mr-1" />{convertTo12Hour(reminder.time)} - {convertTo12Hour(reminder.end_time)}
                                </div>
                                {reminder.description && (
                                  <div className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">
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
              <h2 className="text-2xl font-semibold text-gray-500 mb-4">School Documents</h2>
              <p className="text-gray-600 mb-6">
                Upload and manage your timetable and other important school documents.
              </p>
              <SchoolDocuments profileId={activeProfile?.id} />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default StudyTrackerApp;













