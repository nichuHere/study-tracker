import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useProfiles = (session) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileClass, setNewProfileClass] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null); // base64 for new profile
  const [newParentName, setNewParentName] = useState(''); // what child calls the parent
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [editingAccountName, setEditingAccountName] = useState(false);
  const [tempAccountName, setTempAccountName] = useState('');
  const [parentPhoto, setParentPhoto] = useState(null); // base64 parent photo for celebrations
  const [parentType, setParentTypeState] = useState('mother'); // 'mother' or 'father'
  const [profileTab, setProfileTab] = useState('kids');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProfileData, setEditProfileData] = useState({ name: '', class: '', chapter_tracking_mode: 'smart', parent_name: '' });
  const [deletingProfileId, setDeletingProfileId] = useState(null);

  // Get a profile picture from the profiles array (stored in DB)
  const getProfilePic = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.profile_pic || null;
  };

  // Save/update a profile picture in Supabase
  const setProfilePic = async (profileId, base64) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_pic: base64 })
        .eq('id', profileId);

      if (error) throw error;

      // Update local state
      setProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, profile_pic: base64 } : p
      ));
      if (activeProfile?.id === profileId) {
        setActiveProfile(prev => ({ ...prev, profile_pic: base64 }));
      }
    } catch (err) {
      console.error('Error saving profile pic:', err);
    }
  };

  // Remove a profile picture
  const removeProfilePic = async (profileId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_pic: null })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.map(p =>
        p.id === profileId ? { ...p, profile_pic: null } : p
      ));
      if (activeProfile?.id === profileId) {
        setActiveProfile(prev => ({ ...prev, profile_pic: null }));
      }
    } catch (err) {
      console.error('Error removing profile pic:', err);
    }
  };

  // Handle file selection → convert to base64 and save to DB
  const handleProfilePicUpload = (file, profileId) => {
    return new Promise((resolve) => {
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (profileId) {
          setProfilePic(profileId, base64);
        }
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  // Load account name, parent photo, and parent type from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('accountName');
    if (savedName) {
      setAccountName(savedName);
    }
    const savedPhoto = localStorage.getItem('parentPhoto');
    if (savedPhoto) {
      setParentPhoto(savedPhoto);
    }
    const savedType = localStorage.getItem('parentType');
    if (savedType) {
      setParentTypeState(savedType);
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
      const insertData = {
        user_id: session.user.id,
        name: newProfileName,
        class: newProfileClass,
        chapter_tracking_mode: 'smart',
        parent_name: newParentName.trim() || 'Mamma'
      };
      // Include profile pic in the insert if one was selected
      if (newProfilePic) {
        insertData.profile_pic = newProfilePic;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([insertData])
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
      setNewProfilePic(null);
      setNewParentName('');
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
          chapter_tracking_mode: editProfileData.chapter_tracking_mode,
          parent_name: editProfileData.parent_name || 'Mamma'
        })
        .eq('id', editingProfile);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      const updatedProfiles = profiles.map(p =>
        p.id === editingProfile
          ? { ...p, name: editProfileData.name, class: editProfileData.class, chapter_tracking_mode: editProfileData.chapter_tracking_mode, parent_name: editProfileData.parent_name || 'Mamma' }
          : p
      );
      setProfiles(updatedProfiles);

      if (activeProfile?.id === editingProfile) {
        setActiveProfile({ 
          ...activeProfile, 
          name: editProfileData.name, 
          class: editProfileData.class,
          chapter_tracking_mode: editProfileData.chapter_tracking_mode,
          parent_name: editProfileData.parent_name || 'Mamma'
        });
      }

      setEditingProfile(null);
      setEditProfileData({ name: '', class: '', chapter_tracking_mode: 'smart', parent_name: '' });
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

  // Create test profile with sample data
  const createTestProfile = async () => {
    if (!session?.user?.id) return;

    try {
      // 1. Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: session.user.id,
          name: 'Tester',
          class: 'Test Lab',
          chapter_tracking_mode: 'smart'
        }])
        .select();

      if (profileError) throw profileError;
      if (!profileData || profileData.length === 0) throw new Error('No profile data returned');

      const testProfile = profileData[0];

      // 2. Create sample subjects (6 → triggers Knowledge Seeker badge)
      const subjectNames = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art'];
      const { error: subjectError } = await supabase
        .from('subjects')
        .insert(subjectNames.map(name => ({
          profile_id: testProfile.id,
          name,
          chapters: [
            { name: `${name} Ch.1`, status: 'completed', completedDate: new Date().toISOString().split('T')[0] },
            { name: `${name} Ch.2`, status: 'in-progress' },
            { name: `${name} Ch.3`, status: 'not-started' }
          ]
        })));

      if (subjectError) console.error('Error creating test subjects:', subjectError);

      // 3. Create tasks — enough to trigger multiple badges
      const today = new Date().toISOString().split('T')[0];

      // Build date strings for the week
      const weekDates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weekDates.push(d.toISOString().split('T')[0]);
      }

      const sampleTasks = [];

      // Today: 6 completed tasks @ 30min each = 3 hours (Study Rockstar + Keep Going + Task Master)
      for (let i = 0; i < 6; i++) {
        sampleTasks.push({
          profile_id: testProfile.id,
          subject: subjectNames[i % subjectNames.length],
          chapter: `${subjectNames[i % subjectNames.length]} Ch.1`,
          activity: ['Read chapter', 'Practice problems', 'Review notes', 'Watch video', 'Take quiz', 'Revision'][i],
          duration: 30,
          date: today,
          completed: true,
          task_type: null,
          carryover_days: 0
        });
      }

      // Past 6 days: 3 completed tasks/day @ 40min each = 2hrs/day, 12hrs total
      // Combined with today's 3hrs = ~15hrs/week (Study Champion)
      for (let d = 0; d < 6; d++) {
        for (let t = 0; t < 3; t++) {
          sampleTasks.push({
            profile_id: testProfile.id,
            subject: subjectNames[(d + t) % subjectNames.length],
            chapter: `${subjectNames[(d + t) % subjectNames.length]} Ch.${(t % 3) + 1}`,
            activity: ['Read chapter', 'Practice problems', 'Review notes'][t],
            duration: 40,
            date: weekDates[d],
            completed: true,
            task_type: null,
            carryover_days: 0
          });
        }
      }

      // Add 2 incomplete tasks for realism (still 90%+ completion rate → Star Student)
      sampleTasks.push({
        profile_id: testProfile.id,
        subject: 'Mathematics',
        activity: 'Extra practice',
        duration: 20,
        date: today,
        completed: false,
        task_type: null,
        carryover_days: 0
      });
      sampleTasks.push({
        profile_id: testProfile.id,
        subject: 'Science',
        activity: 'Lab report',
        duration: 25,
        date: today,
        completed: false,
        task_type: null,
        carryover_days: 0
      });

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(sampleTasks);

      if (taskError) console.error('Error creating test tasks:', taskError);

      // 4. Update local state
      setProfiles(prev => [...prev, testProfile]);
      setActiveProfile(testProfile);

      console.log('✅ Test profile "Tester" created with sample data!');
      console.log('   📚 6 subjects, 26 tasks (24 completed)');
      console.log('   🏆 Should unlock: Knowledge Seeker, Star Student, Task Master, Keep Going, Study Rockstar, Weekly Warrior, Study Champion');

      return testProfile;
    } catch (error) {
      console.error('Error creating test profile:', error);
      alert('Failed to create test profile: ' + error.message);
    }
  };

  // Save account name
  const saveAccountName = () => {
    localStorage.setItem('accountName', tempAccountName);
    setAccountName(tempAccountName);
    setEditingAccountName(false);
  };

  // Set parent type (mother/father)
  const setParentType = (type) => {
    localStorage.setItem('parentType', type);
    setParentTypeState(type);
  };

  // Save parent photo (for celebration display)
  const saveParentPhoto = (base64) => {
    localStorage.setItem('parentPhoto', base64);
    setParentPhoto(base64);
  };

  // Remove parent photo
  const removeParentPhoto = () => {
    localStorage.removeItem('parentPhoto');
    setParentPhoto(null);
  };

  // Handle parent photo file upload
  const handleParentPhotoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      saveParentPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Start editing profile
  const startEditProfile = (profile) => {
    setEditingProfile(profile.id);
    setEditProfileData({ 
      name: profile.name, 
      class: profile.class,
      chapter_tracking_mode: profile.chapter_tracking_mode || 'smart',
      parent_name: profile.parent_name || ''
    });
  };

  // Cancel editing
  const cancelEditProfile = () => {
    setEditingProfile(null);
    setEditProfileData({ name: '', class: '', chapter_tracking_mode: 'smart', parent_name: '' });
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
    newProfilePic,
    newParentName,
    showProfileModal,
    accountName,
    editingAccountName,
    tempAccountName,
    parentPhoto,
    parentType,
    profileTab,
    editingProfile,
    editProfileData,
    deletingProfileId,
    
    // Setters
    setActiveProfile,
    setShowAddProfile,
    setNewProfileName,
    setNewProfileClass,
    setNewProfilePic,
    setNewParentName,
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
    createTestProfile,
    saveAccountName,
    setParentType,
    saveParentPhoto,
    removeParentPhoto,
    handleParentPhotoUpload,
    startEditProfile,
    cancelEditProfile,
    loadProfiles,
    
    // Profile pic actions
    getProfilePic,
    setProfilePic,
    removeProfilePic,
    handleProfilePicUpload
  };
};
