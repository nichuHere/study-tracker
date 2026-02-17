import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useProfiles = (session) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileClass, setNewProfileClass] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [editingAccountName, setEditingAccountName] = useState(false);
  const [tempAccountName, setTempAccountName] = useState('');
  const [profileTab, setProfileTab] = useState('kids');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileData, setEditProfileData] = useState({ name: '', class: '', chapter_tracking_mode: 'smart' });
  const [deletingProfileId, setDeletingProfileId] = useState(null);

  // Load account name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('accountName');
    if (savedName) {
      setAccountName(savedName);
    }
  }, []);

  // Load profiles
  const loadProfiles = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    setProfiles(data || []);
    
    if (data && data.length > 0 && !activeProfile) {
      setActiveProfile(data[0]);
    }
  };

  // Add profile
  const addProfile = async () => {
    if (newProfileName && session?.user?.id) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: session.user.id,
          name: newProfileName,
          class: newProfileClass,
          chapter_tracking_mode: 'smart' // Default to Option 5 (smart tracking)
        }])
        .select();

      if (error) {
        console.error('Error adding profile:', error);
        return;
      }

      if (data && data.length > 0) {
        setProfiles([...profiles, data[0]]);
        if (!activeProfile) {
          setActiveProfile(data[0]);
        }
      }

      setNewProfileName('');
      setNewProfileClass('');
      setShowAddProfile(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    if (editingProfile && editProfileData.name) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editProfileData.name,
          class: editProfileData.class,
          chapter_tracking_mode: editProfileData.chapter_tracking_mode
        })
        .eq('id', editingProfile);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      const updatedProfiles = profiles.map(p =>
        p.id === editingProfile
          ? { ...p, name: editProfileData.name, class: editProfileData.class, chapter_tracking_mode: editProfileData.chapter_tracking_mode }
          : p
      );
      setProfiles(updatedProfiles);

      if (activeProfile?.id === editingProfile) {
        setActiveProfile({ 
          ...activeProfile, 
          name: editProfileData.name, 
          class: editProfileData.class,
          chapter_tracking_mode: editProfileData.chapter_tracking_mode
        });
      }

      setEditingProfile(null);
      setEditProfileData({ name: '', class: '', chapter_tracking_mode: 'smart' });
    }
  };

  // Delete profile
  const deleteProfile = async (profileId) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      console.error('Error deleting profile:', error);
      return;
    }

    const remainingProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(remainingProfiles);

    if (activeProfile?.id === profileId) {
      setActiveProfile(remainingProfiles[0] || null);
    }

    setDeletingProfileId(null);
  };

  // Save account name
  const saveAccountName = () => {
    localStorage.setItem('accountName', tempAccountName);
    setAccountName(tempAccountName);
    setEditingAccountName(false);
  };

  // Start editing profile
  const startEditProfile = (profile) => {
    setEditingProfile(profile.id);
    setEditProfileData({ 
      name: profile.name, 
      class: profile.class,
      chapter_tracking_mode: profile.chapter_tracking_mode || 'smart'
    });
  };

  // Cancel editing
  const cancelEditProfile = () => {
    setEditingProfile(null);
    setEditProfileData({ name: '', class: '', chapter_tracking_mode: 'smart' });
  };

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return {
    // State
    profiles,
    activeProfile,
    showAddProfile,
    newProfileName,
    newProfileClass,
    showProfileModal,
    accountName,
    editingAccountName,
    tempAccountName,
    profileTab,
    editingProfile,
    editProfileData,
    deletingProfileId,
    
    // Setters
    setActiveProfile,
    setShowAddProfile,
    setNewProfileName,
    setNewProfileClass,
    setShowProfileModal,
    setEditingAccountName,
    setTempAccountName,
    setProfileTab,
    setEditingProfile,
    setEditProfileData,
    setDeletingProfileId,
    
    // Actions
    addProfile,
    updateProfile,
    deleteProfile,
    saveAccountName,
    startEditProfile,
    cancelEditProfile,
    loadProfiles
  };
};
