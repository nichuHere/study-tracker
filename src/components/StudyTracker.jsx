import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit2, CheckCircle, Circle, Mic, X, Book, Target, TrendingUp, AlertCircle, LogOut, User, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Repeat, FileText, Flame, Zap, Check, Trophy, Star, Sparkles, ThumbsUp, Gift, BookOpen, BarChart3, LineChart, Home, GraduationCap, FolderOpen, Shield, Lock, Unlock } from 'lucide-react';
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
  
  // Admin Mode
  const ADMIN_PIN = '0000';
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminTimeout, setAdminTimeout] = useState(null);
  const [editingTaskDate, setEditingTaskDate] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState(null);
  const [editTaskFields, setEditTaskFields] = useState({ subject: '', activity: '', chapter: '', instructions: '' });

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
  const [showCalendarAddReminder, setShowCalendarAddReminder] = useState(false);
  const [calendarReminderType, setCalendarReminderType] = useState('one-time');
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
  const [examChapterExamOnly, setExamChapterExamOnly] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [minimizedExams, setMinimizedExams] = useState({});
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  const [editingCustomStudyMode, setEditingCustomStudyMode] = useState(null);
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

  // Auto-select first exam and subject when viewing exams
  useEffect(() => {
    if (activeView === 'exams' && !selectedExamId && !showAddExam) {
      const upcomingExams = getUpcomingExams();
      if (upcomingExams.length > 0) {
        setSelectedExamId(upcomingExams[0].id);
        setSelectedSubjectIndex(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, selectedExamId, showAddExam]);

  // Auto-select first subject when exam changes
  useEffect(() => {
    if (selectedExamId && activeView === 'exams') {
      setSelectedSubjectIndex(0);
    }
  }, [selectedExamId, activeView]);

  // Admin mode auto-timeout (10 minutes)
  useEffect(() => {
    if (isAdminMode) {
      if (adminTimeout) clearTimeout(adminTimeout);
      const timeout = setTimeout(() => {
        setIsAdminMode(false);
        setEditingTaskDate(null);
      }, 10 * 60 * 1000); // 10 minutes
      setAdminTimeout(timeout);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminMode]);

  // Admin PIN handler
  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminMode(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const exitAdminMode = () => {
    setIsAdminMode(false);
    setEditingTaskDate(null);
    if (adminTimeout) clearTimeout(adminTimeout);
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
      // Load ALL data from Supabase for leaderboard to work correctly
      // Dashboard will filter by profile as needed
      const [subjectsResult, tasksResult, examsResult, standardResult] = await Promise.all([
        supabase.from('subjects').select('*'), // Load all subjects
        supabase.from('tasks').select('*'),     // Load all tasks
        supabase.from('exams').select('*'),     // Load all exams
        supabase.from('standard_activities').select('*').eq('profile_id', profileId) // Profile-specific activities
      ]);

      let subjectsData = subjectsResult.data || [];
      const examsData = examsResult.data || [];

      // Debug: log exam notes status
      const profileExamsDebug = examsData.filter(e => e.profile_id === profileId);
      const examsWithNotes = profileExamsDebug.filter(e => 
        e.subjects?.some(s => s.keyPoints && s.keyPoints.trim())
      );
      console.log(`📝 Exam notes check: ${examsWithNotes.length}/${profileExamsDebug.length} exams have notes`,
        examsWithNotes.map(e => ({ name: e.name, notes: e.subjects.filter(s => s.keyPoints).map(s => ({ subject: s.subject, keyPoints: s.keyPoints })) }))
      );

      // One-time migration: sync all existing exam chapters to their respective subjects
      const migrationKey = `exam_chapters_migrated_${profileId}`;
      if (!localStorage.getItem(migrationKey)) {
        try {
          const profileExamsData = examsData.filter(e => e.profile_id === profileId);
          const profileSubjectsData = subjectsData.filter(s => s.profile_id === profileId);
          const trackingMode = activeProfile?.chapter_tracking_mode || 'smart';
          const subjectUpdates = new Map(); // subjectId -> updated chapters array

          for (const exam of profileExamsData) {
            for (const examSubject of (exam.subjects || [])) {
              const matchingSubject = profileSubjectsData.find(s => s.name === examSubject.subject);
              if (!matchingSubject) continue;

              // Start with existing updates or current chapters
              let currentChapters = subjectUpdates.get(matchingSubject.id) || [...(matchingSubject.chapters || [])];

              for (const examChapter of (examSubject.chapters || [])) {
                if (examChapter.examOnly) continue; // Skip exam-only chapters
                const chapterName = examChapter.name || examChapter;
                if (!chapterName) continue;

                const alreadyExists = currentChapters.some(ch => {
                  const name = typeof ch === 'string' ? ch : ch.name;
                  return name?.toLowerCase() === chapterName.toLowerCase();
                });

                if (!alreadyExists) {
                  currentChapters.push(normalizeChapter(chapterName, trackingMode));
                }
              }

              subjectUpdates.set(matchingSubject.id, currentChapters);
            }
          }

          // Batch update subjects in Supabase
          for (const [subjectId, updatedChapters] of subjectUpdates) {
            await supabase.from('subjects').update({ chapters: updatedChapters }).eq('id', subjectId);
          }

          // Update local data with migrated chapters
          if (subjectUpdates.size > 0) {
            subjectsData = subjectsData.map(s =>
              subjectUpdates.has(s.id) ? { ...s, chapters: subjectUpdates.get(s.id) } : s
            );
            console.log(`✅ Migrated exam chapters to ${subjectUpdates.size} subject(s)`);
          }

          localStorage.setItem(migrationKey, 'true');
        } catch (migrationError) {
          console.error('Error during exam chapter migration:', migrationError);
        }
      }

      // Cleanup: remove exam-only chapters that leaked into subjects
      // Runs every load to keep subjects in sync when examOnly flags change
      try {
        const profileExamsData = examsData.filter(e => e.profile_id === profileId);
        // Collect all exam-only chapter names per subject
        const examOnlyMap = new Map(); // subjectName -> Set of chapter names
        for (const exam of profileExamsData) {
          for (const examSubject of (exam.subjects || [])) {
            for (const ch of (examSubject.chapters || [])) {
              if (ch.examOnly) {
                if (!examOnlyMap.has(examSubject.subject)) examOnlyMap.set(examSubject.subject, new Set());
                examOnlyMap.get(examSubject.subject).add((ch.name || '').toLowerCase());
              }
            }
          }
        }

        if (examOnlyMap.size > 0) {
          const profileSubjectsData = subjectsData.filter(s => s.profile_id === profileId);
          const cleanupUpdates = new Map();

          for (const [subjectName, examOnlyNames] of examOnlyMap) {
            const subject = profileSubjectsData.find(s => s.name === subjectName);
            if (!subject || !subject.chapters?.length) continue;

            const cleaned = subject.chapters.filter(ch => {
              const name = (typeof ch === 'string' ? ch : ch.name || '').toLowerCase();
              return !examOnlyNames.has(name);
            });

            if (cleaned.length < subject.chapters.length) {
              cleanupUpdates.set(subject.id, cleaned);
            }
          }

          for (const [subjectId, cleanedChapters] of cleanupUpdates) {
            await supabase.from('subjects').update({ chapters: cleanedChapters }).eq('id', subjectId);
          }

          if (cleanupUpdates.size > 0) {
            subjectsData = subjectsData.map(s =>
              cleanupUpdates.has(s.id) ? { ...s, chapters: cleanupUpdates.get(s.id) } : s
            );
            console.log(`🧹 Cleaned exam-only chapters from ${cleanupUpdates.size} subject(s)`);
          }
        }
      } catch (cleanupError) {
        console.error('Error cleaning exam-only chapters:', cleanupError);
      }

      setSubjects(subjectsData);
      
      // Process task rollover for incomplete tasks from previous days
      // Only process for the active profile
      const tasksData = tasksResult.data || [];
      const profileTasks = tasksData.filter(t => t.profile_id === profileId);
      const updatedProfileTasks = await processTaskRollover(profileTasks, profileId);
      // Merge updated profile tasks with other profiles' tasks
      const otherTasks = tasksData.filter(t => t.profile_id !== profileId);
      setTasks([...updatedProfileTasks, ...otherTasks]);
      
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

  // Sync a chapter from exam to its corresponding subject (if not already present)
  const syncChapterToSubject = async (subjectName, chapterName) => {
    if (!subjectName || !chapterName?.trim()) return;
    
    const subject = subjects.find(s => s.profile_id === activeProfile?.id && s.name === subjectName);
    if (!subject) return;
    
    // Check if chapter already exists in the subject
    const existingChapters = subject.chapters || [];
    const chapterExists = existingChapters.some(ch => {
      const name = typeof ch === 'string' ? ch : ch.name;
      return name?.toLowerCase() === chapterName.trim().toLowerCase();
    });
    
    if (chapterExists) return;
    
    // Add chapter to the subject using existing function
    await addChapterToSubject(subject.id, chapterName.trim());
  };

  // Remove a chapter from the matching subject when deleted from an exam
  const removeChapterFromSubject = async (subjectName, chapterName) => {
    if (!subjectName || !chapterName) return;
    
    const subject = subjects.find(s => s.profile_id === activeProfile?.id && s.name === subjectName);
    if (!subject) return;
    
    const existingChapters = subject.chapters || [];
    const updatedChapters = existingChapters.filter(ch => {
      const name = typeof ch === 'string' ? ch : ch.name;
      return name?.toLowerCase() !== chapterName.toLowerCase();
    });
    
    if (updatedChapters.length === existingChapters.length) return; // nothing to remove
    
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ chapters: updatedChapters })
        .eq('id', subject.id);
      
      if (error) throw error;
      
      const updated = subjects.map(s =>
        s.id === subject.id ? { ...s, chapters: updatedChapters } : s
      );
      setSubjects(updated);
      if (viewingSubject?.id === subject.id) {
        setViewingSubject({ ...viewingSubject, chapters: updatedChapters });
      }
    } catch (error) {
      console.error('Error removing chapter from subject:', error);
    }
  };

  // Remove a chapter from all exams that reference the given subject+chapter
  const removeChapterFromExams = async (subjectName, chapterName) => {
    if (!subjectName || !chapterName) return;
    
    const profileExamsList = exams.filter(e => e.profile_id === activeProfile?.id);
    
    for (const exam of profileExamsList) {
      const examSubject = (exam.subjects || []).find(s => s.subject === subjectName);
      if (!examSubject) continue;
      
      const hasChapter = (examSubject.chapters || []).some(ch => {
        const name = typeof ch === 'string' ? ch : ch.name;
        return name?.toLowerCase() === chapterName.toLowerCase();
      });
      
      if (!hasChapter) continue;
      
      const updatedSubjects = exam.subjects.map(s => {
        if (s.subject !== subjectName) return s;
        return {
          ...s,
          chapters: (s.chapters || []).filter(ch => {
            const name = typeof ch === 'string' ? ch : ch.name;
            return name?.toLowerCase() !== chapterName.toLowerCase();
          })
        };
      });
      
      await updateExam(exam.id, { subjects: updatedSubjects });
    }
  };

  const profileSubjects = activeProfile
    ? subjects.filter(s => s.profile_id === activeProfile.id)
    : [];

  // Filter tasks for active profile only
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

  // Admin: Update task date
  const updateTaskDate = async (id, newDate) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ date: newDate })
        .eq('id', id);
      if (!error) {
        setTasks(tasks.map(t => t.id === id ? { ...t, date: newDate } : t));
        setEditingTaskDate(null);
      }
    } catch (err) {
      console.error('Error updating task date:', err);
    }
  };

  // Admin: Update task fields (name, activity, chapter, instructions)
  const updateTaskFields = async (id) => {
    try {
      const updates = {};
      if (editTaskFields.subject) updates.subject = editTaskFields.subject;
      if (editTaskFields.activity !== undefined) updates.activity = editTaskFields.activity;
      if (editTaskFields.chapter !== undefined) updates.chapter = editTaskFields.chapter;
      if (editTaskFields.instructions !== undefined) updates.instructions = editTaskFields.instructions;
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);
      if (!error) {
        setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
        setEditingTaskName(null);
        setEditTaskFields({ subject: '', activity: '', chapter: '', instructions: '' });
      }
    } catch (err) {
      console.error('Error updating task fields:', err);
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

  const addChapterToExamSubject = async (examId, subjectIndex, chapterName, examOnly = false) => {
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
          revisionsCompleted: 0,
          studyMode: 'Full Portions',
          customStudyMode: '',
          examOnly: examOnly
        }]
      };
      
      await updateExam(examId, { subjects: updatedSubjects });
      
      // Sync chapter to the corresponding subject (skip exam-only)
      if (!examOnly) {
        const subjectName = updatedSubjects[subjectIndex].subject;
        await syncChapterToSubject(subjectName, chapterName);
      }
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

  const updateChapterStudyMode = async (examId, subjectIndex, chapterIndex, studyMode, customStudyMode = '') => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      
      const updatedSubjects = [...exam.subjects];
      const updatedChapters = [...updatedSubjects[subjectIndex].chapters];
      updatedChapters[chapterIndex] = { 
        ...updatedChapters[chapterIndex], 
        studyMode,
        customStudyMode 
      };
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], chapters: updatedChapters };
      
      await updateExam(examId, { subjects: updatedSubjects });
    } catch (error) {
      console.error('Error updating chapter study mode:', error);
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
      
      const chapter = exam.subjects[subjectIndex].chapters[chapterIndex];
      const chapterName = chapter?.name;
      const subjectName = exam.subjects[subjectIndex].subject;
      const isExamOnly = chapter?.examOnly;
      
      const updatedSubjects = [...exam.subjects];
      const updatedChapters = updatedSubjects[subjectIndex].chapters.filter((_, i) => i !== chapterIndex);
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], chapters: updatedChapters };
      
      await updateExam(examId, { subjects: updatedSubjects });
      
      // Also remove from the corresponding subject (skip exam-only)
      if (chapterName && subjectName && !isExamOnly) {
        await removeChapterFromSubject(subjectName, chapterName);
      }
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
    if (!exam.subjects || exam.subjects.length === 0) return { pending: 0, started: 0, selfStudyDone: 0, reviewed: 0, completed: 0, percentage: 0 };
    
    let totalChapters = 0;
    let pending = 0;
    let started = 0;
    let selfStudyDone = 0;
    let reviewed = 0;
    let completed = 0;
    
    exam.subjects.forEach(subject => {
      if (subject.chapters && subject.chapters.length > 0) {
        totalChapters += subject.chapters.length;
        pending += subject.chapters.filter(c => c.status === 'pending').length;
        started += subject.chapters.filter(c => c.status === 'started').length;
        selfStudyDone += subject.chapters.filter(c => c.status === 'self_study_done').length;
        reviewed += subject.chapters.filter(c => c.status === 'reviewed').length;
        completed += subject.chapters.filter(c => c.status === 'completed').length;
      }
    });
    
    const percentage = totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
    
    return { pending, started, selfStudyDone, reviewed, completed, percentage, totalChapters };
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

  // Compute selected exam data for split panel view
  const selectedExamData = selectedExamId ? getUpcomingExams().find(e => e.id === selectedExamId) : null;
  const selectedExamProgress = selectedExamData ? getExamProgress(selectedExamData) : null;
  const selectedSubjectData = selectedExamData && selectedSubjectIndex !== null && selectedExamData.subjects?.[selectedSubjectIndex] 
    ? selectedExamData.subjects[selectedSubjectIndex] 
    : null;

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar - EduMaster style */}
      <nav className="sticky top-0 z-40 glass-nav shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Profile Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => isAdminMode ? exitAdminMode() : setShowPinModal(true)}
                className="bg-gradient-to-br from-rose-400 to-purple-500 p-1.5 sm:p-2 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 relative"
                title={isAdminMode ? 'Exit Admin Mode' : 'Admin Mode'}
              >
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                {isAdminMode && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                    <Shield className="w-2 h-2 text-amber-800" />
                  </div>
                )}
              </button>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                Kannama
              </span>
              {/* Child Selector Dropdown */}
              {activeProfile && (
                <div className="relative">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
                      <div className="absolute left-0 mt-2 w-72 glass-strong rounded-2xl shadow-glass-xl border border-white/40 z-50 overflow-hidden">
                        <div className="p-3 glass-white border-b border-white/30">
                          <h3 className="font-bold text-gray-800 text-sm">Switch Child</h3>
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
                                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                                  : 'hover:bg-white/40'
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
                          <div className="p-2 border-t border-white/30">
                            <button
                              onClick={() => {
                                setShowSidebar(false);
                                setShowAddProfile(true);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-teal-300 text-gray-600 hover:border-teal-500 hover:text-teal-700 hover:bg-white/40 transition-all font-medium"
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
              <div className="flex items-center gap-1 bg-white/40 rounded-full px-2 py-1.5 w-max min-w-full md:w-auto md:min-w-0 md:justify-center">
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
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      activeView === key
                        ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-white/60 hover:text-rose-600'
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
              {/* Admin Mode Badge */}
              {isAdminMode && (
                <button
                  onClick={exitAdminMode}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-300 hover:bg-amber-200 transition-all"
                  title="Click to exit admin mode"
                >
                  <Unlock className="w-3 h-3" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="relative p-1.5 sm:p-2 glass-white rounded-full hover:bg-white/80 transition-all shadow-sm hover:shadow-lg"
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
                    <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 glass-strong rounded-xl shadow-glass-xl border border-white/40 z-50 max-h-[70vh] overflow-hidden">
                      <div className="flex items-center justify-between p-4 glass-white border-b border-white/30">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          <h3 className="font-bold text-gray-800">Notifications</h3>
                        </div>
                        <button
                          onClick={() => setShowNotificationsDropdown(false)}
                          className="p-1 hover:bg-white/40 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-3 space-y-2">
                        {/* Today's Reminders */}
                        {getTodaysReminders()
                          .filter(reminder => !isNotificationDismissed(reminder.id, 'reminder'))
                          .map((reminder) => (
                          <div key={reminder.id} className="flex items-start gap-2 p-3 glass-white border-l-4 border-amber-400 rounded-xl group shadow-sm">
                            <Clock className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-amber-200 text-amber-700 text-[10px] font-bold rounded uppercase">Reminder</span>
                                <span className="font-semibold text-sm text-gray-900 truncate">{reminder.title}</span>
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
                          <div key={reminder.id} className="flex items-start gap-2 p-3 glass-white border-l-4 border-purple-400 rounded-xl group shadow-sm">
                            <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 truncate">{reminder.title}</span>
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
                className="flex items-center gap-1 sm:gap-2 glass-white rounded-full pl-1 pr-1.5 sm:pr-3 py-1 hover:bg-white/80 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
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
          <div className="glass-card rounded-2xl shadow-glass-xl p-8 mb-4 text-center border border-white/40">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-4">Welcome to Kannama Study Tracker!</h2>
            <p className="text-gray-600 mb-6 font-medium">Create a profile for your first child to get started</p>
            
            <div className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                placeholder="Child's name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full p-3 glass-white border-2 border-white/40 rounded-xl focus:border-rose-400 focus:outline-none shadow-sm"
              />
              <input
                type="text"
                placeholder="Class/Grade (e.g., Grade 5)"
                value={newProfileClass}
                onChange={(e) => setNewProfileClass(e.target.value)}
                className="w-full p-3 glass-white border-2 border-white/40 rounded-xl focus:border-rose-400 focus:outline-none shadow-sm"
              />
              <button
                onClick={addProfile}
                className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-purple-600 font-bold shadow-glass-lg hover:shadow-glass-xl transition-all transform hover:scale-105"
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
                <div className="glass-card border border-white/40 px-6 py-4 rounded-xl shadow-glass-xl flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-lg animate-pulse shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Switched to</div>
                    <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{switchedProfileName}</div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            )}

            {/* Chapter Tracking Mode Selection Notification */}
            {showTrackingModeNotification && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="glass-strong rounded-xl shadow-glass-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/40">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Choose Chapter Tracking Mode</h2>
                        <p className="text-sm text-white/90 mt-1">Select how you want to track chapter progress for {pendingTrackingModeProfile?.name}</p>
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
            <div className="glass-card rounded-2xl shadow-glass p-6 mb-4 border border-white/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side - Title and date */}
                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                    {activeProfile?.name}'s Study Tracker
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 glass-white rounded-full shadow-sm">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 glass-white rounded-full shadow-sm">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-rose-700">{getTodayStudyTime()}m studied</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 glass-white rounded-full shadow-sm">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Active</span>
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
                          {isAdminMode && editingTaskName === task.id ? (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editTaskFields.subject}
                                  onChange={(e) => setEditTaskFields({ ...editTaskFields, subject: e.target.value })}
                                  placeholder="Subject"
                                  className="flex-1 text-sm px-2 py-1.5 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-400 font-semibold"
                                />
                                <input
                                  type="text"
                                  value={editTaskFields.activity}
                                  onChange={(e) => setEditTaskFields({ ...editTaskFields, activity: e.target.value })}
                                  placeholder="Activity"
                                  className="flex-1 text-sm px-2 py-1.5 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-400"
                                />
                              </div>
                              <input
                                type="text"
                                value={editTaskFields.chapter}
                                onChange={(e) => setEditTaskFields({ ...editTaskFields, chapter: e.target.value })}
                                placeholder="Chapter (optional)"
                                className="w-full text-sm px-2 py-1.5 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-400"
                              />
                              <input
                                type="text"
                                value={editTaskFields.instructions}
                                onChange={(e) => setEditTaskFields({ ...editTaskFields, instructions: e.target.value })}
                                placeholder="Instructions (optional)"
                                className="w-full text-sm px-2 py-1.5 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-400 italic"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateTaskFields(task.id)}
                                  className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => { setEditingTaskName(null); setEditTaskFields({ subject: '', activity: '', chapter: '', instructions: '' }); }}
                                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-semibold transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
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
                                {isAdminMode && (
                                  <button
                                    onClick={() => {
                                      setEditingTaskName(task.id);
                                      setEditTaskFields({
                                        subject: task.subject || '',
                                        activity: task.activity || '',
                                        chapter: task.chapter || '',
                                        instructions: task.instructions || ''
                                      });
                                    }}
                                    className="inline-flex ml-2 text-amber-500 hover:text-amber-700 p-0.5 hover:bg-amber-50 rounded transition-all"
                                    title="Edit task details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
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
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="flex-shrink-0 text-rose-400 hover:text-rose-500 p-2 hover:bg-pastel-coral-light rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {/* Admin: Date edit */}
                        {isAdminMode && (
                          <div className="flex-shrink-0">
                            {editingTaskDate === task.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="date"
                                  defaultValue={task.date}
                                  onChange={(e) => updateTaskDate(task.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-amber-300 rounded-lg bg-amber-50 focus:ring-2 focus:ring-amber-400"
                                />
                                <button
                                  onClick={() => setEditingTaskDate(null)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingTaskDate(task.id)}
                                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 p-1.5 hover:bg-amber-50 rounded-lg transition-all"
                                title={`Move task (current: ${task.date})`}
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
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
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-visible border-2 border-indigo-200">
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
                          // Compute task count and study time dynamically from tasks
                          const chapterTasks = tasks.filter(t => t.subject === viewingSubject.name && t.chapter === chapterName);
                          const dynamicTaskCount = chapterTasks.length;
                          const dynamicStudyTime = chapterTasks.reduce((sum, t) => sum + (parseInt(t.duration) || 0), 0);
                          const lastTask = chapterTasks.filter(t => t.completed).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                          const dynamicLastStudied = lastTask ? lastTask.date : normalizedChapter.lastStudied;
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
                                    {(dynamicLastStudied || dynamicTaskCount > 0 || dynamicStudyTime > 0) && (
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                        {dynamicLastStudied && (
                                          <span>📅 Last: {new Date(dynamicLastStudied).toLocaleDateString()}</span>
                                        )}
                                        {dynamicTaskCount > 0 && (
                                          <span>📝 {dynamicTaskCount} tasks</span>
                                        )}
                                        {dynamicStudyTime > 0 && (
                                          <span>⏱️ {dynamicStudyTime} min</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    const deletedChapter = viewingSubject.chapters[i];
                                    const deletedName = typeof deletedChapter === 'string' ? deletedChapter : deletedChapter.name;
                                    const updatedChapters = viewingSubject.chapters.filter((_, idx) => idx !== i);
                                    const updated = subjects.map(s => 
                                      s.id === viewingSubject.id 
                                        ? { ...s, chapters: updatedChapters }
                                        : s
                                    );
                                    setSubjects(updated);
                                    setViewingSubject({ ...viewingSubject, chapters: updatedChapters });
                                    await supabase.from('subjects').update({ chapters: updatedChapters }).eq('id', viewingSubject.id);
                                    // Also remove from exams
                                    if (deletedName) {
                                      await removeChapterFromExams(viewingSubject.name, deletedName);
                                    }
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
                          // Compute task count and study time dynamically from tasks
                          const chapterTasks = tasks.filter(t => t.subject === viewingSubject.name && t.chapter === chapterName);
                          const dynamicTaskCount = chapterTasks.length;
                          const dynamicStudyTime = chapterTasks.reduce((sum, t) => sum + (parseInt(t.duration) || 0), 0);
                          const lastCompletedTask = chapterTasks.filter(t => t.completed).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                          const dynamicLastStudied = lastCompletedTask ? lastCompletedTask.date : normalizedChapter.lastStudied;
                          const statusColor = {
                            pending: 'bg-gray-100 text-gray-600 border-gray-300',
                            started: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                            self_study_done: 'bg-teal-100 text-teal-700 border-teal-300',
                            reviewed: 'bg-blue-100 text-blue-700 border-blue-300',
                            completed: 'bg-green-100 text-green-700 border-green-300'
                          }[normalizedChapter.status];
                          
                          return (
                            <div key={i} className={`p-3 bg-white rounded-lg border-2 group hover:shadow-md transition-all ${statusColor}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="font-semibold text-gray-800 truncate">{i + 1}. {chapterName}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      const statuses = ['pending', 'started', 'self_study_done', 'reviewed', 'completed'];
                                      const currentIndex = statuses.indexOf(normalizedChapter.status);
                                      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                      updateSubjectChapterStatus(viewingSubject.id, i, nextStatus);
                                    }}
                                    className={`text-xs px-3 py-1.5 rounded-lg border-2 font-semibold cursor-pointer hover:opacity-80 transition-all ${
                                      normalizedChapter.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                                      normalizedChapter.status === 'reviewed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                      normalizedChapter.status === 'self_study_done' ? 'bg-teal-100 text-teal-700 border-teal-300' :
                                      normalizedChapter.status === 'started' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                      'bg-gray-100 text-gray-600 border-gray-300'
                                    }`}
                                    title="Click to cycle: Pending → Started → Self Study Done → Reviewed → Completed"
                                  >
                                    {normalizedChapter.status === 'completed' ? '✅ Completed' :
                                     normalizedChapter.status === 'reviewed' ? '🔍 Reviewed' :
                                     normalizedChapter.status === 'self_study_done' ? '📝 Self Study Done' :
                                     normalizedChapter.status === 'started' ? '📖 Started' :
                                     '📋 Pending'}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const deletedChapter = viewingSubject.chapters[i];
                                      const deletedName = typeof deletedChapter === 'string' ? deletedChapter : deletedChapter.name;
                                      const updatedChapters = viewingSubject.chapters.filter((_, idx) => idx !== i);
                                      const updated = subjects.map(s => 
                                        s.id === viewingSubject.id 
                                          ? { ...s, chapters: updatedChapters }
                                          : s
                                      );
                                      setSubjects(updated);
                                      setViewingSubject({ ...viewingSubject, chapters: updatedChapters });
                                      await supabase.from('subjects').update({ chapters: updatedChapters }).eq('id', viewingSubject.id);
                                      // Also remove from exams
                                      if (deletedName) {
                                        await removeChapterFromExams(viewingSubject.name, deletedName);
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/50 px-2 py-1 rounded">
                                  📝 <strong>{dynamicTaskCount}</strong> tasks
                                </div>
                                <div className="bg-white/50 px-2 py-1 rounded">
                                  ⏱️ <strong>{dynamicStudyTime}</strong> min
                                </div>
                                {dynamicLastStudied && (
                                  <div className="bg-white/50 px-2 py-1 rounded col-span-2">
                                    📅 Last: <strong>{new Date(dynamicLastStudied).toLocaleDateString()}</strong>
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

        {/* Exams View - Split Panel Layout */}
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

            {/* Split Panel Layout for Exams */}
            <div className="space-y-4">
              {/* Exam Selector Bar */}
              {!showAddExam && selectedExamData && (
                <div className="glass-card rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                      <Book className="w-5 h-5 text-indigo-600" />
                      {editingExam === selectedExamData.id ? (
                        <div className="flex-1 flex items-center gap-3 flex-wrap">
                          <input
                            type="text"
                            value={selectedExamData.name}
                            onChange={(e) => {
                              const updatedExams = exams.map(ex => 
                                ex.id === selectedExamData.id ? { ...ex, name: e.target.value } : ex
                              );
                              setExams(updatedExams);
                            }}
                            onBlur={() => updateExam(selectedExamData.id, { name: selectedExamData.name })}
                            className="flex-1 min-w-[200px] px-3 py-2 text-base font-semibold border-2 border-indigo-400 rounded-lg bg-white focus:ring-2 focus:ring-indigo-300"
                            placeholder="Exam name"
                          />
                          <input
                            type="date"
                            value={selectedExamData.date}
                            onChange={(e) => {
                              const updatedExams = exams.map(ex => 
                                ex.id === selectedExamData.id ? { ...ex, date: e.target.value } : ex
                              );
                              setExams(updatedExams);
                            }}
                            onBlur={() => updateExam(selectedExamData.id, { date: selectedExamData.date })}
                            className="px-3 py-2 border-2 border-indigo-400 rounded-lg bg-white"
                          />
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedExamId || ''}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="flex-1 max-w-md px-3 py-2 text-base font-semibold border-2 border-gray-200 rounded-lg bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                          >
                            {getUpcomingExams().map(exam => (
                              <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                          </select>
                          <div className="text-sm text-gray-600 font-medium">
                            {formatDateWithDay(selectedExamData.date)}
                          </div>
                        </>
                      )}
                      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{selectedExamData.subjects?.length || 0} subjects</span>
                        <span>•</span>
                        <span className={`font-semibold ${selectedExamProgress.percentage >= 75 ? 'text-green-600' : selectedExamProgress.percentage >= 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {selectedExamProgress.percentage}% complete
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingExam === selectedExamData.id ? (
                        <button
                          onClick={() => setEditingExam(null)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Done</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingExam(selectedExamData.id)}
                          className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-all text-sm font-medium flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit Exam</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowAddExam(true)}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Exam</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Subject List */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="glass-card rounded-lg shadow-lg p-4 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-gray-900">Subjects</h2>
                      <div className="flex items-center gap-2">
                        {!showAddExam && selectedExamData && (
                          <button
                            onClick={() => {
                              setEditingExam(selectedExamData.id);
                              setSelectedSubjectIndex(null);
                            }}
                            className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 transition-all flex items-center gap-1"
                            title="Add new subject to this exam"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        )}
                        {!showAddExam && selectedExamData && editingExam === selectedExamData.id && (
                          <button
                            onClick={() => setEditingExam(null)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-all"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>

                    {!showAddExam && selectedExamData ? (
                      selectedExamData.subjects && selectedExamData.subjects.length > 0 ? (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {selectedExamData.subjects
                            .map((subject, originalIdx) => ({ subject, originalIdx }))
                            .sort((a, b) => new Date(a.subject.date) - new Date(b.subject.date))
                            .map(({ subject, originalIdx }) => {
                            const daysLeft = getDaysUntil(subject.date);
                            const subjectProgress = {
                              completed: subject.chapters?.filter(c => c.status === 'completed').length || 0,
                              reviewed: subject.chapters?.filter(c => c.status === 'reviewed').length || 0,
                              selfStudyDone: subject.chapters?.filter(c => c.status === 'self_study_done').length || 0,
                              started: subject.chapters?.filter(c => c.status === 'started').length || 0,
                              pending: subject.chapters?.filter(c => c.status === 'pending').length || 0,
                              total: subject.chapters?.length || 0
                            };
                            subjectProgress.percentage = subjectProgress.total > 0 
                              ? Math.round((subjectProgress.completed / subjectProgress.total) * 100) 
                              : 0;
                            const isSelected = selectedSubjectIndex === originalIdx;
                            
                            return (
                              <button
                                key={originalIdx}
                                onClick={() => setSelectedSubjectIndex(originalIdx)}
                                className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md' 
                                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-indigo-300'
                                }`}
                              >
                                <div className="font-semibold text-sm text-gray-900 mb-1">
                                  {subject.subject}
                                </div>
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className={`font-medium ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-indigo-600'}`}>
                                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                                  </span>
                                  <span className="text-gray-600">
                                    {formatDateWithDay(subject.date).split(',')[0]}
                                  </span>
                                </div>
                                {subjectProgress.total > 0 && (
                                  <>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                      <div
                                        className={`h-1.5 rounded-full transition-all ${
                                          subjectProgress.percentage >= 75 ? 'bg-green-500' : subjectProgress.percentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${subjectProgress.percentage}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                      <span>{subjectProgress.completed}/{subjectProgress.total} chapters</span>
                                      <span className="font-semibold">{subjectProgress.percentage}%</span>
                                    </div>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
                          <p className="text-gray-500 text-sm mb-3">No subjects yet</p>
                          {editingExam === selectedExamData.id && (
                            <p className="text-xs text-gray-400">Use the form on the right to add subjects</p>
                          )}
                        </div>
                      )
                    ) : showAddExam ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <Plus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>Create an exam first</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
                        <p className="text-gray-500 text-sm">No exams yet</p>
                        <button
                          onClick={() => setShowAddExam(true)}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Create your first exam
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Subject Details */}
                <div className="lg:col-span-3">
                {/* Add Exam Modal (shown in right panel when active) */}
                {showAddExam && (
                  <div className="glass-card rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-600" />
                      Create New Exam
                    </h3>
                    <div className="space-y-3">
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
                                  const chName = e.target.value;
                                  setNewExamSubject({
                                    ...newExamSubject,
                                    chapters: [...newExamSubject.chapters, { name: chName, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: false }]
                                  });
                                  syncChapterToSubject(newExamSubject.subject, chName);
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
                                const isExamOnly = examChapterExamOnly;
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput.trim(), status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: isExamOnly }]
                                });
                                if (!isExamOnly) syncChapterToSubject(newExamSubject.subject, examChapterInput.trim());
                                setExamChapterInput('');
                              }
                            }}
                            className="flex-1 p-2 border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => {
                              if (examChapterInput.trim()) {
                                const isExamOnly = examChapterExamOnly;
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput.trim(), status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: isExamOnly }]
                                });
                                if (!isExamOnly) syncChapterToSubject(newExamSubject.subject, examChapterInput.trim());
                                setExamChapterInput('');
                              }
                            }}
                            className="px-3 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                          >
                            Add
                          </button>
                        </div>
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={examChapterExamOnly}
                            onChange={(e) => setExamChapterExamOnly(e.target.checked)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-xs text-gray-600">📌 Exam only <span className="text-gray-400">(won't add to subject)</span></span>
                        </label>
                        {newExamSubject.chapters.length > 0 && (
                          <div className="space-y-1">
                            {newExamSubject.chapters.map((ch, idx) => (
                              <div key={idx} className="flex items-center justify-between p-1 bg-gray-50 rounded text-sm">
                                <span>{ch.examOnly ? '📌 ' : ''}{ch.name}</span>
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
                        setNewExamSubject({ subject: '', date: '', chapters: [], keyPoints: '', studyMode: 'Full Portion', customStudyMode: '' });
                        setExamChapterInput('');
                      }}
                      className="px-4 bg-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                    </div>
                  </div>
                )}

                {/* Selected Subject Display */}
                {!showAddExam && selectedExamData && selectedSubjectData && (
                    <div className="glass-card rounded-lg shadow-lg p-6">
                     {(() => {
                        const daysLeft = getDaysUntil(selectedSubjectData.date);
                        const subjectProgress = {
                          completed: selectedSubjectData.chapters?.filter(c => c.status === 'completed').length || 0,
                          reviewed: selectedSubjectData.chapters?.filter(c => c.status === 'reviewed').length || 0,
                          selfStudyDone: selectedSubjectData.chapters?.filter(c => c.status === 'self_study_done').length || 0,
                          started: selectedSubjectData.chapters?.filter(c => c.status === 'started').length || 0,
                          pending: selectedSubjectData.chapters?.filter(c => c.status === 'pending').length || 0,
                          total: selectedSubjectData.chapters?.length || 0
                        };
                        subjectProgress.percentage = subjectProgress.total > 0 
                          ? Math.round((subjectProgress.completed / subjectProgress.total) * 100) 
                          : 0;

                        return (
                          <>
                            {/* Subject Header */}
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex-1">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubjectData.subject}</h3>
                                <div className="flex items-center gap-4">
                                  {editingExam === selectedExamData.id ? (
                                    <input
                                      type="date"
                                      value={selectedSubjectData.date}
                                      onChange={(e) => {
                                        const updatedSubjects = [...selectedExamData.subjects];
                                        updatedSubjects[selectedSubjectIndex] = { ...selectedSubjectData, date: e.target.value };
                                        updateExam(selectedExamData.id, { subjects: updatedSubjects });
                                      }}
                                      className="px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white"
                                    />
                                  ) : (
                                    <p className="text-gray-600">{formatDateWithDay(selectedSubjectData.date)}</p>
                                  )}
                                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                                    daysLeft <= 3 ? 'bg-rose-100 text-rose-700' : 
                                    daysLeft <= 7 ? 'bg-orange-100 text-orange-700' : 
                                    'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                                  </div>
                                </div>
                              </div>
                              {editingExam === selectedExamData.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete ${selectedSubjectData.subject} from this exam?`)) {
                                      deleteSubjectFromExam(selectedExamData.id, selectedSubjectIndex);
                                      setSelectedSubjectIndex(Math.max(0, selectedSubjectIndex - 1));
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete subject"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>

                            {/* Exam Marks Section */}
                            {(daysLeft < 0 || editingExam === selectedExamData.id) && (
                              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <label className="text-sm font-semibold text-gray-700">Exam Marks:</label>
                                  <input
                                    type="text"
                                    value={selectedSubjectData.marksInput ?? ''}
                                    onChange={(e) => {
                                      const input = e.target.value.trim();
                                      let percentage = null;
                                      
                                      if (input) {
                                        if (input.includes('/') || input.includes('\\')) {
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
                                          const num = parseFloat(input);
                                          if (!isNaN(num) && num >= 0 && num <= 100) {
                                            percentage = num;
                                          }
                                        }
                                      }
                                      
                                      const updatedSubjects = [...selectedExamData.subjects];
                                      updatedSubjects[selectedSubjectIndex] = { 
                                        ...selectedSubjectData, 
                                        marksInput: input,
                                        marks: percentage 
                                      };
                                      updateExam(selectedExamData.id, { subjects: updatedSubjects });
                                    }}
                                    placeholder="e.g., 45/50, 45\\50 or 90"
                                    className="w-32 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                  />
                                  {selectedSubjectData.marks != null && selectedSubjectData.marks >= 0 && (
                                    <>
                                      <span className="text-lg font-bold text-indigo-600">
                                        = {selectedSubjectData.marks}%
                                      </span>
                                      <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                                        selectedSubjectData.marks === 100 ? 'bg-green-100 text-green-700' :
                                        selectedSubjectData.marks >= 95 ? 'bg-blue-100 text-blue-700' :
                                        selectedSubjectData.marks >= 90 ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {selectedSubjectData.marks === 100 ? (
                                          <><Trophy className="w-4 h-4 inline" /> Perfect!</>
                                        ) : selectedSubjectData.marks >= 95 ? (
                                          <><Star className="w-4 h-4 inline" /> Excellence!</>
                                        ) : selectedSubjectData.marks >= 90 ? (
                                          <><Sparkles className="w-4 h-4 inline" /> Outstanding!</>
                                        ) : selectedSubjectData.marks >= 75 ? (
                                          <><ThumbsUp className="w-4 h-4 inline" /> Good</>
                                        ) : selectedSubjectData.marks >= 60 ? (
                                          <><Check className="w-4 h-4 inline" /> Pass</>
                                        ) : (
                                          <><BookOpen className="w-4 h-4 inline" /> Keep Learning</>
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {selectedSubjectData.marks != null && selectedSubjectData.marks >= 90 && (
                                  <div className="text-sm text-green-600 mt-2 font-semibold flex items-center gap-2">
                                    <Gift className="w-4 h-4" /> Bonus Points: +{selectedSubjectData.marks === 100 ? '300' : selectedSubjectData.marks >= 95 ? '200' : '100'}!
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Subject Progress */}
                            {subjectProgress.total > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                                  <span className="font-semibold">Chapter Progress</span>
                                  <span className="font-bold text-lg">{subjectProgress.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                  <div
                                    className={`h-3 rounded-full transition-all ${
                                      subjectProgress.percentage >= 75 ? 'bg-green-500' : 
                                      subjectProgress.percentage >= 50 ? 'bg-yellow-500' : 
                                      'bg-gray-400'
                                    }`}
                                    style={{ width: `${subjectProgress.percentage}%` }}
                                  />
                                </div>
                                <div className="flex gap-4 text-sm flex-wrap">
                                  <span className="text-green-600 flex items-center gap-1 font-medium">
                                    <Check className="w-4 h-4" /> {subjectProgress.completed} Completed
                                  </span>
                                  <span className="text-blue-600 flex items-center gap-1 font-medium">
                                    <BookOpen className="w-4 h-4" /> {subjectProgress.reviewed || 0} Reviewed
                                  </span>
                                  <span className="text-teal-600 flex items-center gap-1 font-medium">
                                    <BookOpen className="w-4 h-4" /> {subjectProgress.selfStudyDone || 0} Self Study Done
                                  </span>
                                  <span className="text-yellow-600 flex items-center gap-1 font-medium">
                                    <Zap className="w-4 h-4" /> {subjectProgress.started} Started
                                  </span>
                                  <span className="text-gray-600 flex items-center gap-1 font-medium">
                                    <Circle className="w-4 h-4" /> {subjectProgress.pending} Pending
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Chapters */}
                            {selectedSubjectData.chapters && selectedSubjectData.chapters.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Chapters</h4>
                                <div className="space-y-2">
                                  {selectedSubjectData.chapters.map((chapter, chapterIdx) => {
                                    const revisionsNeeded = chapter.revisionsNeeded ?? 0;
                                    const revisionsCompleted = chapter.revisionsCompleted ?? 0;
                                    
                                    return (
                                      <div key={chapterIdx} className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${chapter.examOnly ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 hover:border-indigo-300'}`}>
                                        <div className="flex-1 text-base font-medium text-gray-900">
                                          {chapter.examOnly && <span className="text-orange-500 mr-1" title="Exam only - not in subject chapters">📌</span>}
                                          {chapter.name}
                                        </div>
                                        
                                        {/* Revision Counter */}
                                        {revisionsNeeded > 0 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!editingExam) {
                                                if (e.shiftKey && revisionsCompleted > 0) {
                                                  decrementChapterRevision(selectedExamData.id, selectedSubjectIndex, chapterIdx);
                                                } else if (revisionsCompleted < revisionsNeeded) {
                                                  incrementChapterRevision(selectedExamData.id, selectedSubjectIndex, chapterIdx);
                                                }
                                              }
                                            }}
                                            onContextMenu={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (!editingExam && revisionsCompleted > 0) {
                                                decrementChapterRevision(selectedExamData.id, selectedSubjectIndex, chapterIdx);
                                              }
                                            }}
                                            className={`text-sm px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 ${
                                              revisionsCompleted >= revisionsNeeded 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-orange-100 text-orange-700 cursor-pointer hover:opacity-80'
                                            }`}
                                            title={editingExam ? 'Set revision count in edit mode' : 'Click to add • Right-click or Shift+Click to remove'}
                                            disabled={editingExam === selectedExamData.id}
                                          >
                                            <BookOpen className="w-4 h-4" /> {revisionsCompleted}/{revisionsNeeded}
                                          </button>
                                        )}
                                        
                                        {/* Edit Mode Controls */}
                                        {editingExam === selectedExamData.id ? (
                                          <>
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              value={revisionsNeeded}
                                              onChange={(e) => {
                                                const newNeeded = parseInt(e.target.value) || 0;
                                                const newCompleted = Math.min(revisionsCompleted, newNeeded);
                                                updateChapterRevisions(selectedExamData.id, selectedSubjectIndex, chapterIdx, newNeeded, newCompleted);
                                              }}
                                              className="w-16 text-sm px-2 py-1.5 border-2 border-gray-300 rounded-lg text-center"
                                              placeholder="Rev"
                                              title="Number of revisions needed"
                                            />
                                            <select
                                              value={chapter.status}
                                              onChange={(e) => updateChapterStatus(selectedExamData.id, selectedSubjectIndex, chapterIdx, e.target.value)}
                                              className={`text-sm px-3 py-1.5 rounded-lg font-medium border-2 ${
                                                chapter.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                                                chapter.status === 'reviewed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                                chapter.status === 'self_study_done' ? 'bg-teal-100 text-teal-700 border-teal-300' :
                                                chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                'bg-gray-100 text-gray-600 border-gray-300'
                                              }`}
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="started">Started</option>
                                              <option value="self_study_done">Self Study Done</option>
                                              <option value="reviewed">Reviewed</option>
                                              <option value="completed">Completed</option>
                                            </select>
                                            <select
                                              value={chapter.studyMode || 'Full Portions'}
                                              onChange={(e) => updateChapterStudyMode(selectedExamData.id, selectedSubjectIndex, chapterIdx, e.target.value, chapter.customStudyMode || '')}
                                              className="text-sm px-3 py-1.5 rounded-lg font-medium border-2 bg-purple-50 text-purple-700 border-purple-300"
                                            >
                                              <option value="Full Portions">Full Portions</option>
                                              <option value="Objective">Objective</option>
                                              <option value="Custom">Custom</option>
                                            </select>
                                            {chapter.studyMode === 'Custom' && (
                                              <input
                                                type="text"
                                                value={chapter.customStudyMode || ''}
                                                onChange={(e) => updateChapterStudyMode(selectedExamData.id, selectedSubjectIndex, chapterIdx, 'Custom', e.target.value)}
                                                placeholder="Custom mode..."
                                                className="w-32 text-sm px-2 py-1.5 border-2 border-purple-300 rounded-lg"
                                              />
                                            )}
                                            <button
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                const newExamOnly = !chapter.examOnly;
                                                const subjectName = selectedSubjectData.subject;
                                                const chapterName = chapter.name;
                                                
                                                const updatedSubjects = [...selectedExamData.subjects];
                                                const updatedChapters = [...updatedSubjects[selectedSubjectIndex].chapters];
                                                updatedChapters[chapterIdx] = { ...updatedChapters[chapterIdx], examOnly: newExamOnly };
                                                updatedSubjects[selectedSubjectIndex] = { ...updatedSubjects[selectedSubjectIndex], chapters: updatedChapters };
                                                await updateExam(selectedExamData.id, { subjects: updatedSubjects });
                                                
                                                // Sync: if marking exam-only, remove from subject; if unmarking, add to subject
                                                if (newExamOnly) {
                                                  await removeChapterFromSubject(subjectName, chapterName);
                                                } else {
                                                  await syncChapterToSubject(subjectName, chapterName);
                                                }
                                              }}
                                              className={`text-sm px-2 py-1.5 rounded-lg font-medium border-2 transition-all ${
                                                chapter.examOnly 
                                                  ? 'bg-orange-100 text-orange-700 border-orange-300' 
                                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-orange-300'
                                              }`}
                                              title={chapter.examOnly ? 'Exam only (click to sync to subject)' : 'Synced to subject (click to make exam only)'}
                                            >
                                              📌
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChapterFromExamSubject(selectedExamData.id, selectedSubjectIndex, chapterIdx);
                                              }}
                                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-all"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const statuses = ['pending', 'started', 'self_study_done', 'reviewed', 'completed'];
                                                const currentIndex = statuses.indexOf(chapter.status);
                                                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                                updateChapterStatus(selectedExamData.id, selectedSubjectIndex, chapterIdx, nextStatus);
                                              }}
                                              className={`text-sm px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:opacity-80 transition-all ${
                                                chapter.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                chapter.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                                chapter.status === 'self_study_done' ? 'bg-teal-100 text-teal-700' :
                                                chapter.status === 'started' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                              }`}
                                              title="Click to cycle through statuses"
                                            >
                                              {chapter.status}
                                            </button>
                                            <span className="text-sm px-3 py-1.5 rounded-lg font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                              {chapter.studyMode === 'Custom' && chapter.customStudyMode 
                                                ? chapter.customStudyMode 
                                                : chapter.studyMode || 'Full Portions'}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Add Chapter (Edit Mode Only) */}
                            {editingExam === selectedExamData.id && (
                              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                  <Plus className="w-5 h-5 text-green-600" />
                                  <span className="text-sm font-semibold text-gray-700">Add Chapter</span>
                                </div>
                                
                                {/* Quick select from subject's chapters */}
                                {(() => {
                                  const selectedChapters = new Set((selectedSubjectData.chapters || []).map(ch => ch?.name));
                                  const availableChapters = getChapterNamesForSubject(selectedSubjectData.subject).filter(
                                    (chapterName) => !selectedChapters.has(chapterName)
                                  );
                                  
                                  return availableChapters.length > 0 && (
                                    <div>
                                      <label className="text-xs text-gray-600 block mb-1">Quick add from {selectedSubjectData.subject}:</label>
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            addChapterToExamSubject(selectedExamData.id, selectedSubjectIndex, e.target.value, false);
                                            e.target.value = '';
                                          }
                                        }}
                                        className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white"
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
                                  <label className="text-xs text-gray-600 block mb-1">Or add manually:</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Chapter name..."
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                          addChapterToExamSubject(selectedExamData.id, selectedSubjectIndex, e.target.value.trim(), examChapterExamOnly);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                                    />
                                    <button
                                      onClick={(e) => {
                                        const input = e.target.previousSibling;
                                        if (input.value.trim()) {
                                          addChapterToExamSubject(selectedExamData.id, selectedSubjectIndex, input.value.trim(), examChapterExamOnly);
                                          input.value = '';
                                        }
                                      }}
                                      className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                    >
                                      Add
                                    </button>
                                  </div>
                                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={examChapterExamOnly}
                                      onChange={(e) => setExamChapterExamOnly(e.target.checked)}
                                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-xs text-gray-600">📌 Exam only <span className="text-gray-400">(won't add to subject chapters)</span></span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* Notes/Key Points */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes & Key Points</h4>
                              {editingExam === selectedExamData.id ? (
                                <textarea
                                  value={selectedSubjectData.keyPoints || ''}
                                  onChange={(e) => {
                                    const updatedSubjects = [...selectedExamData.subjects];
                                    updatedSubjects[selectedSubjectIndex] = { ...selectedSubjectData, keyPoints: e.target.value };
                                    updateExam(selectedExamData.id, { subjects: updatedSubjects });
                                  }}
                                  placeholder="Add key points, formulas, important topics..."
                                  className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                  rows="4"
                                />
                              ) : selectedSubjectData.keyPoints ? (
                                <div className="text-base text-gray-700 whitespace-pre-line bg-white p-4 rounded-lg border border-gray-200">
                                  {selectedSubjectData.keyPoints}
                                </div>
                              ) : (
                                <div className="text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  No notes added yet
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                )}

                {/* Add New Subject to Exam */}
                {!showAddExam && selectedExamData && editingExam === selectedExamData.id && (!selectedExamData.subjects || selectedExamData.subjects.length === 0 || selectedSubjectIndex === null) && (
                  <div className="glass-card rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Add Subject to {selectedExamData.name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <select
                        value={newExamSubject.subject}
                        onChange={(e) => setNewExamSubject({ ...newExamSubject, subject: e.target.value, chapters: [] })}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
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
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                        placeholder="Exam date"
                      />
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">Chapters:</label>
                        
                        {/* Quick select from subject's chapters */}
                        {newExamSubject.subject && (() => {
                          const selectedChapters = new Set((newExamSubject.chapters || []).map(ec => ec.name));
                          const availableChapters = getChapterNamesForSubject(newExamSubject.subject).filter(
                            chapterName => !selectedChapters.has(chapterName)
                          );
                          
                          return availableChapters.length > 0 && (
                            <div className="mb-2">
                              <label className="text-xs text-gray-600 block mb-1">Quick add from {newExamSubject.subject}:</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const chName = e.target.value;
                                    setNewExamSubject({
                                      ...newExamSubject,
                                      chapters: [...newExamSubject.chapters, { name: chName, status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: false }]
                                    });
                                    syncChapterToSubject(newExamSubject.subject, chName);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white"
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
                                const isExamOnly = examChapterExamOnly;
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput.trim(), status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: isExamOnly }]
                                });
                                if (!isExamOnly) syncChapterToSubject(newExamSubject.subject, examChapterInput.trim());
                                setExamChapterInput('');
                              }
                            }}
                            className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => {
                              if (examChapterInput.trim()) {
                                const isExamOnly = examChapterExamOnly;
                                setNewExamSubject({
                                  ...newExamSubject,
                                  chapters: [...newExamSubject.chapters, { name: examChapterInput.trim(), status: 'pending', revisionsNeeded: 0, revisionsCompleted: 0, studyMode: 'Full Portions', customStudyMode: '', examOnly: isExamOnly }]
                                });
                                if (!isExamOnly) syncChapterToSubject(newExamSubject.subject, examChapterInput.trim());
                                setExamChapterInput('');
                              }
                            }}
                            className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Add
                          </button>
                        </div>
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={examChapterExamOnly}
                            onChange={(e) => setExamChapterExamOnly(e.target.checked)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-xs text-gray-600">📌 Exam only <span className="text-gray-400">(won't add to subject)</span></span>
                        </label>
                        
                        {/* Display added chapters */}
                        {newExamSubject.chapters.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {newExamSubject.chapters.map((ch, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <span className="text-gray-700">{ch.examOnly ? '📌 ' : ''}{ch.name}</span>
                                <button
                                  onClick={() => {
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
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                        rows="3"
                      />
                      
                      <button
                        onClick={async () => {
                          await addSubjectToExistingExam(selectedExamData.id);
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold text-lg"
                        disabled={!newExamSubject.subject || !newExamSubject.date}
                      >
                        + Add {newExamSubject.subject ? `"${newExamSubject.subject}"` : 'Subject'} to {selectedExamData.name}
                      </button>
                    </div>
                  </div>
                )}

                {/* No Subject Selected */}
                {!showAddExam && selectedExamData && !selectedSubjectData && (
                  <div className="glass-card rounded-lg shadow-lg p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No subjects yet</h3>
                    <p className="text-gray-500 mb-4">Add subjects to this exam to start tracking your progress</p>
                    {editingExam !== selectedExamData.id && (
                      <button
                        onClick={() => setEditingExam(selectedExamData.id)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
                      >
                        Edit Exam to Add Subjects
                      </button>
                    )}
                  </div>
                )}

                {/* No Exam Selected */}
                {!showAddExam && !selectedExamId && getUpcomingExams().length > 0 && (
                  <div className="glass-card rounded-lg shadow-lg p-12 text-center">
                    <Book className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an exam to view details</h3>
                    <p className="text-gray-500">Use the dropdown above to select an exam and view its subjects</p>
                  </div>
                )}

                {/* No Exams At All */}
                {!showAddExam && getUpcomingExams().length === 0 && (
                  <div className="glass-card rounded-lg shadow-lg p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first exam</p>
                    <button
                      onClick={() => setShowAddExam(true)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Exam
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Exams Section (outside split panel) */}
            {getPastExams().length > 0 && (
              <div className="glass-card rounded-lg shadow-lg overflow-hidden">
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
                                <div key={subjectIdx} className="bg-white rounded px-2 py-1.5 border border-gray-100">
                                  <div className="flex items-center gap-2">
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
                                  {subject.keyPoints && (
                                    <div className="mt-1 text-xs text-gray-500 italic truncate" title={subject.keyPoints}>
                                      📝 {subject.keyPoints}
                                    </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNewReminder({ title: '', date: selectedDate, description: '' });
                          setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [selectedDateObj.getDay()] });
                          setCalendarReminderType('one-time');
                          setShowCalendarAddReminder(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
                        title="Add reminder for this day"
                      >
                        <Plus className="w-4 h-4" />
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        title="Close"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {!hasEvents ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 italic mb-4">No events on this day</p>
                      {!showCalendarAddReminder && (
                        <button
                          onClick={() => {
                            setNewReminder({ title: '', date: selectedDate, description: '' });
                            setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [selectedDateObj.getDay()] });
                            setCalendarReminderType('one-time');
                            setShowCalendarAddReminder(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <Bell className="w-4 h-4" />
                          Add a Reminder
                        </button>
                      )}
                    </div>
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
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-500 text-lg">{reminder.title}</div>
                                    {reminder.description && (
                                      <div className="mt-2 text-sm text-gray-500 whitespace-pre-wrap">
                                        {reminder.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => startEditReminder(reminder)}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteReminder(reminder.id)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
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
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
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
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => startEditRecurringReminder(reminder)}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteRecurringReminder(reminder.id)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Edit One-Time Reminder (Calendar) */}
                  {editingReminder && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 space-y-4 shadow-md">
                      <h4 className="font-semibold text-gray-700 text-lg">✏️ Edit Reminder</h4>
                      <input
                        type="text"
                        placeholder="Reminder title"
                        value={editReminderData.title}
                        onChange={(e) => setEditReminderData({ ...editReminderData, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium shadow-sm"
                      />
                      <input
                        type="date"
                        value={editReminderData.date}
                        onChange={(e) => setEditReminderData({ ...editReminderData, date: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={editReminderData.description}
                        onChange={(e) => setEditReminderData({ ...editReminderData, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={updateReminder}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold shadow-md transition-all"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingReminder(null);
                            setEditReminderData({ title: '', date: '', description: '' });
                          }}
                          className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Edit Recurring Reminder (Calendar) */}
                  {editingRecurringReminder && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 space-y-4 shadow-md">
                      <h4 className="font-semibold text-gray-700 text-lg">✏️ Edit Recurring Reminder</h4>
                      <input
                        type="text"
                        placeholder="Reminder title"
                        value={newRecurringReminder.title}
                        onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium shadow-sm"
                      />
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 Start Time</label>
                          <input
                            type="time"
                            value={newRecurringReminder.time}
                            onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, time: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 End Time</label>
                          <input
                            type="time"
                            value={newRecurringReminder.end_time}
                            onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, end_time: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder="Description (optional)"
                        value={newRecurringReminder.description}
                        onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
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
                              className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                                newRecurringReminder.days.includes(idx)
                                  ? 'bg-blue-500 text-white scale-105 shadow-md'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-md transition-all"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecurringReminder(null);
                            setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                          }}
                          className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Calendar Add Reminder Form */}
                  {showCalendarAddReminder && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 space-y-4 shadow-md">
                      <h4 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600" /> Add Reminder
                      </h4>
                      
                      {/* Reminder Type Selector */}
                      <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <button
                          onClick={() => setCalendarReminderType('one-time')}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            calendarReminderType === 'one-time'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          📅 One-Time
                        </button>
                        <button
                          onClick={() => setCalendarReminderType('recurring')}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                            calendarReminderType === 'recurring'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          🔁 Recurring
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder={calendarReminderType === 'one-time' ? 'Reminder title' : 'Reminder title (e.g., Tuition, Sports class)'}
                        value={calendarReminderType === 'one-time' ? newReminder.title : newRecurringReminder.title}
                        onChange={(e) => {
                          if (calendarReminderType === 'one-time') {
                            setNewReminder({ ...newReminder, title: e.target.value });
                          } else {
                            setNewRecurringReminder({ ...newRecurringReminder, title: e.target.value });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent font-medium shadow-sm"
                        autoFocus
                      />

                      {calendarReminderType === 'one-time' ? (
                        <input
                          type="date"
                          value={newReminder.date}
                          onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
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
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm text-gray-500 font-semibold block mb-2">🕐 End Time</label>
                              <input
                                type="time"
                                value={newRecurringReminder.end_time}
                                onChange={(e) => setNewRecurringReminder({ ...newRecurringReminder, end_time: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
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
                                  className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                                    newRecurringReminder.days.includes(idx)
                                      ? 'bg-blue-500 text-white scale-105 shadow-md'
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
                        value={calendarReminderType === 'one-time' ? newReminder.description : newRecurringReminder.description}
                        onChange={(e) => {
                          if (calendarReminderType === 'one-time') {
                            setNewReminder({ ...newReminder, description: e.target.value });
                          } else {
                            setNewRecurringReminder({ ...newRecurringReminder, description: e.target.value });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (calendarReminderType === 'one-time') {
                              await addReminder();
                            } else {
                              await addRecurringReminder();
                            }
                            setShowCalendarAddReminder(false);
                          }}
                          className={`flex-1 text-white py-3 rounded-xl font-semibold shadow-md transition-all ${
                            calendarReminderType === 'one-time'
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {calendarReminderType === 'one-time' ? '➕ Add Reminder' : '➕ Add Recurring Reminder'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCalendarAddReminder(false);
                            setNewReminder({ title: '', date: '', description: '' });
                            setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
                            setCalendarReminderType('one-time');
                          }}
                          className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
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

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 max-w-[90vw]"
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Admin Access</h3>
              <p className="text-sm text-gray-500 mt-1">Enter PIN to continue</p>
            </div>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false); }}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              placeholder="••••"
              autoFocus
              className={`w-full text-center text-3xl tracking-[0.5em] border-2 rounded-xl py-3 mb-4 outline-none transition-colors ${
                pinError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-amber-400'
              }`}
            />
            {pinError && (
              <p className="text-red-500 text-sm text-center mb-3">Incorrect PIN. Try again.</p>
            )}
            <button
              onClick={handlePinSubmit}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Unlock
            </button>
            <button
              onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
              className="w-full mt-2 text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTrackerApp;













