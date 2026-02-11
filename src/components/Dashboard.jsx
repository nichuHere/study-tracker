import React, { useMemo } from 'react';
import { 
  Clock, Target, TrendingUp, Zap, Lock
} from 'lucide-react';
import { getTodayDateIST } from '../utils/helpers';
import BadgeIcon from './BadgeIcon';
import { BADGE_ID_MAP } from '../utils/badgeIcons';

// Define ALL possible badges
const ALL_BADGES = [
  // Daily Study Badges
  {
    id: 'keep-going',
    name: 'Keep Going',
    description: '2 hours study today',
    requirement: 'Study for 2+ hours in one day',
    tier: 'rare',
    category: 'daily',
    checkUnlocked: (s) => s.studyMinutesToday >= 120
  },
  {
    id: 'study-rockstar',
    name: 'Study Rockstar',
    description: '3 hours study today',
    requirement: 'Study for 3+ hours in one day',
    tier: 'legendary',
    category: 'daily',
    checkUnlocked: (s) => s.studyMinutesToday >= 180,
    animate: true
  },
  // Weekly Study Badges
  {
    id: 'weekly-warrior',
    name: 'Weekly Warrior',
    description: '10 hrs this week',
    requirement: 'Study for 10+ hours per week',
    tier: 'rare',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 600
  },
  {
    id: 'study-champion',
    name: 'Study Champion',
    description: '15 hrs this week',
    requirement: 'Study for 15+ hours per week',
    tier: 'epic',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 900
  },
  {
    id: 'ultimate-scholar',
    name: 'Ultimate Scholar',
    description: '21+ hrs this week!',
    requirement: 'Study for 21+ hours per week',
    tier: 'legendary',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 1260,
    animate: true,
    special: true
  },
  // Achievement Badges
  {
    id: 'star-student',
    name: 'Star Student',
    description: '80%+ completion',
    requirement: '80%+ task completion rate',
    tier: 'common',
    category: 'achievement',
    checkUnlocked: (s) => s.completionRate >= 80
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: '5+ tasks today',
    requirement: 'Complete 5+ tasks in one day',
    tier: 'rare',
    category: 'achievement',
    checkUnlocked: (s) => s.completedToday >= 5
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: '5+ subjects',
    requirement: 'Study 5+ different subjects',
    tier: 'common',
    category: 'achievement',
    checkUnlocked: (s) => s.totalSubjects >= 5
  }
];

const Dashboard = ({ 
  tasks, 
  exams, 
  subjects, 
  profiles, 
  activeProfile 
}) => {
  // Calculate stats
  const stats = useMemo(() => {
    const today = getTodayDateIST();
    const todayTasks = tasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed);
    const totalMinutesToday = completedToday.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Calculate weekly study time (last 7 days)
    const todayDate = new Date(today);
    const weekAgo = new Date(todayDate);
    weekAgo.setDate(weekAgo.getDate() - 6); // Last 7 days including today
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weeklyTasks = tasks.filter(t => {
      return t.completed && t.date >= weekAgoStr && t.date <= today;
    });
    const totalMinutesWeek = weeklyTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Get all tasks for this profile
    const allTasks = tasks;
    const allCompleted = allTasks.filter(t => t.completed);
    
    // Calculate completion percentage
    const completionRate = allTasks.length > 0 
      ? Math.round((allCompleted.length / allTasks.length) * 100)
      : 0;
    
    // Upcoming exams
    const upcomingExams = exams.filter(exam => {
      const examDates = exam.subjects?.map(s => s.date) || [];
      return examDates.some(date => date >= today);
    }).length;

    return {
      completionRate,
      completedToday: completedToday.length,
      totalToday: todayTasks.length,
      studyMinutesToday: totalMinutesToday,
      studyHoursToday: Math.floor(totalMinutesToday / 60),
      studyMinutesWeek: totalMinutesWeek,
      studyHoursWeek: Math.floor(totalMinutesWeek / 60),
      upcomingExams,
      totalSubjects: subjects.length,
    };
  }, [tasks, exams, subjects]);

  // Get all badges with locked/unlocked status
  const allBadgesWithStatus = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      unlocked: badge.checkUnlocked({ ...stats, totalSubjects: subjects.length })
    }));
  }, [stats, subjects.length]);

  // Mock leaderboard data (you can replace with real profile stats)
  const leaderboard = useMemo(() => {
    return profiles.map(p => ({
      ...p,
      // You would calculate real stats here from each profile's tasks
      points: Math.floor(Math.random() * 5000) + 1000,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  }, [profiles]);

  const subjectIcons = {
    'Mathematics': '🔢',
    'Science': '🔬',
    'English': '📚',
    'Social Studies': '🌍',
    'History': '📜',
    'Geography': '🗺️',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Computer Science': '💻',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {activeProfile?.name || 'Student'}! 👋
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Completion Card */}
              <div className="bg-pastel-blue-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                  <CheckCircleIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {stats.completionRate}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.completedToday}/{stats.totalToday} tasks today
                </p>
              </div>

              {/* Subjects Card */}
              <div className="bg-pastel-purple-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Today</span>
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.floor(stats.studyMinutesToday / 60)}<span className="text-2xl">.{Math.floor((stats.studyMinutesToday % 60) / 6)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  hours studied today
                </p>
              </div>

              {/* Study Hours Card */}
              <div className="bg-pastel-pink-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">This Week</span>
                  <TrendingUp className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.floor(stats.studyMinutesWeek / 60)}<span className="text-2xl">h</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.studyMinutesWeek} mins total
                </p>
              </div>
            </div>

            {/* Select Category - Subjects */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">Select Subject</h2>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {subjects.length}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {subjects.slice(0, 8).map((subject, idx) => {
                  const colors = [
                    'bg-red-50 text-red-600',
                    'bg-blue-50 text-blue-600',
                    'bg-green-50 text-green-600',
                    'bg-purple-50 text-purple-600',
                    'bg-orange-50 text-orange-600',
                    'bg-pink-50 text-pink-600',
                    'bg-cyan-50 text-cyan-600',
                    'bg-amber-50 text-amber-600',
                  ];
                  const colorClass = colors[idx % colors.length];
                  
                  return (
                    <button
                      key={subject.id}
                      className={`${colorClass} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <div className="text-3xl mb-2">
                        {subjectIcons[subject.name] || '📖'}
                      </div>
                      <div className="text-xs font-semibold truncate">
                        {subject.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Today's Progress</h2>
                <button className="text-sm text-accent-blue hover:underline">
                  View all
                </button>
              </div>
              
              {/* Simple bar chart */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Completed</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.completedToday / Math.max(stats.totalToday, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {stats.completedToday}/{stats.totalToday}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Study Time</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.studyMinutesToday / 240) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {stats.studyMinutesToday}m
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Weekly</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.studyMinutesWeek / 1260) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {Math.floor(stats.studyMinutesWeek / 60)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">Badge Collection</h2>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {allBadgesWithStatus.filter(b => b.unlocked).length}/{allBadgesWithStatus.length}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Locked
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadgesWithStatus.map((badge) => {
                  return (
                    <div
                      key={badge.id}
                      className={`text-center transition-all duration-200 cursor-pointer relative ${
                        badge.unlocked 
                          ? 'hover:scale-110'
                          : 'opacity-60'
                      }`}
                      title={badge.unlocked ? badge.description : badge.requirement}
                    >
                      {/* Badge Icon */}
                      <div className={`w-28 h-28 mx-auto mb-1 flex items-center justify-center transition-transform duration-200 ${
                        badge.special && badge.unlocked ? 'drop-shadow-lg' : ''
                      }`}>
                        <BadgeIcon
                          badgeId={BADGE_ID_MAP[badge.id] || badge.id}
                          state={badge.unlocked ? 'enabled' : 'disabled'}
                          size={96}
                          decorative={false}
                        />
                      </div>
                      
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        badge.unlocked ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </div>
                      <div className={`text-[10px] ${
                        badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {badge.unlocked ? badge.description : badge.requirement}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Category Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200"></div>
                  <span className="text-gray-600">Daily</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200"></div>
                  <span className="text-gray-600">Weekly</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-200 to-pink-200"></div>
                  <span className="text-gray-600">Achievement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Leaderboard</h2>
              
              <div className="space-y-3">
                {leaderboard.map((profile, idx) => {
                  const colors = [
                    'bg-pastel-orange-light',
                    'bg-pastel-green-light', 
                    'bg-pastel-coral-light',
                    'bg-gray-50',
                    'bg-gray-50',
                  ];
                  const bgColor = colors[idx];
                  const rankColors = ['text-yellow-600', 'text-gray-400', 'text-orange-600'];
                  
                  return (
                    <div
                      key={profile.id}
                      className={`${bgColor} rounded-xl p-4 flex items-center gap-3 hover:scale-102 transition-transform`}
                    >
                      <div className={`text-2xl font-bold ${rankColors[idx] || 'text-gray-400'} w-8`}>
                        #{idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {profile.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">
                          {profile.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {profile.class}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-accent-blue">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-bold">{profile.points}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {profiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Add profiles to see rankings! 👥
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl p-6 shadow-card text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Upcoming Exams</span>
                  <span className="font-bold text-lg">{stats.upcomingExams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Subjects</span>
                  <span className="font-bold text-lg">{stats.totalSubjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Today's Tasks</span>
                  <span className="font-bold text-lg">{stats.totalToday}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple CheckCircle icon component
const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;
