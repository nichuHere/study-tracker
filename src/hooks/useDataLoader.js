import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useDataLoader = (activeProfile) => {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [recurringReminders, setRecurringReminders] = useState([]);
  const [standardActivities, setStandardActivities] = useState([
    'Read chapter',
    'Practice problems',
    'Review notes',
    'Watch video',
    'Take quiz'
  ]);
  const [sharedActivities, setSharedActivities] = useState([]);

  // Load all data for active profile
  const loadData = useCallback(async () => {
    if (!activeProfile?.id) return;

    const profileId = activeProfile.id;

    try {
      const [
        subjectsResult,
        tasksResult,
        examsResult,
        remindersResult,
        standardResult,
        recurringRemindersResult
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('profile_id', profileId),
        supabase.from('tasks').select('*').eq('profile_id', profileId),
        supabase.from('exams').select('*').eq('profile_id', profileId),
        supabase.from('reminders').select('*').eq('profile_id', profileId),
        supabase.from('standard_activities').select('*').eq('profile_id', profileId),
        supabase.from('recurring_reminders').select('*').eq('profile_id', profileId)
      ]);

      if (subjectsResult.error) console.error('Error loading subjects:', subjectsResult.error);
      if (tasksResult.error) console.error('Error loading tasks:', tasksResult.error);
      if (examsResult.error) console.error('Error loading exams:', examsResult.error);
      if (remindersResult.error) console.error('Error loading reminders:', remindersResult.error);
      if (standardResult.error) console.error('Error loading activities:', standardResult.error);
      if (recurringRemindersResult.error) console.error('Error loading recurring reminders:', recurringRemindersResult.error);

      setSubjects(subjectsResult.data || []);
      setTasks(tasksResult.data || []);
      setExams(examsResult.data || []);
      setReminders(remindersResult.data || []);
      setRecurringReminders(recurringRemindersResult.data || []);

      if (standardResult.data && standardResult.data.length > 0) {
        setStandardActivities(standardResult.data.map(a => a.name));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [activeProfile]);

  // Load data when active profile changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload specific data type
  const reloadSubjects = () => {
    if (!activeProfile?.id) return;
    supabase
      .from('subjects')
      .select('*')
      .eq('profile_id', activeProfile.id)
      .then(({ data, error }) => {
        if (error) console.error('Error reloading subjects:', error);
        else setSubjects(data || []);
      });
  };

  const reloadTasks = () => {
    if (!activeProfile?.id) return;
    supabase
      .from('tasks')
      .select('*')
      .eq('profile_id', activeProfile.id)
      .then(({ data, error }) => {
        if (error) console.error('Error reloading tasks:', error);
        else setTasks(data || []);
      });
  };

  const reloadExams = () => {
    if (!activeProfile?.id) return;
    supabase
      .from('exams')
      .select('*')
      .eq('profile_id', activeProfile.id)
      .then(({ data, error }) => {
        if (error) console.error('Error reloading exams:', error);
        else setExams(data || []);
      });
  };

  const reloadReminders = () => {
    if (!activeProfile?.id) return;
    Promise.all([
      supabase.from('reminders').select('*').eq('profile_id', activeProfile.id),
      supabase.from('recurring_reminders').select('*').eq('profile_id', activeProfile.id)
    ]).then(([remindersResult, recurringResult]) => {
      if (remindersResult.error) console.error('Error reloading reminders:', remindersResult.error);
      else setReminders(remindersResult.data || []);

      if (recurringResult.error) console.error('Error reloading recurring reminders:', recurringResult.error);
      else setRecurringReminders(recurringResult.data || []);
    });
  };

  return {
    // State
    subjects,
    tasks,
    exams,
    reminders,
    recurringReminders,
    standardActivities,
    sharedActivities,

    // Setters
    setSubjects,
    setTasks,
    setExams,
    setReminders,
    setRecurringReminders,
    setStandardActivities,
    setSharedActivities,

    // Actions
    loadData,
    reloadSubjects,
    reloadTasks,
    reloadExams,
    reloadReminders
  };
};
