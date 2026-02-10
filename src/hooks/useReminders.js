import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useReminders = (activeProfile) => {
  const [reminders, setReminders] = useState([]);
  const [recurringReminders, setRecurringReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({ title: '', date: '', description: '' });
  const [newRecurringReminder, setNewRecurringReminder] = useState({
    title: '',
    description: '',
    time: '19:15',
    end_time: '20:00',
    days: []
  });
  const [reminderType, setReminderType] = useState('one-time');
  const [editingReminder, setEditingReminder] = useState(null);
  const [editReminderData, setEditReminderData] = useState({ title: '', date: '', description: '' });
  const [editingRecurringReminder, setEditingRecurringReminder] = useState(null);
  const [expandedReminders, setExpandedReminders] = useState({});

  // Load reminders when active profile changes
  useEffect(() => {
    const loadReminders = async () => {
      if (!activeProfile?.id) {
        setReminders([]);
        setRecurringReminders([]);
        return;
      }

      try {
        const [remindersResult, recurringResult] = await Promise.all([
          supabase.from('reminders').select('*').eq('profile_id', activeProfile.id),
          supabase.from('recurring_reminders').select('*').eq('profile_id', activeProfile.id)
        ]);

        if (remindersResult.error) throw remindersResult.error;
        if (recurringResult.error) throw recurringResult.error;

        setReminders(remindersResult.data || []);
        setRecurringReminders(recurringResult.data || []);
      } catch (error) {
        console.error('Error loading reminders:', error);
        setReminders([]);
        setRecurringReminders([]);
      }
    };

    loadReminders();
  }, [activeProfile?.id]);

  // Add one-time reminder
  const addReminder = async () => {
    if (newReminder.title && newReminder.date && activeProfile) {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          profile_id: activeProfile.id,
          title: newReminder.title,
          date: newReminder.date,
          description: newReminder.description || null
        }])
        .select();

      if (error) {
        console.error('Error adding reminder:', error);
        return;
      }

      if (data) {
        setReminders([...reminders, ...data]);
      }

      setNewReminder({ title: '', date: '', description: '' });
    }
  };

  // Add recurring reminder
  const addRecurringReminder = async () => {
    if (newRecurringReminder.title && newRecurringReminder.days.length > 0 && activeProfile) {
      const { data, error } = await supabase
        .from('recurring_reminders')
        .insert([{
          profile_id: activeProfile.id,
          title: newRecurringReminder.title,
          description: newRecurringReminder.description || null,
          time: newRecurringReminder.time,
          end_time: newRecurringReminder.end_time,
          days: newRecurringReminder.days
        }])
        .select();

      if (error) {
        console.error('Error adding recurring reminder:', error);
        return;
      }

      if (data) {
        setRecurringReminders([...recurringReminders, ...data]);
      }

      setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
    }
  };

  // Delete one-time reminder
  const deleteReminder = async (id) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
      return;
    }

    setReminders(reminders.filter(r => r.id !== id));
  };

  // Delete recurring reminder
  const deleteRecurringReminder = async (id) => {
    const { error } = await supabase
      .from('recurring_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring reminder:', error);
      return;
    }

    setRecurringReminders(recurringReminders.filter(r => r.id !== id));
  };

  // Update one-time reminder
  const updateReminder = async () => {
    if (editingReminder && editReminderData.title && editReminderData.date) {
      const { error } = await supabase
        .from('reminders')
        .update({
          title: editReminderData.title,
          date: editReminderData.date,
          description: editReminderData.description
        })
        .eq('id', editingReminder);

      if (error) {
        console.error('Error updating reminder:', error);
        return;
      }

      setReminders(reminders.map(r =>
        r.id === editingReminder
          ? { ...r, ...editReminderData }
          : r
      ));

      setEditingReminder(null);
      setEditReminderData({ title: '', date: '', description: '' });
    }
  };

  // Update recurring reminder
  const updateRecurringReminder = async () => {
    if (!newRecurringReminder.title.trim() || newRecurringReminder.days.length === 0) {
      alert('Please fill in the title and select at least one day.');
      return;
    }

    if (editingRecurringReminder) {
      const { error } = await supabase
        .from('recurring_reminders')
        .update({
          title: newRecurringReminder.title,
          description: newRecurringReminder.description,
          time: newRecurringReminder.time,
          end_time: newRecurringReminder.end_time,
          days: newRecurringReminder.days
        })
        .eq('id', editingRecurringReminder);

      if (error) {
        console.error('Error updating recurring reminder:', error);
        return;
      }

      setRecurringReminders(recurringReminders.map(r =>
        r.id === editingRecurringReminder
          ? { ...r, ...newRecurringReminder }
          : r
      ));

      setEditingRecurringReminder(null);
      setNewRecurringReminder({ title: '', description: '', time: '19:15', end_time: '20:00', days: [] });
    }
  };

  // Start editing one-time reminder
  const startEditReminder = (reminder) => {
    setEditingReminder(reminder.id);
    setEditReminderData({
      title: reminder.title,
      date: reminder.date,
      description: reminder.description || ''
    });
  };

  // Start editing recurring reminder
  const startEditRecurringReminder = (reminder) => {
    setEditingRecurringReminder(reminder.id);
    setNewRecurringReminder({
      title: reminder.title,
      description: reminder.description || '',
      time: reminder.time,
      end_time: reminder.end_time,
      days: reminder.days
    });
  };

  return {
    // State
    reminders,
    recurringReminders,
    newReminder,
    newRecurringReminder,
    reminderType,
    editingReminder,
    editReminderData,
    editingRecurringReminder,
    expandedReminders,

    // Setters
    setReminders,
    setRecurringReminders,
    setNewReminder,
    setNewRecurringReminder,
    setReminderType,
    setEditingReminder,
    setEditReminderData,
    setEditingRecurringReminder,
    setExpandedReminders,

    // Actions
    addReminder,
    addRecurringReminder,
    deleteReminder,
    deleteRecurringReminder,
    updateReminder,
    updateRecurringReminder,
    startEditReminder,
    startEditRecurringReminder
  };
};
